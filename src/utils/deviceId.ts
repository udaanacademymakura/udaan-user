const LEGACY_STORAGE_KEY = "device_id";
const COOKIE_KEY = "udn_device_id";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 730;

const DERIVED_ID = /^[0-9a-f]{8}$/;
const RANDOM_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// A random id is unique by construction but cannot be re-derived once storage is cleared,
// so each clear then costs one admin reset until the server can match on the recovery
// headers. Changes no wire format — only the id column has to accept 36 characters.
// See DEVICE_RESTRICTION.md.
const RANDOM_IDENTITY = import.meta.env.VITE_DEVICE_ID_RANDOM === "true";

function browserFamily(): string {
	const ua = navigator.userAgent;
	if (/Edg\//.test(ua)) return "edge";
	if (/OPR\/|Opera/.test(ua)) return "opera";
	if (/Firefox\//.test(ua)) return "firefox";
	if (/Chrome\//.test(ua)) return "chrome";
	if (/Safari\//.test(ua)) return "safari";
	return "other";
}

// Only signals that survive a display change, GPU switch, driver update or browser update
// belong here. Screen size, colour depth and the WebGL renderer all drift on a laptop
// (external monitor, scaling change, integrated/discrete GPU switch), which silently
// rotated the device id and locked legitimate users out.
function stableSignals(): string {
	const nav = navigator as Navigator & {
		deviceMemory?: number;
		userAgentData?: { platform?: string };
	};

	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
	const platform = nav.userAgentData?.platform ?? nav.platform ?? "";
	const cores = String(nav.hardwareConcurrency ?? "");
	const memory = String(nav.deviceMemory ?? "");
	const touchPoints = String(nav.maxTouchPoints ?? "");
	const language = (navigator.languages?.[0] ?? navigator.language ?? "").split(
		"-",
	)[0];

	return [
		timezone,
		platform,
		cores,
		memory,
		touchPoints,
		language,
		browserFamily(),
	].join("|");
}

function fnv1a(input: string, seed: number): number {
	let hash = seed >>> 0;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash >>> 0;
}

function toHex8(value: number): string {
	return value.toString(16).padStart(8, "0");
}

function randomId(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	const bytes = new Uint8Array(16);
	if (typeof crypto !== "undefined" && crypto.getRandomValues) {
		crypto.getRandomValues(bytes);
	} else {
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = Math.floor(Math.random() * 256);
		}
	}
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20),
	].join("-");
}

function isKnownId(value: string | null): value is string {
	return !!value && (DERIVED_ID.test(value) || RANDOM_ID.test(value));
}

function readCookie(): string | null {
	const match = document.cookie.match(
		new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]*)`),
	);
	return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(id: string): void {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${COOKIE_KEY}=${id}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

// Written unserialised on purpose — localStorageUtil JSON-encodes, and this key predates
// it. Wrapping the value in quotes would invalidate every already-registered device.
function readStoredId(): string | null {
	try {
		return localStorage.getItem(LEGACY_STORAGE_KEY);
	} catch {
		return null;
	}
}

function persist(id: string): void {
	try {
		localStorage.setItem(LEGACY_STORAGE_KEY, id);
	} catch {
		// Private browsing / storage blocked — the cookie still covers this session.
	}
	try {
		writeCookie(id);
	} catch {
		// Cookies blocked.
	}
}

let resolvedId: string | null = null;

export function getDeviceId(): string {
	if (resolvedId) return resolvedId;

	const stored = readStoredId();
	const cookie = readCookie();

	let id: string;
	if (isKnownId(stored)) {
		id = stored;
	} else if (isKnownId(cookie)) {
		id = cookie;
	} else {
		id = RANDOM_IDENTITY
			? randomId()
			: toHex8(fnv1a(stableSignals(), 2166136261));
	}

	persist(id);
	resolvedId = id;
	return id;
}

export function getDeviceFingerprint(): string {
	const signals = stableSignals();
	return toHex8(fnv1a(signals, 2166136261)) + toHex8(fnv1a(signals, 0x9e3779b9));
}
