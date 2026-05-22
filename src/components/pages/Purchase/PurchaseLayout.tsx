
import { Phone } from '@mui/icons-material';
import { Button, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { ArrowLeft } from 'iconsax-reactjs';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePaymentGateways } from "../../../hooks/usePaymentGateways";
import { useGetCourseByIdQuery, usePurchaseCourseWithEsewaMutation, usePurchaseWithKhaltiMutation } from "../../../services/courseApi";
import { useGetBundleByOverviewQuery, useGetTestOverviewQuery } from '../../../services/testApi';
import { showToast } from '../../../slice/toastSlice';
import { useAppDispatch } from '../../../store/hook';
import type { PaymentMethods, PurchaseFormValues, PurchaseModuleTypes } from "../../../types/purchase";
import { getApiErrorMessage } from '../../../utils/apiError';
import Quote from '../../molecules/Quote';
import PageHeader from '../../organism/PageHeader';
import CoursePaymentCard from './CoursePaymentCard';
import PurchaseGuideLines from './PurchaseGuideLines';
import PurchasePaymentOption from './PurchasePaymentOption';

function submitEsewaForm(action: string, params: Record<string, any>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;

    Object.keys(params).forEach(key => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}

export default function PurchaseLayout() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { id, type, courseId, subscriptionId } = useParams();

    const isSubscription = !!courseId && !!subscriptionId;
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | undefined>(
        subscriptionId ? Number(subscriptionId) : undefined
    );

    const { paymentOptions, activeGateways } = usePaymentGateways();

    const defaultPaymentOption = useMemo<PaymentMethods>(() => {
        return (activeGateways[0]?.slug as PaymentMethods) ?? "esewa";
    }, [activeGateways]);

    const { data: course } = useGetCourseByIdQuery({ id: Number(id) }, { skip: !id || type !== "course" });
    const { data: subscriptionCourse } = useGetCourseByIdQuery({ id: Number(courseId) }, { skip: !isSubscription });
    const { data: test } = useGetTestOverviewQuery({ id: Number(id) }, { skip: !id || type !== "test" });
    const { data: bundle } = useGetBundleByOverviewQuery({ id: Number(id) }, { skip: !id || type !== "bundle" })
    const [payViaEsewa, { isLoading: payingViaEsewa }] = usePurchaseCourseWithEsewaMutation();
    const [payViaKhalti, { isLoading: isKhaltiLoading }] = usePurchaseWithKhaltiMutation();

    const subscriptionPlans = subscriptionCourse?.data?.subscriptions || [];
    const activePlan = subscriptionPlans.find(p => p.id === selectedSubscriptionId);

    let data;
    let price = 0;

    if (isSubscription) {
        data = subscriptionCourse?.data;
        price = Number(activePlan?.price) || 0;
    } else {
        switch (type) {
            case "course":
                data = course?.data;
                price = Number(course?.data?.sale_price) || 0;
                break;
            case "test":
                data = test?.data;
                price = Number(test?.data?.sale_price) || 0;
                break;
            case "bundle":
                data = bundle?.data;
                price = Number(bundle?.data?.sale_price) || 0;
                break;
            default:
                data = null;
        }
    }
    // const vat = price * 0.13;
    const vat = 0;



    const formik = useFormik<PurchaseFormValues>({
        initialValues: {
            paymentOption: defaultPaymentOption,
            amount: vat + price,
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                if (values.paymentOption === "esewa") {
                    const coursePurchaseData = await payViaEsewa({
                        id: isSubscription ? Number(courseId) : Number(id),
                        moduleType: isSubscription ? "course" : type as PurchaseModuleTypes,
                        subscriptionId: isSubscription ? selectedSubscriptionId : undefined,
                    }).unwrap();
                    if (coursePurchaseData) {
                        const paymentData = coursePurchaseData?.data;

                        const esewaParams = {
                            amount: paymentData?.amount,
                            tax_amount: paymentData?.tax_amount,
                            total_amount: paymentData?.total_amount,
                            transaction_uuid: paymentData?.transaction_uuid,
                            product_code: paymentData?.product_code,
                            product_service_charge: paymentData?.product_service_charge || "0",
                            product_delivery_charge: paymentData?.product_delivery_charge || "0",
                            success_url: paymentData?.success_url,
                            failure_url: paymentData?.failure_url,
                            signed_field_names: "total_amount,transaction_uuid,product_code",
                            signature: paymentData?.signature,
                        };
                        submitEsewaForm(paymentData.payment_url, esewaParams);
                    }
                } else if (values.paymentOption === "khalti") {
                    const response = await payViaKhalti({
                        id: isSubscription ? Number(courseId) : Number(id),
                        type: values.paymentOption,
                        moduleType: isSubscription ? "course" : type as PurchaseModuleTypes,
                        amount: vat + price,
                        subscriptionId: isSubscription ? selectedSubscriptionId : undefined,
                    }).unwrap();

                    const paymentUrl = response?.data?.payment_url;
                    if (paymentUrl) {
                        window.location.replace(paymentUrl);
                    }
                }

            } catch (e) {
                dispatch(showToast({
                    message: getApiErrorMessage(e, "Unable to proceed for payment. Try Again Later."),
                    severity: "error"
                }));
            }
        }
    });

    return (
        <div className="purchase__options overflow-auto pb-4 px-1">
            <Button
                variant="text"
                startIcon={<ArrowLeft />}
                onClick={() => navigate(-1)}
            >
                Back to {isSubscription ? "Course" : type} Details
            </Button>

            <PageHeader
                breadcrumb={[{ title: "Choose Payment" }]}
                description="Choose the payment according to your will."
            />

            <form onSubmit={formik.handleSubmit}>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="col-span-1">
                        {isSubscription && subscriptionPlans.length > 0 && (
                            <div className="mb-6 flex flex-col gap-3">
                                <Typography variant="body2" fontWeight={500}>Subscription Plans</Typography>
                                {subscriptionPlans.map((plan) => (
                                    <div key={plan.id}>
                                        <div className="grid grid-cols-2 gap-2 items-center">
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={plan.id === selectedSubscriptionId}
                                                        onChange={() => setSelectedSubscriptionId(plan.id)}
                                                        sx={(theme) => ({
                                                            color: theme.palette.gray.gray2,
                                                            "&.Mui-checked": { color: theme.palette.primary.main }
                                                        })}
                                                    />
                                                }
                                                label={<Typography variant="subtitle2">{plan.name}</Typography>}
                                            />
                                            <Typography variant="subtitle2">NRs. {plan.price} / {plan.number} {plan.billing_cycle}</Typography>
                                        </div>
                                        <Divider />
                                    </div>
                                ))}
                            </div>
                        )}
                        <PurchasePaymentOption
                            options={paymentOptions}
                            selected={formik.values.paymentOption}
                            onSelect={(value) => formik.setFieldValue("paymentOption", value)}
                        />
                        <div className="mt-6 hidden lg:block">
                            <PurchaseGuideLines />
                            <div className="mt-4 lg:mt-6">
                                <Quote icon={<Phone />} message='If you experience any issues during the payment process or have any questions, please feel free to contact our support team for assistance at ' phone='' />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <CoursePaymentCard
                            data={isSubscription ? { ...data, sale_price: activePlan?.price ?? "0" } : data}
                            vat={vat}
                            isLoading={payingViaEsewa || isKhaltiLoading}
                        />
                        <div className="mt-4 lg:mt-6 lg:hidden">
                            <PurchaseGuideLines />
                            <div className="mt-4 lg:mt-6">
                                <Quote icon={<Phone />} message='If you experience any issues during the payment process or have any questions, please feel free to contact our support team for assistance at ' phone='' />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}