import type { Pagination } from ".";

// Deliberately narrower than the API response: the student portal must never
// hold client_secret / sdk_secret, so they stay untyped and unreadable here.
export interface ZoomAccount {
    id: number;
    sdk_key: string;
}

export interface LiveClassProps {
    id: number;
    name: string;
    account_id: number;
    course_id: number;
    agenda: string;
    description: string;
    zoom_uuid: string;
    duration: number;
    schedule_date: string;
    end_date: string;
    is_recurring: boolean;
    recurring_type: number;
    repeat_interval: number;
    weekly_days: number[];
    monthly_day: number | null;
    start_url: string;
    join_url: string;
    is_active: boolean;
    teachers: Array<{
        id: number;
        name: string;
        thumbnail_url: string | null;
        role: string;
        live_preview_url?: string | null;
    }>;
    teacher_ids: number[];
    is_enable_recording: 0 | 1;
    auto_recording: "cloud" | "local" | "none";
    registration_type: number;
    created_at: string;
    active_students: number;
    courses: number[];
    start_time: string;
    end_time: string;
    status: "ongoing" | "upcoming" | "ended";
};
export interface LiveClassList {
    data: {
        data: LiveClassProps[];
        pagination: Pagination
    }
}