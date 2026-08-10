import { Box, CircularProgress } from "@mui/material";
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetAllLiveClassesQuery } from '../services/liveApi';
import { useAppSelector } from '../store/hook';
import { clearRedirectLink, withRedirectLink } from '../utils/redirectLink';
import { PATH } from './PATH';

const LIVE_CLASS_DISMISSED_KEY = 'live_class_dismissed';
const LANDING_PATHS = ['/', PATH.DASHBOARD.ROOT];

export default function Private() {
    const user = useAppSelector((state) => state.auth.user);
    const location = useLocation();

    const isOnLiveClassPage = location.pathname === PATH.ONGOING_LIVE_CLASSES.ROOT;
    const isJoiningLiveClass = /^\/courses\/[^/]+\/live\//.test(location.pathname);
    const dismissed = sessionStorage.getItem(LIVE_CLASS_DISMISSED_KEY) === "dismissed";

    const { data, isLoading } = useGetAllLiveClassesQuery(
        { pageIndex: 1, pageSize: 1, type: "ongoing" },
        { skip: !user || dismissed || isOnLiveClassPage || isJoiningLiveClass }
    );

    const hasLiveClass = (data?.data?.pagination?.total ?? 0) > 0;
    const arrived = Boolean(user) && !isLoading && !(hasLiveClass && !dismissed);

    // The pending link has served its purpose once the user reaches a protected route
    useEffect(() => {
        if (arrived) clearRedirectLink();
    }, [arrived]);

    if (!user) {
        const intended = LANDING_PATHS.includes(location.pathname)
            ? ""
            : `${location.pathname}${location.search}`;
        return <Navigate to={withRedirectLink(PATH.AUTH.LOGIN.ROOT, intended)} replace />;
    }

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (hasLiveClass && !dismissed) {
        return <Navigate to={PATH.ONGOING_LIVE_CLASSES.ROOT} />;
    }

    return <Outlet />;
}
