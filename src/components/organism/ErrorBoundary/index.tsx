import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouteError } from "react-router-dom";
import { isChunkLoadError, reloadForStaleChunk } from "../../../utils/lazyRetry";
import ErrorScreen from "./ErrorScreen";

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const staleBuild = isChunkLoadError(error);
    const [recovering, setRecovering] = useState(staleBuild);

    useEffect(() => {
        if (!staleBuild) return;
        if (!reloadForStaleChunk()) setRecovering(false);
    }, [staleBuild]);

    if (recovering) {
        return (
            <Box className="w-full flex flex-col items-center justify-center gap-4" sx={{ minHeight: "60vh" }}>
                <CircularProgress size={32} />
                <Typography variant="subtitle1" color="text.middle">
                    Updating to the latest version...
                </Typography>
            </Box>
        );
    }

    return <ErrorScreen staleBuild={staleBuild} error={error} />;
}
