import { Box } from '@mui/material';
import { useGetAnalyticsQuery } from '../../../services/dashboardApi';
import DashboardAnalyticsCard from '../../organism/Cards/DashboardAnalyticsCard';
import DashboardAnalyticsLoading from '../../organism/Cards/DashboardAnalyticsCard/Loading';

export default function DashboardAnalytics() {
    const { data: analytics, isLoading } = useGetAnalyticsQuery();

    return (
        <Box
            className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4"
        >
            {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <DashboardAnalyticsLoading key={i} />
                ))
                : analytics?.data?.map((item, i) => (
                    <DashboardAnalyticsCard
                        data={item}
                        index={i}
                        key={item.description + item.value}
                    />
                ))}
        </Box>
    );
}
