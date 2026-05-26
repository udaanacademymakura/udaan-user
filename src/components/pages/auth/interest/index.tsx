import { Box, Button, Checkbox, FormControlLabel, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetAllInterestQuery, useUpdateUserInterestMutation } from "../../../../services/categoryApi";
import { useGetAllLiveClassesQuery } from "../../../../services/liveApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import { getItem, setItem } from "../../../../utils/localStorageUtil";

const INTEREST_SELECTED_KEY = "interest__selected";

const InterestShimmer = () => (
    <Box
        className="flex justify-between items-center p-4 rounded-xl"
        sx={{
            bgcolor: (theme) => theme.palette.gray.gray1,
            border: (theme) => `1px solid ${theme.palette.gray.gray2}`,
        }}
    >
        <Box className="flex items-center gap-4">
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
                <Skeleton variant="text" width={160} height={28} />
                <Skeleton variant="text" width={120} height={20} />
            </Box>
        </Box>
        <Skeleton variant="rectangular" width={22} height={22} />
    </Box>
);

export default function InterestRoot() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const user = useAppSelector((state) => state.auth.user);
    const { data, isLoading } = useGetAllInterestQuery();
    const [updatedUserInterest, { isLoading: addingUserInterest }] = useUpdateUserInterestMutation();
    const { data: liveData, isLoading: checkingLive } = useGetAllLiveClassesQuery({
        pageIndex: 1,
        pageSize: 1,
        type: "ongoing",
    });

    const nextRoute =
        !checkingLive && (liveData?.data?.pagination?.total ?? 0) > 0
            ? PATH.ONGOING_LIVE_CLASSES.ROOT
            : PATH.DASHBOARD.ROOT;

    const handleToggle = (id: number) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter((cid) => cid !== id)
                : [...prev, id]
        );
    };

    const loginState = { state: { from: "login" } };

    const skipInterest = () => {
        setItem(INTEREST_SELECTED_KEY, false);
        navigate(nextRoute, loginState);
    };

    useEffect(() => {
        if (checkingLive) return;
        const completed = getItem<boolean>(INTEREST_SELECTED_KEY);
        if (completed || user?.interested_categories?.length) {
            navigate(nextRoute, { ...loginState, replace: true });
        }
    }, [checkingLive, nextRoute, navigate]);

    const submitInterest = async () => {
        if (selectedCategories.length === 0) {
            skipInterest();
            return;
        }

        try {
            await updatedUserInterest({
                categories: selectedCategories
            }).unwrap();
            setItem(INTEREST_SELECTED_KEY, true);
            navigate(nextRoute, loginState);
        } catch (error: any) {
            dispatch(showToast({
                message: error?.data?.message || "Unable to updated interest. Try Again Later."
            }))
        }
    };


    return (
        <div className="interest__root">
            <div className="header mb-6 lg:mb-8">
                <Typography variant="h4" className="font-medium!">{t("messages.select_your_interest")}</Typography>
                <Typography variant="subtitle1" className="text.middle">{t("messages.select_your_interest_message")}</Typography>
            </div>
            <Box className="flex flex-col gap-4 overflow-auto" sx={{
                maxHeight: "calc(100vh - 400px)"
            }}>
                {
                    isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <InterestShimmer key={index} />
                        ))
                    ) : (
                        data?.data?.map((category) => (
                            <FormControlLabel
                                className="flex-row-reverse justify-between items-center! p-4 rounded-xl"
                                sx={{
                                    bgcolor: (theme) => !selectedCategories.includes(Number(category.id)) ? theme.palette.gray.gray1 : theme.palette.primary.light,
                                    border: "1px solid",
                                    borderColor: (theme) => !selectedCategories.includes(Number(category.id)) ? theme.palette.gray.gray2 : theme.palette.primary.main,
                                }}
                                label={
                                    <div className="flex justify-start items-center gap-4">
                                        <img src="/interest-icon.svg" alt="" />
                                        <div className="content">
                                            <Typography variant="h4" className="font-medium!" color="text.dark">{category.name}</Typography>
                                            <Typography variant="subtitle1" className="text.middle">{category.courses || 0} {t("messages.course")}</Typography>
                                        </div>
                                    </div>
                                }
                                control={<Checkbox
                                    checked={selectedCategories.includes(Number(category.id))}
                                    onChange={() => handleToggle(Number(category.id))}
                                />}
                            />
                        )))
                }
            </Box>
            <div className="flex flex-col gap-4 mt-6 ">
                <Button variant="outlined" color="primary" onClick={skipInterest}>
                    {t("messages.skip")}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={submitInterest}
                >
                    {addingUserInterest ? t("messages.saving") : t("messages.next")}
                </Button>
            </div>
        </div>
    )
}
