import { Box, Button, Divider, Typography } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATH } from '../../../../routes/PATH';
import type { PurchaseModuleTypes } from '../../../../types/purchase';

export default function PurchaseFailure() {
    const navigate = useNavigate();
    const { id, type, courseId, subscriptionId } = useParams();
    const [searchParams] = useSearchParams();

    const isSubscription = !!courseId && !!subscriptionId;
    const moduleId = isSubscription ? Number(courseId) : Number(id);
    const moduleType = (isSubscription ? 'course' : type) as PurchaseModuleTypes;

    // ── Detect gateway + extract failure details from redirect params ────────
    const encodedData = searchParams.get('data');
    const pidx = searchParams.get('pidx');

    let gateway: 'eSewa' | 'Khalti' | null = null;
    let failureStatus: string | null = null;
    let transactionId: string | null = null;

    if (encodedData) {
        gateway = 'eSewa';
        try {
            const decoded = JSON.parse(atob(encodedData));
            failureStatus = decoded.status ?? null;
            transactionId = decoded.transaction_uuid ?? decoded.transaction_code ?? null;
        } catch { /* malformed base64 — treat as no info */ }
    } else if (pidx) {
        gateway = 'Khalti';
        failureStatus = searchParams.get('status') ?? null;
        transactionId =
            searchParams.get('transaction_id') ??
            searchParams.get('tidx') ??
            pidx;
    }

    const moduleLabel =
        isSubscription || moduleType === 'course'
            ? 'Course'
            : moduleType === 'test'
                ? 'Test'
                : 'Bundle';

    const handleTryAgain = () => {
        if (isSubscription) {
            navigate(PATH.SUBSCRIPTION.PURCHASE.ROOT(Number(courseId), Number(subscriptionId)));
        } else {
            navigate(PATH.COURSE_MANAGEMENT.COURSES.PURCHASE.ROOT(moduleId, moduleType));
        }
    };

    const handleGoBack = () => {
        if (isSubscription || moduleType === 'course') {
            navigate(PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(moduleId));
        } else if (moduleType === 'test') {
            navigate(PATH.TEST.ROOT);
        } else {
            navigate(PATH.TEST.EXPLORE_TEST.BUNDLE_TEST.VIEW_BUNDLE.ROOT(moduleId));
        }
    };

    const hasDetails = !!(gateway || transactionId || failureStatus);

    return (
        <Box
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4 max-w-[520px] mx-auto overflow-auto"
            sx={{ boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.2)' }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" viewBox="0 0 65 65" fill="none">
                <g clipPath="url(#clip0_failure)">
                    <path d="M30.4737 2.5258C31.5897 3.26581 33.4159 3.26581 34.5303 2.5258L37.4774 0.567672C38.5928 -0.173353 40.0918 0.146441 40.8091 1.27747L42.7047 4.26709C43.422 5.39748 45.0893 6.13977 46.4093 5.91646L49.8985 5.32524C51.219 5.10168 52.4598 6.00215 52.6542 7.32691L53.1716 10.8223C53.3679 12.1473 54.5879 13.5058 55.8854 13.84L59.3093 14.7231C60.607 15.0585 61.3731 16.3883 61.0126 17.678L60.0643 21.0762C59.7043 22.3658 60.2674 24.1029 61.3168 24.9356L64.0962 27.1404C65.1453 27.973 65.3045 29.4976 64.4508 30.5301L62.1943 33.2539C61.3408 34.2854 61.1501 36.101 61.7699 37.2878L63.4086 40.4205C64.0287 41.6081 63.5559 43.0668 62.3563 43.662L59.1865 45.2354C57.987 45.831 57.0751 47.4125 57.1586 48.7489L57.3776 52.2775C57.4624 53.6133 56.4351 54.7543 55.0964 54.8114L51.563 54.961C50.2253 55.0182 48.7488 56.092 48.2811 57.3478L47.052 60.6593C46.5843 61.9154 45.1836 62.5401 43.9385 62.0474L40.6466 60.7461C39.4022 60.253 37.6163 60.6324 36.679 61.5895L34.2067 64.1147C33.2691 65.0712 31.7361 65.0712 30.7978 64.116L28.3216 61.5891C27.3836 60.6329 25.5978 60.2537 24.3526 60.7464L21.0624 62.0476C19.8174 62.5407 18.4166 61.916 17.9499 60.6595L16.7178 57.3481C16.2507 56.0927 14.7743 55.0185 13.4359 54.9612L9.90384 54.8117C8.56512 54.7544 7.53909 53.6134 7.62262 52.2777L7.84365 48.7492C7.9268 47.4131 7.01363 45.8313 5.8143 45.2356L2.64555 43.6623C1.44635 43.0669 0.972184 41.6086 1.5926 40.4208L3.23131 37.2881C3.85135 36.1012 3.66067 34.2858 2.80589 33.2552L0.549303 30.5278C-0.304838 29.497 -0.144877 27.9724 0.903883 27.1397L3.6839 24.9349C4.73266 24.1022 5.29659 22.3662 4.9368 21.0759L3.98618 17.6764C3.62614 16.3868 4.39243 15.0578 5.68887 14.7245L9.11534 13.8395C10.4118 13.5057 11.6335 12.1472 11.8291 10.8222L12.3462 7.32678C12.5422 6.00203 13.7824 5.10155 15.1024 5.32511L18.592 5.91633C19.9124 6.13964 21.5795 5.39735 22.2957 4.26696L24.1905 1.27734C24.9068 0.146315 26.4067 -0.17348 27.523 0.567545L30.4737 2.5258Z" fill="#F87171" />
                    <path d="M53.5277 32.5362C53.5277 44.1508 44.1114 53.566 32.4979 53.566C20.885 53.566 11.4688 44.1508 11.4688 32.5362C11.4688 20.9252 20.8846 11.5098 32.4979 11.5098C44.1114 11.5098 53.5277 20.9252 53.5277 32.5362Z" fill="#DC2626" />
                    <path d="M23.5 23.5L41.5 41.5M41.5 23.5L23.5 41.5" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </g>
                <defs>
                    <clipPath id="clip0_failure">
                        <rect width="65" height="65" fill="white" />
                    </clipPath>
                </defs>
            </svg>

            <div className="text-center">
                <Typography className="font-bold mb-2" variant="h5">Payment Failed</Typography>
                <Typography variant="subtitle2" color="text.middle">
                    {gateway
                        ? `Your ${gateway} payment could not be completed. Please try again.`
                        : 'Your payment could not be processed. Please try again.'}
                </Typography>
            </div>

            {hasDetails && (
                <Box
                    className="rounded-md py-6 px-4 w-full flex flex-col gap-3"
                    sx={{ border: (theme) => `1px solid ${theme.palette.separator.dark}` }}
                >
                    {transactionId && (
                        <>
                            <div className="grid grid-cols-2">
                                <Typography variant="subtitle1" color="text.middle">Transaction ID</Typography>
                                <Typography variant="subtitle1" color="text.dark" fontWeight={600} className="text-end font-medium">
                                    {transactionId}
                                </Typography>
                            </div>
                            <Divider />
                        </>
                    )}

                    {gateway && (
                        <>
                            <div className="grid grid-cols-2">
                                <Typography variant="subtitle1" color="text.middle">Payment Method</Typography>
                                <Typography variant="subtitle1" color="text.dark" fontWeight={600} className="text-end font-medium">
                                    {gateway}
                                </Typography>
                            </div>
                            <Divider />
                        </>
                    )}

                    {failureStatus && (
                        <div className="grid grid-cols-2">
                            <Typography variant="subtitle1" color="text.middle">Status</Typography>
                            <Typography variant="subtitle1" color="error.main" fontWeight={600} className="text-end font-medium">
                                {failureStatus}
                            </Typography>
                        </div>
                    )}
                </Box>
            )}

            <div className="flex flex-col gap-4 w-full">
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleTryAgain}
                >
                    Try Again
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={handleGoBack}
                >
                    Back to {moduleLabel}
                </Button>
            </div>
        </Box>
    );
}
