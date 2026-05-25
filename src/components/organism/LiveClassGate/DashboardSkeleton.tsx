import { Box, Skeleton, useTheme } from "@mui/material";

const cardSx = (border: string) => ({
    border: `1px solid ${border}`,
    borderRadius: "14px",
    padding: "15px",
});

export default function DashboardSkeleton() {
    const theme = useTheme();
    const border = theme.palette.divider;

    return (
        <div
            className="h-full overflow-hidden pr-2"
            aria-hidden
        >
            <Box
                className="flex flex-col xl:grid xl:grid-cols-12"
                sx={{ gap: "18px", alignItems: "stretch", pb: 4, width: "100%" }}
            >
                <Box
                    className="xl:col-span-8"
                    sx={{ display: "flex", flexDirection: "column", gap: "18px", overflow: "hidden", width: "100%", minWidth: 0 }}
                >
                    <Skeleton variant="rounded" height={180} sx={{ borderRadius: "14px" }} />

                    <Box sx={cardSx(border)}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <Skeleton variant="circular" width={36} height={36} />
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="text" width="40%" />
                                </div>
                            ))}
                        </div>
                    </Box>

                    <Box sx={cardSx(border)}>
                        <Skeleton variant="text" width={140} height={24} />
                        <Skeleton variant="rounded" height={220} sx={{ mt: 1, borderRadius: "10px" }} />
                    </Box>

                    <Box sx={cardSx(border)}>
                        <Skeleton variant="text" width={180} height={24} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton variant="rounded" height={140} sx={{ borderRadius: "10px" }} />
                                    <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                                    <Skeleton variant="text" width="50%" />
                                </div>
                            ))}
                        </div>
                    </Box>

                    <Box sx={cardSx(border)}>
                        <Skeleton variant="text" width={160} height={24} />
                        <div className="flex flex-col gap-3 mt-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <Skeleton variant="rounded" width={80} height={60} />
                                    <div className="flex-1">
                                        <Skeleton variant="text" width="70%" />
                                        <Skeleton variant="text" width="40%" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Box>
                </Box>

                <Box
                    className="xl:col-span-4 w-full"
                    sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", minWidth: 0 }}
                >
                    <Box sx={cardSx(border)}>
                        <Skeleton variant="text" width={120} height={24} />
                        <Skeleton variant="rounded" height={260} sx={{ mt: 1, borderRadius: "10px" }} />
                    </Box>
                    <Box sx={cardSx(border)}>
                        <Skeleton variant="text" width={160} height={24} />
                        <div className="flex flex-col gap-3 mt-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} variant="rounded" height={70} sx={{ borderRadius: "10px" }} />
                            ))}
                        </div>
                    </Box>
                </Box>
            </Box>
        </div>
    );
}
