import type { Pagination } from ".";

export type PaymentMode = "test" | "live";

export interface PaymentGateway {
    slug: string;
    name: string;
    is_active: boolean;
}

export interface EsewaSettingProps {
    merchant_id: string | null;
    product_code: string | null;
    secret_key: string | null;
    merchant_secret: string | null;
    mode: PaymentMode;
    is_active: boolean;
    urls?: {
        payment_url: string;
        payment_check_url: string;
        checkurl_mobile: string;
    };
}

export interface KhaltiSettingProps {
    public_key: string | null;
    secret_key: string | null;
    mode: PaymentMode;
    is_active: boolean;
    urls?: {
        api_url: string;
    };
}

export interface PhoneItem {
    label: string;
    value: string;
    icon_url?: string;
}

export interface EmailItem {
    label: string;
    value: string;
    icon_url?: string;
}

export interface SocialItem {
    label: string;
    value: string;
    link: string;
    icon_url?: string;
}

export interface AppSettingProps {
    phones: PhoneItem[];
    emails: EmailItem[];
    socials: SocialItem[];
    map: string;
}


export interface LinkedDeviceProps {
    id: number,
    os: string | null,
    browser: string | null,
    location: string | null,
    ip: string | null;
    created_at: string,
    updated_at: string
}

export interface LinkedDeviceList {
    data: {
        data: LinkedDeviceProps[],
        pagination: Pagination
    }
}

export type LoginType = "otp" | "password" | "both";

export interface LoginTypeSettingProps {
    login_type: LoginType;
}

export interface ThemeSettingProps {
    company_name: string;
    brand_name: string;
    tagline: string;
    meta_description: string;
    logo_url?: string;
    logo_dark_url?: string;
    favicon_url?: string;
}