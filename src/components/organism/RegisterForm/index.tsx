import { Button, FormHelperText, InputLabel, OutlinedInput } from "@mui/material";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { PATH } from "../../../routes/PATH";
import { useRegisterMutation } from "../../../services/authApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { usePendingRedirect, withRedirectLink } from "../../../utils/redirectLink";

export default function RegisterForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [registerUser, { isLoading }] = useRegisterMutation();
    const user = useAppSelector((state) => state.auth.user);
    const redirectLink = usePendingRedirect();

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            navigate(redirectLink || PATH.DASHBOARD.ROOT, { replace: true });
        }
    }, [user, redirectLink, navigate]);

    const validationSchema = Yup.object({
        name: Yup.string().required("Full name is required"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
        phone: Yup.string()
            .matches(/^\d+$/, "Phone must contain only digits")
            .min(7, "Phone number too short")
            .required("Phone number is required"),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await registerUser(values).unwrap();
                dispatch(
                    showToast({
                        message: response?.message || "Registered Succesfully.",
                        severity: "success",
                    }),
                );
                navigate(
                    withRedirectLink(
                        `${PATH.AUTH.VERIFY_OTP.ROOT}?phone=${values.phone}`,
                        redirectLink,
                    ),
                );
            } catch (e: any) {
                dispatch(
                    showToast({
                        message: e?.data?.message || "Unable to Login",
                        severity: "error",
                    }),
                );
            }
        },
    });
    return (
        <form onSubmit={formik.handleSubmit}>
            {/* Full Name */}
            <div className="input__field mb-6">
                <InputLabel>Full Name</InputLabel>
                <OutlinedInput
                    fullWidth
                    name="name"
                    placeholder="Enter your full name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                />
                {formik.touched.name && formik.errors.name && (
                    <FormHelperText error={true}>
                        {formik.errors.name}
                    </FormHelperText>
                )}
            </div>

            {/* Email */}
            <div className="input__field mb-6">
                <InputLabel>Email Address</InputLabel>
                <OutlinedInput
                    fullWidth
                    name="email"
                    placeholder="Enter your email address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                />
                {formik.touched.email && formik.errors.email && (
                    <FormHelperText error={true}>
                        {formik.errors.email}
                    </FormHelperText>
                )}
            </div>

            {/* Phone */}
            <div className="input__field mb-6">
                <InputLabel>Phone No.</InputLabel>
                <OutlinedInput
                    fullWidth
                    name="phone"
                    placeholder="Enter your phone no."
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                />
                {formik.touched.phone && formik.errors.phone && (
                    <FormHelperText error={true}>
                        {formik.errors.phone}
                    </FormHelperText>
                )}
            </div>

            <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                disabled={isLoading || !formik.isValid}
            >
                {isLoading ? "Registering..." : "Register"}
            </Button>
        </form>
    )
}
