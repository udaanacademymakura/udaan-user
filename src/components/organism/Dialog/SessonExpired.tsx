import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Stack,
    Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { PATH } from "../../../routes/PATH";
import { logout } from "../../../slice/authSlice";
import { hideSessionExpired } from "../../../slice/sessionSlice";
import type { RootState } from "../../../store/store";

const SessionExpiredPopup = () => {
    const dispatch = useDispatch();
    const { showSessionExpiredPopup } = useSelector(
        (state: RootState) => state.session
    );
    const userId = useSelector((state: RootState) => state.auth?.user?.id);

    const handleRequestReset = () => {
        const id = userId;
        dispatch(logout());
        dispatch(hideSessionExpired());
        const url = id
            ? `${PATH.AUTH.DEVICE_RESET.ROOT}?user_id=${encodeURIComponent(id)}`
            : PATH.AUTH.DEVICE_RESET.ROOT;
        window.location.href = url;
    };

    const handleSignInOther = () => {
        dispatch(logout());
        dispatch(hideSessionExpired());
        window.location.href = PATH.AUTH.LOGIN.ROOT;
    };

    return (
        <Dialog
            open={showSessionExpiredPopup}
            onClose={handleSignInOther}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogContent>
                <Stack flexDirection="column" spacing={0.5}>
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: "warning.light",
                            color: "warning.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <DevicesOtherOutlinedIcon sx={{ fontSize: 28 }} />
                    </Box>

                    <Typography variant="h6" fontWeight={700} className="mb-4! mt-6!">
                        Your device has been signed out
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Your account is currently active on another device. Only 1 mobile &amp; 1
                        web session is allowed per account at a time.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" className="mt-2!">
                        If this was you — switching to a new browser or device — submit a reset
                        request below. An admin will review and approve it, after which your old
                        session will be signed out.
                    </Typography>

                    {/* Info box */}
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: "primary.main",
                            bgcolor: "primary.light",
                            borderRadius: 2,
                            p: 2,
                            color: "primary.main",
                        }}
                        className="mt-4!"
                    >
                        <Typography variant="body2">
                            <strong>Is this your device?</strong> Follow the existing device reset
                            guidelines — provide your reason and situation, and wait for admin
                            approval before logging in here.
                        </Typography>
                    </Box>

                    {/* Actions */}
                    <Stack gap={1} className="mt-6!">
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleRequestReset}
                        >
                            Request Device Reset
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleSignInOther}
                        >
                            Sign in with another account
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default SessionExpiredPopup;
