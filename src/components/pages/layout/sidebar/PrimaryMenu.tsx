import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { AudioSquare, Book, Bookmark, Document, Element4, Gift, I24Support, Notepad2, Notification, Paperclip, PenAdd, SearchNormal, VideoOctagon, VideoPlay } from "iconsax-reactjs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { logout } from "../../../../slice/authSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";

interface PrimaryMenuProps {
  isCollapsed?: boolean;
}

export default function PrimaryMenu({ isCollapsed = false }: PrimaryMenuProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [openTest, setOpenTest] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCollapsed) setOpenTest(false);
  }, [isCollapsed]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const isTestManagementActive = () =>
    location.pathname.startsWith(PATH.TEST.ROOT);

  const wrap = (label: string, children: React.ReactNode) =>
    isCollapsed ? (
      <Tooltip title={label} placement="right" arrow>
        <span>{children}</span>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className={`flex items-center gap-2 overflow-hidden mb-1 mt-6 ${isCollapsed ? "justify-center mt-4" : ""}`}>
      {isCollapsed ? (
        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", width: "60%" }} />
      ) : (
        <>
          <Typography variant="overline" mb={1} sx={{
            color: "rgba(156,163,176,0.55)",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            paddingLeft: "8px",
            whiteSpace: "nowrap",
          }}>{label}</Typography>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} className="w-full" />
        </>
      )}
    </div>
  );

  return (
    <div className="primary__menu__wrapper relative flex flex-col h-full">
      <Box
        sx={{
          padding: isCollapsed ? "16px 4px 32px" : "16px 10px 32px",
          maxHeight: "calc(100vh - 72px - 72px)",
          overflow: "auto",
          flex: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
        className="primary__menu relative"
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden mb-1">
            <Typography variant="overline" mb={1} sx={{
              color: "rgba(156,163,176,0.55)",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              paddingLeft: "8px",
              whiteSpace: "nowrap",
            }}>{t("messages.main")}</Typography>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} className="w-full" />
          </div>
        )}
        {isCollapsed && <Box sx={{ height: 8 }} />}

        <List sx={{ px: isCollapsed ? 0 : undefined }}>
          {wrap(t("menus.dashboard"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.DASHBOARD.ROOT)}
                className={isActive(PATH.DASHBOARD.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Element4 size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.dashboard")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("menus.myCourse"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.MY_COURSE.ROOT)}
                className={isActive(PATH.MY_COURSE.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Book size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.myCourse")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("menus.exploreCourse"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.ROOT)}
                className={isActive(PATH.COURSE_MANAGEMENT.COURSES.ROOT) && !isActive(PATH.COURSE_MANAGEMENT.COURSES.SAVED_COURSES.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <SearchNormal size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.exploreCourse")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("menus.exploreTest"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.TEST.EXPLORE_TEST.ROOT)}
                className={isActive(PATH.TEST.EXPLORE_TEST.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Document size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.exploreTest")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("menus.savedCourse"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.SAVED_COURSES.ROOT)}
                className={isActive(PATH.COURSE_MANAGEMENT.COURSES.SAVED_COURSES.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Bookmark size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.savedCourse")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap("Free Materials",
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.FREE_MATERIALS.ROOT)}
                className={isActive(PATH.FREE_MATERIALS.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Gift size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary="Free Materials" />}
              </ListItemButton>
            </ListItem>
          )}
        </List>

        <SectionLabel label={t("messages.learning")} />

        <List sx={{ px: isCollapsed ? 0 : undefined }}>
          {wrap(t("menus.liveClasses"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.LIVE_CLASSES.ROOT)}
                className={isActive(PATH.LIVE_CLASSES.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <VideoPlay />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.liveClasses")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("menus.notes"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.NOTES.ROOT)}
                className={isActive(PATH.NOTES.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Notepad2 />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.notes")} />}
              </ListItemButton>
            </ListItem>
          )}

          {/* My Test – collapsible sub-menu */}
          {wrap(t("messages.my_test"),
            <ListItem disablePadding className="menu__item" sx={{ flexDirection: "column", alignItems: "stretch" }}>
              <ListItemButton
                onClick={() => !isCollapsed && setOpenTest((prev) => !prev)}
                className={isTestManagementActive() ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <PenAdd size={20} />
                </ListItemIcon>
                {!isCollapsed && (
                  <>
                    <ListItemText primary={t("messages.my_test")} />
                    {openTest ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
              {!isCollapsed && (
                <Collapse in={openTest} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 3 }}>
                    <ListItem disablePadding className="menu__item">
                      <ListItemButton
                        onClick={() => navigate(PATH.TEST.MY_TEST.ROOT)}
                        className={location.pathname.startsWith(PATH.TEST.MY_TEST.ROOT) ? "active-nested" : ""}
                      >
                        <ListItemText primary={t("messages.course_based_tests")} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding className="menu__item">
                      <ListItemButton
                        onClick={() => navigate(PATH.TEST.MY_INDIVIDUAl_TEST.ROOT)}
                        className={location.pathname.startsWith(PATH.TEST.MY_INDIVIDUAl_TEST.ROOT) ? "active-nested" : ""}
                      >
                        <ListItemText primary={t("messages.individually_purchased_tests")} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding className="menu__item">
                      <ListItemButton
                        onClick={() => navigate(PATH.TEST.MY_BUNDLES.ROOT)}
                        className={location.pathname.startsWith(PATH.TEST.MY_BUNDLES.ROOT) ? "active-nested" : ""}
                      >
                        <ListItemText primary={t("messages.test_bundle")} />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              )}
            </ListItem>
          )}

          {wrap(t("menus.videos"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.VIDEOS.ROOT)}
                className={isActive(PATH.VIDEOS.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <VideoOctagon size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.videos")} />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("menus.audios"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.AUDIOS.ROOT)}
                className={isActive(PATH.AUDIOS.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <AudioSquare size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.audios")} />}
              </ListItemButton>
            </ListItem>
          )}
        </List>

        {/* ── NEWS & UPDATES ── */}
        <SectionLabel label={t("messages.news_updates")} />
        <List sx={{ px: isCollapsed ? 0 : undefined }}>
          {wrap(t("messages.notice"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.NOTICE.ROOT)}
                className={isActive(PATH.NOTICE.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Notification size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("messages.notice")} className="text-nowrap!" />}
              </ListItemButton>
            </ListItem>
          )}
          {wrap(t("messages.gorkhapatra"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.GORKHAPATRA.ROOT)}
                className={isActive(PATH.GORKHAPATRA.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <Paperclip size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("messages.gorkhapatra")} className="text-nowrap!" />}
              </ListItemButton>
            </ListItem>
          )}

          <ListItem disablePadding className="menu__item">
            <ListItemButton
              onClick={() => navigate(PATH.DISCUSSION.ROOT)}
              className={location.pathname.startsWith(PATH.DISCUSSION.ROOT) ? "active" : ""}>
              <ListItemIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 10h8M8 13h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453L2 22l5.547-1.043A9.955 9.955 0 0012 22z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ListItemIcon>
              <ListItemText primary={t("menus.discussion.root")} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding className="menu__item">
            <ListItemButton
              onClick={() => navigate(PATH.TICKET.ALL_TICKETS.ROOT)}
              className={location.pathname.startsWith(PATH.TICKET.ROOT) ? "active" : ""}>
              <ListItemIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9C2 7.89543 2.89543 7 4 7H20C21.1046 7 22 7.89543 22 9V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V9Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 12V17M9.5 14.5H14.5" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ListItemIcon>
              <ListItemText primary={t("menus.ticket.root")} />
              {/* {openTicket ? <ExpandLess /> : <ExpandMore />} */}
            </ListItemButton>
            {/* <Collapse in={openTicket} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 3 }}>
                <ListItem disablePadding className="menu__item">
                  <ListItemButton
                    onClick={() => navigate(PATH.TICKET.ALL_TICKETS.ROOT)}
                    className={location.pathname.startsWith(PATH.TICKET.ALL_TICKETS.ROOT) ? "active-nested" : ""}>
                    <ListItemText primary={t("menus.ticket.all_tickets")} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding className="menu__item">
                  <ListItemButton
                    onClick={() => navigate(PATH.TICKET.CHATS.ROOT)}
                    className={location.pathname.startsWith(PATH.TICKET.CHATS.ROOT) ? "active-nested" : ""}>
                    <ListItemText primary={t("menus.ticket.chats")} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse> */}
          </ListItem>
        </List>

        {/* ── OTHERS ── */}
        <SectionLabel label={t("messages.others")} />
        <List sx={{ px: isCollapsed ? 0 : undefined }}>
          {wrap(t("menus.support"),
            <ListItem disablePadding className="menu__item">
              <ListItemButton
                onClick={() => navigate(PATH.SUPPORT.ROOT)}
                className={isActive(PATH.SUPPORT.ROOT) ? "active" : ""}
                sx={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <ListItemIcon sx={{ minWidth: isCollapsed ? "unset" : undefined, justifyContent: "center" }}>
                  <I24Support size={20} />
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={t("menus.support")} />}
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>

      {/* Gradient fade */}
      <Box className="absolute! bottom-[72px] right-0 left-0 h-10 pointer-events-none" sx={{
        background: (theme) => `linear-gradient(to top, ${theme.palette.background.sidebar} 60%, transparent)`
      }} />

      {/* ── User Profile Section ── */}
      <Box
        ref={profileRef}
        onClick={(e) => setProfileAnchor(e.currentTarget)}
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: isCollapsed ? "10px 8px" : "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: isCollapsed ? 0 : "10px",
          cursor: "pointer",
          justifyContent: isCollapsed ? "center" : "flex-start",
          minHeight: 64,
          flexShrink: 0,
          "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
        }}
      >
        {/* Avatar */}
        <Tooltip title={isCollapsed ? (user?.name ?? "") : ""} placement="right" arrow>
          <Box sx={{
            width: 36, height: 36, borderRadius: "50%",
            background: theme.palette.separator.dark,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, overflow: "hidden",
          }}>
            {user?.thumbnail_url ? (
              <img src={user.thumbnail_url} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Typography variant="subtitle1" sx={{ color: theme.palette.separator.darkest, fontWeight: 600, lineHeight: 1 }}>
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </Typography>
            )}
          </Box>
        </Tooltip>

        {/* Name + role */}
        {!isCollapsed && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: "rgba(255,255,255,0.45)" }}>
              Student
            </Typography>
          </Box>
        )}

        {!isCollapsed && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Box>

      {/* Profile dropdown menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: isCollapsed ? "right" : "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: isCollapsed ? "left" : "center" }}
        slotProps={{ paper: { elevation: 3, sx: { minWidth: 180, mt: -1 } } }}
      >
        <MenuItem onClick={() => { setProfileAnchor(null); navigate(PATH.SETTINGS.PROFILE.ROOT); }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 10a4.167 4.167 0 100-8.333A4.167 4.167 0 0010 10zM2.842 18.333C2.842 15.108 6.05 12.5 10 12.5s7.158 2.608 7.158 5.833" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Typography variant="body2">My Account</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => { setProfileAnchor(null); dispatch(logout()); }} sx={{ color: "error.main" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 3.333H6.667A1.667 1.667 0 005 5v10a1.667 1.667 0 001.667 1.667H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.833 10H8.333M13.333 7.5l2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Typography variant="body2">Logout</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </div>
  );
}
