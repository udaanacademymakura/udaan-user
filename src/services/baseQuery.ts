import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { showSessionExpired } from "../slice/sessionSlice";
import type { RootState } from "../store/store";

function collectHardwareSignals(): string {
	const nav = navigator as Navigator & {
		deviceMemory?: number;
		userAgentData?: { platform: string };
	};

	const screen_res = `${screen.width}x${screen.height}x${screen.colorDepth}`;
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const cpu_cores = String(nav.hardwareConcurrency ?? "");
	const memory = String(nav.deviceMemory ?? "");
	const platform = nav.userAgentData?.platform ?? nav.platform ?? "";

	let webgl_vendor = "";
	let webgl_renderer = "";
	try {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
		if (gl) {
			const dbgInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
			if (dbgInfo) {
				const vendor = (gl as WebGLRenderingContext).getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL) as string;
				const renderer = (gl as WebGLRenderingContext).getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) as string;
				if (vendor !== "Mozilla") webgl_vendor = vendor;
				if (renderer !== "Mozilla") webgl_renderer = renderer;
			}
		}
	} catch {
	}

	return [screen_res, timezone, cpu_cores, memory, platform, webgl_vendor, webgl_renderer].join("|");
}

function fnv1a(str: string): string {
	let hash = 2166136261;
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = (hash * 16777619) >>> 0;
	}
	return hash.toString(16).padStart(8, "0");
}

const getDeviceId = (): string => {
	const CACHE_KEY = "device_id";
	const cached = localStorage.getItem(CACHE_KEY);
	if (cached && cached.length === 8) return cached;

	const fingerprint = fnv1a(collectHardwareSignals());

	try {
		localStorage.setItem(CACHE_KEY, fingerprint);
	} catch {

	}
	return fingerprint;
};

const baseQueryConfig = fetchBaseQuery({
	baseUrl: (import.meta.env.VITE_API_BASE_URL || "") + "/api/v1",
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		const accessToken = (getState() as RootState).auth?.token;

		headers.set("X-Device-Id", getDeviceId());
		headers.set("X-Device-Type", "web");

		if (accessToken) {
			headers.set("Authorization", `Bearer ${accessToken?.access_token}`);
		}

		return headers;
	},
});

export const baseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const result = await baseQueryConfig(args, api, extraOptions);

	if (result.error) {
		const status = result.error.status;
		if (status === 401 || (result.error.data && (result.error.data as any)?.status === 401)) {


			const state = api.getState() as RootState;

			if (!state.session?.showSessionExpiredPopup) {
				api.dispatch(
					showSessionExpired(
						"Your session has expired due to a login from another device. Please verify it's you to continue."
					)
				);
			}
		}
	}

	return result;
};