import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    FormHelperText,
    IconButton,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { CloseCircle } from "iconsax-reactjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useGetAllCountriesQuery } from "../../../../services/countryApi";
import { useDownloadAdmitCardQuery } from "../../../../services/courseApi";
import { useUpdateProfileMutation } from "../../../../services/settingApi";
import { setCredentials } from "../../../../slice/authSlice";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import type { User } from "../../../../types/user";
import MakuraDatePicker from "../../../atom/MakuraDatePicker";
import ProfileImageUpload from "./ProfileImageUpload";
import UserEnrolledCourses from "./UserEnrolledCourses";
import UserTransactions from "./UserTransactions";

type SelectOption = { label: string; value: string };

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    phone: Yup.string()
        .required("Phone number is required")
        .matches(/^[0-9+]{7,15}$/, "Invalid phone number"),
    address: Yup.string().nullable(),
    profile: Yup.mixed<File>().nullable(),
});
export default function ProfilePageRoot() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const token = useAppSelector((state) => state.auth.token);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const { data, isLoading: downloading } = useDownloadAdmitCardQuery();
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const { data: countriesData } = useGetAllCountriesQuery();

    const countries: SelectOption[] = countriesData
        ? countriesData
            .map((c: any) => ({ label: c.name.common as string, value: c.name.common as string }))
            .sort((a, b) => a.label.localeCompare(b.label))
        : [];

    const formik = useFormik<Partial<User>>({
        initialValues: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: user?.address || "",
            joined_date: user?.joined_date || "",
            gender: user?.gender || "other",
            country: user?.country || "",
            province: user?.province || "",
            dob: user?.dob ? dayjs(user.dob) : "",
            city: user?.city || "",
            thumbnail: null,
            thumbnail_url: user?.thumbnail_url || "",
            live_preview: null,
            live_preview_url: user?.live_preview_url || "",
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();

                formData.append("name", values.name ?? "");
                formData.append("email", values.email ?? "");
                formData.append("phone", values.phone ?? "");

                if (values.city) {
                    formData.append("city", values.city);
                }
                if (values.dob) {
                    const dobString = typeof values.dob === "string" ? values.dob : values.dob.format('YYYY-MM-DD');
                    formData.append("dob", dobString);
                }
                if (values.country) {
                    formData.append("country", values.country);
                }
                if (values.gender) {
                    formData.append("gender", values.gender);
                }
                if (values.province) {
                    formData.append("province", values.province);
                }

                if (values.thumbnail instanceof File) {
                    formData.append("thumbnail", values.thumbnail);
                }

                if (values.thumbnail_url) {
                    formData.append("thumbnail_url", values.thumbnail_url);
                }

                if (values.live_preview instanceof File) {
                    formData.append("live_preview", values.live_preview);
                }
                if (values.live_preview_url) {
                    formData.append("live_preview_url", values.live_preview_url);
                }

                const response = await updateProfile(formData).unwrap();
                dispatch(setCredentials({
                    token: token,
                    user: {
                        ...user,
                        ...response?.data,
                    },
                }));
                dispatch(
                    showToast({
                        message: response?.message || "Profile Updated Successfully",
                        severity: "success"
                    })
                )
            }
            catch (e: any) {
                dispatch(
                    showToast({
                        message: e?.data?.message || "Unable to update profile",
                        severity: "error"
                    })
                )
            }

        },
    });

    const handleAdmitCardDownload = async () => {
        try {
            const downloadUrl = data?.data?.download_url;

            if (!downloadUrl) {
                throw new Error("Download URL not found");
            }

            if (!user?.thumbnail_url) {
                return dispatch(
                    showToast({
                        message: "Please upload profile picture to download admit card",
                        severity: "warning"
                    })
                )
            }

            window.open(downloadUrl, "_blank");
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to download admit card",
                    severity: "error"
                })
            )
        }
    }

    const Genders = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" }
    ]

    const hasLiveClassPermission = Boolean(
        user?.permissions?.some((p) => typeof p === "string" && p.includes("live_class"))
    );

    const Provinces = [
        { label: "Province 1", value: "province_1" },
        { label: "Province 2", value: "province_2" },
        { label: "Bagmati Province", value: "bagmati_province" },
        { label: "Gandaki Province", value: "gandaki_province" },
        { label: "Lumbini Province", value: "lumbini_province" },
        { label: "Karnali Province", value: "karnali_province" },
        { label: "Sudurpashchim Province", value: "sudurpashchim_province" },
    ]

    return (
        <div className="profile__page__container  overflow-auto ">
            <form
                onSubmit={formik.handleSubmit}
                className="profile__page__root"
            >
                <div className="flex justify-between items-center flex-wrap">
                    <Typography variant="h5" fontWeight={600}>{t("messages.profile")}</Typography>
                    <Button variant="contained" color="primary" onClick={() => setOpen(true)}>{downloading ? "Downloading" : t("messages.download_admin_card")}</Button>
                </div>
                <Divider className="mt-2! mb-6!" />

                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 lg:gap-6 items-start">
                    <div className="md:col-span-3 2xl:col-span-2">
                        <InputLabel>Your Profile Picture</InputLabel>

                        <ProfileImageUpload
                            previewUrl={formik.values.thumbnail_url}
                            onChange={(file) => formik.setFieldValue("thumbnail", file)}
                        />
                    </div>
                    <div className="col-span-9 lg:col-span-10">
                        <div className="flex flex-col gap-4 lg:gap-6 md:grid md:grid-cols-2">

                            {/* Username */}
                            <div className="col-span-1">
                                <InputLabel>Full Name</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                />
                                <FormHelperText error>
                                    {formik.touched.name && formik.errors.name}
                                </FormHelperText>
                            </div>

                            {/* Email */}
                            <div className="col-span-1">
                                <InputLabel>Email</InputLabel>
                                <OutlinedInput
                                    disabled
                                    fullWidth
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                />
                                <FormHelperText error>
                                    {formik.touched.email && formik.errors.email}
                                </FormHelperText>
                            </div>

                            {/* Phone */}
                            <div className="col-span-1">
                                <InputLabel>Phone</InputLabel>
                                <OutlinedInput
                                    disabled
                                    fullWidth
                                    name="phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                                />
                                <FormHelperText error>
                                    {formik.touched.phone && formik.errors.phone}
                                </FormHelperText>
                            </div>

                            <div className="col-span-1">
                                <InputLabel>Joined Date</InputLabel>
                                <OutlinedInput
                                    disabled
                                    fullWidth
                                    name="joined_date"
                                    value={formik.values.joined_date}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.joined_date && Boolean(formik.errors.joined_date)}
                                />
                                <FormHelperText error>
                                    {formik.touched.joined_date && formik.errors.joined_date}
                                </FormHelperText>
                            </div>

                            <div className="col-span-1">
                                <InputLabel>Gender <Typography variant="caption" color="text.middle">(Optional)</Typography></InputLabel>
                                <Autocomplete
                                    disableClearable
                                    options={Genders}
                                    getOptionLabel={(option) => option.label || ""}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    value={
                                        Genders.find(
                                            acc => acc.value === formik.values.gender
                                        ) || undefined
                                    }
                                    onChange={(_e, v) => formik.setFieldValue("gender", v?.value || null)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Gender"

                                        />
                                    )}
                                />

                            </div>

                            <div className="col-span-1">
                                <InputLabel>Date Of Birth <Typography variant="caption" color="text.middle">(Optional)</Typography></InputLabel>
                                <MakuraDatePicker
                                    value={formik.values.dob ? dayjs(formik.values.dob) : null}
                                    onChange={(date: Dayjs | null) => formik.setFieldValue("dob", date ? date.format('YYYY-MM-DDTHH:mm:ss') : "")}
                                />
                            </div>
                            <div className="col-span-1">
                                <InputLabel>Country <Typography variant="caption" color="text.middle">(Optional)</Typography></InputLabel>
                                <Autocomplete
                                    disableClearable
                                    options={countries}
                                    getOptionLabel={(option) => option.label || ""}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    value={
                                        countries.find(
                                            acc => acc.value === formik.values.country
                                        ) || undefined
                                    }
                                    onChange={(_e, v) => formik.setFieldValue("country", v?.value || null)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Country"
                                        />
                                    )}
                                />
                            </div>
                            <div className="col-span-1">
                                <InputLabel>Province <Typography variant="caption" color="text.middle">(Optional)</Typography></InputLabel>
                                <Autocomplete
                                    disableClearable
                                    options={Provinces}
                                    getOptionLabel={(option) => option.label || ""}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    value={
                                        Provinces.find(
                                            acc => acc.value === formik.values.province
                                        ) || undefined
                                    }
                                    onChange={(_e, v) => formik.setFieldValue("province", v?.value || null)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Province"

                                        />
                                    )}
                                />
                            </div>

                            <div className="col-span-2">
                                <InputLabel>City <Typography variant="caption" color="text.middle">(Optional)</Typography></InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="city"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.city && Boolean(formik.errors.city)}
                                    placeholder="Enter your city"
                                />
                                <FormHelperText error>
                                    {formik.touched.city && formik.errors.city}
                                </FormHelperText>
                            </div>


                        </div>
                    </div>
                </div>

                {hasLiveClassPermission && (
                    <>
                        <Divider className="my-6!" />
                        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 lg:gap-6 items-start">
                            <div className="md:col-span-3 2xl:col-span-2">
                                <InputLabel>Live Preview Image</InputLabel>
                                <ProfileImageUpload
                                    previewUrl={formik.values.live_preview_url}
                                    onChange={(file) => formik.setFieldValue("live_preview", file)}
                                />
                            </div>
                            <div className="col-span-9 lg:col-span-10">
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                    Shown when you appear as a teacher in live class cards
                                </Typography>
                                <Typography variant="caption" color="text.middle">
                                    Upload an image students will see beside your live class. A recent, well-lit photo (600×600 or larger) works best.
                                    If left empty, your profile picture is used.
                                </Typography>
                            </div>
                        </div>
                    </>
                )}

                <Divider className="my-6!" />
                <div className="text-right">
                    <Button variant="contained" type="submit" color="primary" disabled={isLoading}>{isLoading ? "Updating Profile" : "Update Profile"}</Button>
                </div>
            </form>
            <UserEnrolledCourses />
            <UserTransactions />
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
                <div className="header flex justify-between items-center px-4 py-4">
                    <Typography variant="h4" fontWeight={500}>Download Admit Card</Typography>
                    <IconButton
                        className="absolute! right-2 top-2"
                        onClick={() => setOpen(false)}
                    >
                        <CloseCircle
                            variant="Bulk"
                            color={theme.palette.error.main}
                        />
                    </IconButton>
                </div>
                <Divider className="my-2!" />
                <DialogContent>
                    <iframe src={data?.data?.preview_url || ""} className="w-full h-full min-h-[60vh]"></iframe>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleAdmitCardDownload}>{downloading ? "Downloading" : t("messages.download_admin_card")}</Button>
                </DialogActions >
            </Dialog >
        </div >
    );
}
