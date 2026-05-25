import type { Dayjs } from "dayjs";
import type { Pagination } from ".";

export type PermissionProps = string[];
export type Token = {
	access_token: string;
} | null;

export interface RegisterUserProps {
	id?: string;
	name: string;
	email: string;
	phone: string;
	thumbnail?: File | null;
	thumbnail_url?: string;
	interested_categories?: number[];
	address?: string;
	role?: {
		id: string;
		name: string;
	};
	password?: string;
	password_confirmation?: string;
	designation?: string;
	live_preview?: File | null;
	live_preview_url?: string;
}

export const RegisterUserInitialData: RegisterUserProps = {
	name: "",
	email: "",
	phone: "",
	role: {
		name: "",
		id: ""
	},
	password: "",
	password_confirmation: "",
	thumbnail: null,
	thumbnail_url: "",
	designation: "",
	live_preview: null,
	live_preview_url: "",
}

export interface LoginUserProps {
	phone: string
	otp: string;
}

export interface GlobalResponse {
	message: string;
	status: string;
}

export type Gender = "male" | "female" | "other";
export interface User extends RegisterUserProps {
	has_password?: boolean;
	permissions: PermissionProps;
	joined_date: string;
	gender: Gender
	country: string;
	province: string;
	city: string
	dob: string | Dayjs
	// role: string[];
}

type NewDeviceDetectedData = {
	new_device_detected: true;
	has_pending_request: boolean;
	device_location?: string;
	user_id: string;
	user: null;
	token: null;
};

type AuthSuccessData = {
	new_device_detected?: false;
	user: User;
	token: Token;
};

export interface UserResponse extends GlobalResponse {
	data: NewDeviceDetectedData | AuthSuccessData;
}

// Returned by authBridge — always a successful auth, never triggers device detection.
export interface AuthBridgeResponse extends GlobalResponse {
	data: {
		user: User;
		token: Token;
	};
}

export interface DeviceResetRequestPayload {
	reason?: string;
	situation: string;
	user_id: string;
	device_type: "web";
}


export interface UserList extends GlobalResponse {
	data: {
		data: RegisterUserProps[];
		pagination: Pagination;
	}
}