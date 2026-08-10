import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PATH } from "../routes/PATH";

export const REDIRECT_PARAM = "redirect_link";

const LEGACY_REDIRECT_PARAM = "redirect_url";
const STORAGE_KEY = "pending_redirect_link";

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const sanitize = (value: string | null): string => {
    const link = value?.trim();
    if (!link) return "";

    if (SCHEME.test(link)) {
        // Absolute URLs are only honoured when they point back at this app;
        // everything else (javascript:, data:, other hosts) is discarded
        if (!/^https?:/i.test(link)) return "";
        try {
            const url = new URL(link);
            if (url.origin !== window.location.origin) return "";
            return `${url.pathname}${url.search}${url.hash}`;
        } catch {
            return "";
        }
    }

    if (link.startsWith("//")) return "";
    return link.startsWith("/") ? link : `/${link}`;
};

const readStored = (): string => {
    try {
        return sanitize(sessionStorage.getItem(STORAGE_KEY));
    } catch {
        return "";
    }
};

export const rememberRedirectLink = (link: string) => {
    if (!link) return;
    try {
        sessionStorage.setItem(STORAGE_KEY, link);
    } catch {
        /* storage unavailable — the query param still carries the link */
    }
};

export const clearRedirectLink = () => {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        /* storage unavailable */
    }
};

export const getRedirectLink = (searchParams: URLSearchParams): string => {
    const fromUrl =
        sanitize(searchParams.get(REDIRECT_PARAM)) ||
        sanitize(searchParams.get(LEGACY_REDIRECT_PARAM));
    if (fromUrl) return fromUrl;

    const courseId = searchParams.get("course");
    const testId = searchParams.get("test");
    const bundleId = searchParams.get("bundle");
    if (courseId) return PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(Number(courseId));
    if (testId) return PATH.TEST.ROOT;
    if (bundleId) return PATH.TEST.EXPLORE_TEST.BUNDLE_TEST.VIEW_BUNDLE.ROOT(Number(bundleId));
    return "";
};

export const withRedirectLink = (path: string, redirectLink: string): string => {
    if (!redirectLink) return path;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${REDIRECT_PARAM}=${encodeURIComponent(redirectLink)}`;
};

/**
 * The auth flow spans several navigations (register → OTP → interest), any of which
 * can drop the query string. Mirroring the link into sessionStorage keeps the intent
 * alive until it is consumed.
 */
export const usePendingRedirect = (): string => {
    const [searchParams] = useSearchParams();
    const fromUrl = getRedirectLink(searchParams);

    useEffect(() => {
        rememberRedirectLink(fromUrl);
    }, [fromUrl]);

    return fromUrl || readStored();
};
