import {
    AppBar,
    Box,
    IconButton,
    Stack,
    Toolbar,
    Typography,
    useTheme
} from "@mui/material";
import { HamburgerMenu } from "iconsax-reactjs";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../store/hook";
import { getGreetingKey } from "../../../../utils/greeting";
import { getTodayADFormatted, getTodayBSFormatted } from "../../../../utils/nepaliDate";
import MobileCalendarDrawer from "./MobileCalendarDrawer";
import NotificationModal from "./Notification";
import SettingMenu from "./Setting";

export default function CustomAppbar({
    handleDrawerToggle,
    handleDesktopCollapse,
    desktopCollapsed,
}: {
    handleDrawerToggle: () => void;
    handleDesktopCollapse: () => void;
    desktopCollapsed: boolean;
}) {
    const theme = useTheme();
    const { mode, lang } = useAppSelector((state) => state.udaan_theme);
    const { user } = useAppSelector((state) => state.auth);
    const { t } = useTranslation();

    const DRAWER_EXPANDED = 252;
    const DRAWER_COLLAPSED = 68;
    const drawerWidth = desktopCollapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

    const nepaliDate = getTodayBSFormatted(lang === "np" ? "np" : "en");
    const adDate = getTodayADFormatted();

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { lg: `calc(100% - ${drawerWidth}px)` },
                ml: { lg: `${drawerWidth}px` },
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 0,
                height: 58,
                justifyContent: "center",
                padding: { xs: "0 12px", lg: "0 24px" },
                backgroundColor: (theme) => mode === "dark" ? theme.palette.background.paper : theme.palette.primary.contrastText,
                transition: "width 0.25s ease, margin-left 0.25s ease",
            }}
            color="default"
            elevation={0}
        >
            <Toolbar disableGutters sx={{ minHeight: "58px !important" }}>
                <Stack sx={{ flexDirection: "row", alignItems: "center", justifyContent: "start", width: "100%" }}>
                    {/* Mobile ham */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: { lg: "none" },
                            minHeight: "40px",
                            aspectRatio: "1/1",
                            ml: 0,
                            background: (theme) => theme.palette.separator.dark,
                            "&:hover": { backgroundColor: (theme) => theme.palette.action.hover },
                        }}
                    >
                        <HamburgerMenu size={18} color={theme.palette.separator.darkest} />
                    </IconButton>

                    {/* Desktop ham (collapse/expand sidebar) */}
                    <IconButton
                        color="inherit"
                        aria-label="toggle sidebar"
                        edge="start"
                        onClick={handleDesktopCollapse}
                        sx={{
                            mr: 2,
                            display: { xs: "none", lg: "flex" },
                            minHeight: "40px",
                            aspectRatio: "1/1",
                            background: (theme) => theme.palette.separator.dark,
                            "&:hover": { backgroundColor: (theme) => theme.palette.action.hover },
                        }}
                    >
                        <HamburgerMenu size={18} color={theme.palette.separator.darkest} />
                    </IconButton>

                    <div className="flex justify-between flex-wrap">
                        <div className="user_message">
                            <Typography
                                className="w-full"
                                sx={{
                                    typography: { xs: "overline", sm: "subtitle2", md: "body1" },
                                    display: "flex",
                                    flexDirection: "column",
                                    lineHeight: 1.3,
                                    fontWeight: { xs: 700, sm: 700, md: 600 },
                                }}
                            >
                                <span>
                                    {t(getGreetingKey(user?.dob as string))},{" "}
                                    <Box component="span" className="text-nowrap">
                                        {user?.name}
                                    </Box>
                                </span>
                            </Typography>
                            <Typography variant="subtitle2" className="mt-1! hidden sm:block" fontWeight={400} sx={{ opacity: 0.85 }}>
                                {getGreetingKey(user?.dob as string) === "messages.birthday"
                                    ? "Wishing you a wonderful day filled with joy!"
                                    : "You're making great progress. Keep exploring!"}
                            </Typography>
                        </div>
                    </div>
                </Stack>

                <Stack sx={{ flexDirection: "row", alignItems: "center", justifyContent: "end", width: "100%" }}>
                    <Box className="flex gap-2 items-center justify-end lg:gap-3 w-full">
                        {/* Nepali date pill */}
                        <Box
                            sx={{
                                display: { xs: "none", md: "flex" },
                                alignItems: "center",
                                px: 1.5,
                                py: 1,
                                borderRadius: "20px",
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                background: (theme) => theme.palette.separator.dark,
                                whiteSpace: "nowrap",
                                gap: 0.75,
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.85, fontSize: "11px", lineHeight: 1.3 }}>
                                    {nepaliDate} <Box component="span" sx={{ opacity: 0.5, fontWeight: 500 }}>BS</Box>
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 500, opacity: 0.6, fontSize: "10px", lineHeight: 1.3 }}>
                                    {adDate} <Box component="span" sx={{ opacity: 0.7, fontWeight: 500 }}>AD</Box>
                                </Typography>
                            </Box>
                        </Box>

                        <MobileCalendarDrawer />
                        <NotificationModal />
                        <SettingMenu />
                    </Box>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
