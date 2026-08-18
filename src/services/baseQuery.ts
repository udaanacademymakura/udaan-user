import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../slice/authSlice";
import { showSessionExpired } from "../slice/sessionSlice";
import { showToast } from "../slice/toastSlice";
import type { RootState } from "../store/store";
import { parseDeviceConflict } from "../utils/deviceConflict";
import { getDeviceFingerprint, getDeviceId } from "../utils/deviceId";
import { getDeviceSignalsHeader } from "../utils/deviceSignals";

// Sending an unexpected header fails CORS preflight and takes down every request, so this
// stays off until the API allow-lists X-Device-Fingerprint and X-Device-Signals in
// Access-Control-Allow-Headers. Gated separately from VITE_DEVICE_ID_RANDOM, which
// changes no wire format and can ship first.
const SEND_DEVICE_SIGNALS = import.meta.env.VITE_DEVICE_SIGNALS === "true";

// A 401 from these is a credential/OTP failure, not a revoked session. The forms own
// the messaging; surfacing the global popup here shows "signed out on another device"
// to somebody who simply mistyped their password.
const CREDENTIAL_ENDPOINTS = [
	"/auth/login",
	"/auth/register",
	"/auth/verify-otp",
	"/auth/resend-otp",
	"/auth/has-user",
	"/auth/bridge",
	"/auth/reset-password",
	"/auth/forgot-password",
	"/reset-request",
];

function requestPath(args: string | FetchArgs): string {
	return typeof args === "string" ? args : args.url;
}

function isCredentialRequest(args: string | FetchArgs): boolean {
	const path = requestPath(args).split("?")[0];
	return CREDENTIAL_ENDPOINTS.some((endpoint) => path.startsWith(endpoint));
}

const baseQueryConfig = fetchBaseQuery({
	baseUrl: (import.meta.env.VITE_API_BASE_URL || "") + "/api/v1",
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		const accessToken = (getState() as RootState).auth?.token;

		headers.set("X-Device-Id", getDeviceId());
		headers.set("X-Device-Type", "web");

		if (SEND_DEVICE_SIGNALS) {
			headers.set("X-Device-Fingerprint", getDeviceFingerprint());
			headers.set("X-Device-Signals", getDeviceSignalsHeader());
		}

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

	if (!result.error) return result;

	const errorData = result.error.data as { status?: number } | undefined;
	const isUnauthorized =
		result.error.status === 401 || errorData?.status === 401;

	if (!isUnauthorized || isCredentialRequest(args)) return result;

	const state = api.getState() as RootState;
	if (!state.auth?.token) return result;

	if (parseDeviceConflict(result.error)) {
		if (!state.session?.showSessionExpiredPopup) {
			api.dispatch(
				showSessionExpired(
					"Your session has expired due to a login from another device. Please verify it's you to continue.",
				),
			);
		}
		return result;
	}

	api.dispatch(logout());
	api.dispatch(
		showToast({
			message: "Your session has expired. Please sign in again.",
			severity: "info",
		}),
	);

	return result;
};
