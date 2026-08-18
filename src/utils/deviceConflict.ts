export interface DeviceConflict {
	userId?: string;
	deviceLocation?: string;
	hasPendingRequest: boolean;
}

// The API reports a blocked device on the success-shaped body (new_device_detected, with
// user and token nulled) as well as on the error body, so both paths have to be checked.
export function readDeviceConflict(data: unknown): DeviceConflict | null {
	const payload = data as Record<string, unknown> | undefined;
	if (!payload) return null;

	const userId = payload.user_id;
	const deviceLocation = payload.device_location;
	if (payload.new_device_detected !== true && userId == null && deviceLocation == null) {
		return null;
	}

	return {
		userId: userId == null ? undefined : String(userId),
		deviceLocation:
			typeof deviceLocation === "string" && deviceLocation.trim()
				? deviceLocation
				: undefined,
		hasPendingRequest: Boolean(payload.has_pending_request),
	};
}

export function parseDeviceConflict(error: unknown): DeviceConflict | null {
	return readDeviceConflict(
		(error as { data?: { data?: unknown } })?.data?.data,
	);
}
