export const DEVICE_SIGNALS_VERSION = "1";

interface SignalSpec {
	key: string;
	read: () => string;
}

function browserFamily(): string {
	const ua = navigator.userAgent;
	if (/Edg\//.test(ua)) return "edge";
	if (/OPR\/|Opera/.test(ua)) return "opera";
	if (/Firefox\//.test(ua)) return "firefox";
	if (/Chrome\//.test(ua)) return "chrome";
	if (/Safari\//.test(ua)) return "safari";
	return "other";
}

// CSS pixels shift when the OS display scaling changes, so multiply back to physical
// pixels. Sorted so a phone rotating does not read as a different screen.
function physicalScreen(): string {
	const ratio = window.devicePixelRatio || 1;
	const a = Math.round(screen.width * ratio);
	const b = Math.round(screen.height * ratio);
	return `${Math.min(a, b)}x${Math.max(a, b)}`;
}

function webgl(): { vendor: string; renderer: string } {
	try {
		const canvas = document.createElement("canvas");
		const gl = (canvas.getContext("webgl") ??
			canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
		if (!gl) return { vendor: "", renderer: "" };

		const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
		const vendor = debugInfo
			? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? "")
			: "";
		const renderer = debugInfo
			? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "")
			: "";

		gl.getExtension("WEBGL_lose_context")?.loseContext();

		return {
			vendor: vendor === "Mozilla" ? "" : vendor,
			renderer: renderer === "Mozilla" ? "" : renderer,
		};
	} catch {
		return { vendor: "", renderer: "" };
	}
}

// Anchors (plat, br, touch) are the signals the backend must require an exact match on.
// Everything else is drift-tolerant — weights and the pass threshold live server-side so
// policy can be retuned without shipping a new bundle.
function specs(): SignalSpec[] {
	const nav = navigator as Navigator & {
		deviceMemory?: number;
		userAgentData?: { platform?: string };
	};
	const gpu = webgl();

	return [
		{ key: "plat", read: () => nav.userAgentData?.platform ?? nav.platform ?? "" },
		{ key: "br", read: browserFamily },
		{ key: "touch", read: () => ((nav.maxTouchPoints ?? 0) > 0 ? "1" : "0") },
		{ key: "cores", read: () => String(nav.hardwareConcurrency ?? "") },
		{ key: "mem", read: () => String(nav.deviceMemory ?? "") },
		{
			key: "tz",
			read: () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
		},
		{ key: "scr", read: physicalScreen },
		{ key: "depth", read: () => String(screen.colorDepth ?? "") },
		{ key: "gpuv", read: () => gpu.vendor },
		{ key: "gpu", read: () => gpu.renderer },
		{
			key: "lang",
			read: () =>
				(navigator.languages?.[0] ?? navigator.language ?? "").split("-")[0],
		},
	];
}

function hash16(input: string): string {
	let hash = 2166136261;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return ((hash ^ (hash >>> 16)) & 0xffff).toString(16).padStart(4, "0");
}

let cachedHeader: string | null = null;

// Wire format: "v1;plat:a1b2;br:c3d4;..." — one 16-bit hash per signal so the backend can
// score component-wise instead of comparing one all-or-nothing fingerprint.
export function getDeviceSignalsHeader(): string {
	if (cachedHeader) return cachedHeader;

	const parts = specs().map(({ key, read }) => {
		let value = "";
		try {
			value = read();
		} catch {
			value = "";
		}
		return `${key}:${value ? hash16(value) : "0000"}`;
	});

	cachedHeader = [`v${DEVICE_SIGNALS_VERSION}`, ...parts].join(";");
	return cachedHeader;
}
