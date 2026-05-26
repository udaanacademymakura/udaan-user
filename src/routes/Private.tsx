import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetAllLiveClassesQuery } from '../services/liveApi';
import { useAppSelector } from '../store/hook';
import { PATH } from './PATH';

const LIVE_CLASS_DISMISSED_KEY = 'live_class_dismissed';

export default function Private() {
    const user = useAppSelector((state) => state.auth.user);
    const location = useLocation();

    const isOnLiveClassPage = location.pathname === PATH.ONGOING_LIVE_CLASSES.ROOT;
    const dismissCount = parseInt(sessionStorage.getItem(LIVE_CLASS_DISMISSED_KEY) ?? "0", 10);
    const dismissed = dismissCount >= 5;

    const { data, isLoading } = useGetAllLiveClassesQuery(
        { pageIndex: 1, pageSize: 1, type: "ongoing" },
        { skip: !user || dismissed || isOnLiveClassPage }
    );

    if (!user) {
        return <Navigate to={PATH.AUTH.LOGIN.ROOT} replace />;
    }

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const hasLiveClass = (data?.data?.pagination?.total ?? 0) > 0;

    if (hasLiveClass && !dismissed) {
        return <Navigate to={PATH.ONGOING_LIVE_CLASSES.ROOT} />;
    }

    return <Outlet />;
}
