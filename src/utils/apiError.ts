import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type UnknownErr = FetchBaseQueryError | SerializedError | Error | unknown;

export function getApiErrorMessage(err: UnknownErr, fallback = "Something went wrong"): string {
	if (!err) return fallback;

	if (typeof err === "object" && err !== null) {
		const anyErr = err as { data?: unknown; message?: unknown; error?: unknown };
		const data = anyErr.data;
		if (data && typeof data === "object") {
			const msg = (data as { message?: unknown }).message;
			if (typeof msg === "string" && msg.length > 0) return msg;
		}
		if (typeof anyErr.message === "string" && anyErr.message.length > 0) return anyErr.message;
		if (typeof anyErr.error === "string" && anyErr.error.length > 0) return anyErr.error;
	}

	return fallback;
}
