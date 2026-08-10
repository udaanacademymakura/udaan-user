import {
    Box,
    Button,
    CircularProgress,
    FormHelperText,
    OutlinedInput,
    Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { PATH } from "../../../../routes/PATH";
import { useResendOtpMutation, useVerifyOtpMutation } from "../../../../services/authApi";
import { setCredentials } from "../../../../slice/authSlice";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { usePendingRedirect } from "../../../../utils/redirectLink";
import AuthHeader from "../../../molecules/AuthHeader";
import NewDeviceDetectedDialog from "../../../organism/Dialog/NewDeviceDetectedDialog";

const validationSchema = Yup.object({
    otp: Yup.string()
        .length(6, "OTP must be 6 digits")
        .matches(/^\d+$/, "OTP must contain only digits")
        .required("Please enter the OTP"),
});

export default function VerifyOTP() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [phone, setPhone] = useState<string>("");
    const [isCheckingPhone, setIsCheckingPhone] = useState(true);
    const [timer, setTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const redirectLink = usePendingRedirect();
    const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isSending }] = useResendOtpMutation();
    const [newDeviceDialog, setNewDeviceDialog] = useState<{
        open: boolean;
        deviceLocation?: string;
        hasPendingRequest?: boolean;
        userId?: string;
    }>({ open: false });

    useEffect(() => {
        const phoneNumber = searchParams.get("phone");
        if (!phoneNumber) {
            dispatch(showToast({ message: "Phone number not found. Please login again.", severity: "error" }));
            navigate(PATH.AUTH.LOGIN.ROOT, { replace: true });
            return;
        }
        setPhone(phoneNumber);
        setIsCheckingPhone(false);
    }, [searchParams, navigate, dispatch]);

    useEffect(() => {
        if (user) {
            navigate(redirectLink || PATH.AUTH.INTEREST.ROOT, { replace: true });
        }
    }, [user, redirectLink, navigate]);

    useEffect(() => {
        const timerEnd = localStorage.getItem("otpTimerEnd");
        if (timerEnd) {
            const remaining = Math.floor((parseInt(timerEnd) - Date.now()) / 1000);
            if (remaining > 0) setTimer(remaining);
            else localStorage.removeItem("otpTimerEnd");
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    localStorage.removeItem("otpTimerEnd");
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    // Formik setup
    const formik = useFormik({
        initialValues: { otp: "" },
        validationSchema,
        onSubmit: async (values) => {
            if (!phone) {
                dispatch(showToast({ message: "Phone number not found.", severity: "error" }));
                navigate(PATH.AUTH.LOGIN.ROOT, { replace: true });
                return;
            }

            try {
                const response = await verifyOtp({ phone, otp: values.otp }).unwrap();



                dispatch(showToast({
                    message: response.message || "OTP verified successfully.",
                    severity: "success",
                }));

                dispatch(setCredentials({
                    token: response.data.token,
                    user: response.data.user,
                }));

                navigate(redirectLink || PATH.AUTH.INTEREST.ROOT, { replace: true });
            } catch (e: any) {
                setNewDeviceDialog({
                    open: e?.data?.data?.user_id ? true : false,
                    deviceLocation: e?.data?.data?.device_location,
                    hasPendingRequest: e?.data?.data?.has_pending_request,
                    userId: e?.data?.data?.user_id,
                });
                dispatch(showToast({
                    message: e?.data?.message || "Invalid OTP. Please try again.",
                    severity: "error",
                }));
            }
        }

    });

    const getOtpArray = (otp: string) => {
        const split = otp.split("");
        while (split.length < 6) split.push("");
        return split.slice(0, 6);
    };

    const otpArray = getOtpArray(formik.values.otp);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const newOtpArray = [...otpArray];
        newOtpArray[index] = value;
        const newOtp = newOtpArray.join("").replace(/\s/g, "");

        formik.setFieldValue("otp", newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        if (e.key === "Backspace" && !otpArray[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (!/^\d+$/.test(pastedData)) return;

        const digits = pastedData.slice(0, 6);
        formik.setFieldValue("otp", digits);

        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const startTimer = (seconds: number) => {
        const endTime = Date.now() + seconds * 1000;
        localStorage.setItem("otpTimerEnd", endTime.toString());
        setTimer(seconds);
    };

    const handleResendOTP = async () => {
        if (!phone) {
            dispatch(showToast({ message: "Phone number not found.", severity: "error" }));
            navigate(PATH.AUTH.LOGIN.ROOT, { replace: true });
            return;
        }
        try {
            const response = await resendOtp({ phone }).unwrap();
            dispatch(showToast({ message: response.message || "OTP sent successfully.", severity: "success" }));
            startTimer(90);
            formik.resetForm();
            inputRefs.current[0]?.focus();
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to send OTP.", severity: "error" }));
        }
    };

    if (isCheckingPhone) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <NewDeviceDetectedDialog
                open={newDeviceDialog.open}
                onClose={() => setNewDeviceDialog({ open: false })}
                deviceLocation={newDeviceDialog.deviceLocation}
                hasPendingRequest={newDeviceDialog.hasPendingRequest}
                userId={newDeviceDialog.userId}
            />

            <AuthHeader
                title="OTP Verification"
                description="Enter the One-Time Password (OTP) sent to your registered email or phone number. <span class='font-bold'>The OTP is valid for 1 month</span>, so you can reuse a previously received OTP within this period."
            />

            <Typography textAlign="center" className="mb-3!" sx={{ fontSize: { xs: 14, lg: 16 } }}>
                We've sent a 6-digit code to <strong style={{ color: "#1976d2" }}>{phone}</strong>
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 2 }}>
                    {otpArray.map((digit, index) => (
                        <OutlinedInput
                            key={index}
                            inputRef={(el) => { inputRefs.current[index] = el; }}
                            type="number"
                            inputMode="numeric"
                            inputProps={{
                                maxLength: 1,
                                style: { textAlign: "center", fontSize: 24, fontWeight: 600, padding: 0 },
                            }}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            error={formik.touched.otp && Boolean(formik.errors.otp)}
                            sx={{
                                width: { xs: 45, sm: 56 },
                                height: { xs: 50, sm: 60 },
                                p: { xs: 0, md: "10px 16px" },
                                "& input": { height: "100%" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2", borderWidth: 2 },
                            }}
                        />
                    ))}
                </Box>

                {formik.touched.otp && formik.errors.otp && (
                    <FormHelperText error={true} sx={{ mb: 2, textAlign: "center" }}>
                        {formik.errors.otp}
                    </FormHelperText>
                )}

                <Typography variant="subtitle2" textAlign="end" color="text.secondary" className="my-2!">
                    Didn't get the code?
                    {timer > 0 ? (
                        <strong style={{ marginLeft: 4 }}>Resend in {timer}s</strong>
                    ) : (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={handleResendOTP}
                            disabled={isSending}
                            sx={{ textTransform: "none", ml: 1 }}
                        >
                            {isSending ? "Sending..." : "Send Again"}
                        </Button>
                    )}
                </Typography>

                <Button fullWidth size="large" type="submit" variant="contained" disabled={isLoading || !formik.isValid} sx={{ mb: 3, py: 1.5 }}>
                    {isLoading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                            Verifying...
                        </>
                    ) : "Verify OTP"}
                </Button>
            </form>
        </>
    );
}
