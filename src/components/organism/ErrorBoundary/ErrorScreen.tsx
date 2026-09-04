import { Box, Button, Typography } from "@mui/material";
import { PATH } from "../../../routes/PATH";
import { clearStaleChunkFlag } from "../../../utils/lazyRetry";

interface Props {
    staleBuild: boolean;
    error: unknown;
}

export default function ErrorScreen({ staleBuild, error }: Props) {
    const goHome = () => {
        clearStaleChunkFlag();
        window.location.assign(PATH.DASHBOARD.ROOT);
    };

    const reload = () => {
        clearStaleChunkFlag();
        window.location.reload();
    };

    return (
        <Box className="w-full flex items-center justify-center p-6" sx={{ minHeight: "60vh" }}>
            <Box className="flex flex-col items-center text-center gap-4 max-w-[444px]">
                <Typography variant="h4" fontWeight={500}>
                    {staleBuild ? "A new version of Udaan is available" : "Something went wrong"}
                </Typography>
                <Typography variant="subtitle1" color="text.middle">
                    {staleBuild
                        ? "This page was updated while your tab was open. Reload to continue."
                        : "We could not load this page. Reloading usually fixes it."}
                </Typography>
                {import.meta.env.DEV && error instanceof Error ? (
                    <Typography variant="body2" color="error.main" className="break-all">
                        {error.message}
                    </Typography>
                ) : null}
                <Box className="flex gap-3 flex-wrap justify-center">
                    <Button variant="contained" color="primary" onClick={reload}>
                        Reload page
                    </Button>
                    <Button variant="outlined" color="primary" onClick={goHome}>
                        Go to home
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
