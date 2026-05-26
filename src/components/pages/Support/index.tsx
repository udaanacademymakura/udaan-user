import { Box, Divider, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useGetAppSettingsQuery } from "../../../services/settingApi";
import { renderHtml } from "../../../utils/renderHtml";
import PageHeader from "../../organism/PageHeader";

export default function SupportRoot() {
    const { t } = useTranslation();
    const { data } = useGetAppSettingsQuery();

    const phones = data?.data?.phones ?? [];
    const emails = data?.data?.emails ?? [];
    const socials = data?.data?.socials ?? [];
    const map = data?.data?.map;

    return (
        <div className="support__page__root h-full flex flex-col justify-start gap-6 ">
            <PageHeader
                breadcrumb={[
                    {
                        title: t("menus.support")
                    }
                ]}
            />
            <div className="overflow-auto ">
                <Box>
                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {phones.length > 0 && (
                            <Box className="py-4 px-6 rounded-md" sx={{
                                border: (theme) => `1px solid ${theme.palette.textField.border}`
                            }}>
                                <Typography variant="h6">Phone No.</Typography>
                                <Divider className="mt-2! mb-6!" />
                                <Stack className="gap-4 flex-col!">
                                    {phones.map((phone, index) => (
                                        <Stack key={index} direction="row" className="gap-3 items-start">
                                            <Box className="shrink-0">
                                                {phone.icon_url
                                                    ? <img src={phone.icon_url} alt={phone.label} className="w-6 h-6 object-contain" />
                                                    : <img src="/phone-icon.svg" alt="" className="w-6 h-6" />
                                                }
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" color="text.middle" className="mb-1.5 capitalize">
                                                    {phone.label}
                                                </Typography>
                                                <Link to={`tel:${phone.value}`}>
                                                    <Typography variant="subtitle1">{phone.value}</Typography>
                                                </Link>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {emails.length > 0 && (
                            <Box className="py-4 px-6 rounded-md" sx={{
                                border: (theme) => `1px solid ${theme.palette.textField.border}`
                            }}>
                                <Typography variant="h6">Email Address</Typography>
                                <Divider className="mt-2! mb-6!" />
                                <Stack className="gap-4 flex-col!">
                                    {emails.map((email, index) => (
                                        <Stack key={index} direction="row" className="gap-3 items-start">
                                            <Box className="shrink-0">
                                                {email.icon_url
                                                    ? <img src={email.icon_url} alt={email.label} className="w-6 h-6 object-contain" />
                                                    : <img src="/mail-icon.svg" alt="" className="w-6 h-6" />
                                                }
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" color="text.middle" className="mb-1.5 capitalize">
                                                    {email.label}
                                                </Typography>
                                                <Link to={`mailto:${email.value}`}>
                                                    <Typography variant="subtitle1">{email.value}</Typography>
                                                </Link>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        )
                        }

                        {
                            socials.length > 0 && (
                                <Box className="py-4 px-6 rounded-md" sx={{
                                    border: (theme) => `1px solid ${theme.palette.textField.border}`
                                }}>
                                    <Typography variant="h6">Social Media</Typography>
                                    <Divider className="mt-2! mb-6!" />
                                    <Stack className="gap-4 flex-col!">
                                        {socials.map((social, index) => (
                                            <Stack key={index} direction="row" className="gap-3 items-start">
                                                <Box className="shrink-0">
                                                    {social.icon_url
                                                        ? <img src={social.icon_url} alt={social.label} className="w-6 h-6 object-contain" />
                                                        : null
                                                    }
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" color="text.middle" className="mb-1.5">
                                                        {social.label}
                                                    </Typography>
                                                    <Link to={social.link} target="_blank" rel="noopener noreferrer">
                                                        <Typography variant="subtitle1">{social.value}</Typography>
                                                    </Link>
                                                </Box>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )
                        }
                    </div >
                </Box >

                {map && (
                    <Box className="w-full rounded-md overflow-hidden mt-4" sx={{
                        border: (theme) => `1px solid ${theme.palette.textField.border}`
                    }}>
                        {renderHtml(map)}
                    </Box>
                )}
            </div>
        </div>
    );
}
