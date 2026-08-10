import {
    Button,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { Eye, EyeSlash } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useLoginType } from "../../../hooks/useLoginType";
import { PATH } from "../../../routes/PATH";
import {
    useLoginWithPasswordMutation,
    useValidateUserExistanceMutation,
} from "../../../services/authApi";
import { setCredentials } from "../../../slice/authSlice";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { usePendingRedirect, withRedirectLink } from "../../../utils/redirectLink";
import NewDeviceDetectedDialog from "../Dialog/NewDeviceDetectedDialog";

export default function LoginForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loginType } = useLoginType();
    const redirectLink = usePendingRedirect();

    const [useOtp, setUseOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newDeviceDialog, setNewDeviceDialog] = useState<{
        open: boolean;
        deviceLocation?: string;
        hasPendingRequest?: boolean;
        userId?: string;
    }>({ open: false });

    const [validateUser] = useValidateUserExistanceMutation();
    const [loginWithPassword] = useLoginWithPasswordMutation();

    // "otp" mode = phone only; "password" mode = phone + password
    const isPasswordMode = loginType === "password" || (loginType === "both" && !useOtp);

    const validationSchema = useMemo(() => {
        if (isPasswordMode) {
            return Yup.object().shape({
                phone: Yup.string().required("Phone number is required"),
                password: Yup.string()
                    .required("Password is required")
                    .min(6, "At least 6 characters"),
            });
        }
        return Yup.object().shape({
            phone: Yup.string().required("Phone number is required"),
        });
    }, [isPasswordMode]);

    const formik = useFormik({
        initialValues: { phone: "", password: "" },
        validationSchema,
        onSubmit: async (values) => {
            if (!isPasswordMode) {
                try {
                    await validateUser({ data: values.phone }).unwrap();
                    navigate(
                        withRedirectLink(
                            `${PATH.AUTH.VERIFY_OTP.ROOT}?phone=${values.phone}`,
                            redirectLink,
                        ),
                    );
                } catch (error: any) {
                    dispatch(
                        showToast({
                            message: error?.data?.message || "Unable to Login",
                            severity: "error",
                        }),
                    );
                }
            } else {
                try {
                    const response = await loginWithPassword({
                        phone: values.phone,
                        password: values.password,
                    }).unwrap();

                    dispatch(
                        setCredentials({
                            token: response.data.token,
                            user: response.data.user,
                        }),
                    );

                    navigate(redirectLink || PATH.AUTH.INTEREST.ROOT, { replace: true });
                } catch (e: any) {
                    setNewDeviceDialog({
                        open: e?.data?.data?.user_id ? true : false,
                        deviceLocation: e?.data?.data?.device_location,
                        hasPendingRequest: e?.data?.data?.has_pending_request,
                        userId: e?.data?.data?.user_id,
                    });
                    dispatch(
                        showToast({
                            message: e?.data?.message || "Invalid credentials. Please try again.",
                            severity: "error",
                        }),
                    );
                }
            }
        },
    });

    const handleModeToggle = () => {
        setUseOtp((prev) => !prev);
        formik.resetForm();
    };

    return (
        <>
            <NewDeviceDetectedDialog
                open={newDeviceDialog.open}
                onClose={() => setNewDeviceDialog({ open: false })}
                deviceLocation={newDeviceDialog.deviceLocation}
                hasPendingRequest={newDeviceDialog.hasPendingRequest}
                userId={newDeviceDialog.userId}
            />

            <form onSubmit={formik.handleSubmit} className="login__form">
                {/* Phone */}
                <div className="input__field mb-6">
                    <InputLabel>Phone Number</InputLabel>
                    <OutlinedInput
                        fullWidth
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                        <FormHelperText error sx={{ mt: 0.5 }}>
                            {formik.errors.phone}
                        </FormHelperText>
                    )}
                </div>

                {/* Password */}
                {isPasswordMode && (
                    <div className="input__field mb-2">
                        <InputLabel>Password</InputLabel>
                        <OutlinedInput
                            fullWidth
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((p) => !p)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? (
                                            <EyeSlash size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        {formik.touched.password && formik.errors.password && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                {formik.errors.password}
                            </FormHelperText>
                        )}
                    </div>
                )}

                {/* Forgot password */}
                {isPasswordMode && (
                    <div className="flex justify-end mb-6">
                        <RouterLink to={PATH.AUTH.FORGOT_PASSWORD.ROOT}>
                            <Typography variant="subtitle2" color="primary">
                                Forgot password?
                            </Typography>
                        </RouterLink>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={formik.isSubmitting || !formik.dirty}
                >
                    {formik.isSubmitting ? "Please wait…" : "Sign In"}
                </Button>

                {/* Mode toggle — only for "both" */}
                {loginType === "both" && (
                    <Button
                        type="button"
                        variant="text"
                        color="primary"
                        fullWidth
                        onClick={handleModeToggle}
                        sx={{ mt: 1.5, textTransform: "none" }}
                    >
                        {isPasswordMode
                            ? "Login with OTP instead"
                            : "Use password instead"}
                    </Button>
                )}
            </form>
        </>
    );
}
