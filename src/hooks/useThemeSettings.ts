import { useGetThemeSettingsQuery } from "../services/settingApi";

export function useThemeSettings() {
    const { data, isLoading } = useGetThemeSettingsQuery();
    const s = data?.data;

    const brandName = s?.brand_name || s?.company_name || "";
    const companyName = s?.company_name || s?.brand_name || "";
    const logoUrl = s?.logo_url || "/logo.svg";
    const logoDarkUrl = s?.logo_dark_url || "/logo-dark.svg";
    const faviconUrl = s?.favicon_url || "/favicon.svg";
    const loginImageUrl = s?.login_image_url || "/auth-image.png";
    const fallbackImageUrl = s?.fallback_image_url || "/fallback.png";

    return {
        brandName,
        companyName,
        tagline: s?.tagline ?? "",
        metaDescription: s?.meta_description ?? "",
        logoUrl,
        logoDarkUrl,
        faviconUrl,
        loginImageUrl,
        fallbackImageUrl,
        isLoading,
    };
}
