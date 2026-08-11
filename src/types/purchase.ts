
export interface PaymentOption {
    id: number;
    label: string;
    value: string;
    image: string;
}

export type PurchaseModuleTypes = "course" | "test" | "bundle" | "ebook";

export type PaymentMethods = "esewa" | "khalti" | "free"

export interface PurchaseFormValues {
    paymentOption: PaymentMethods;
    amount: number | null;
}



export interface PurchaseProps {
    payment_method: PaymentMethods;
    transaction_amount: string;
    transaction_status: "success" | "failed" | "pending";
    transaction_id: string;
    reference_id: string;
    is_trial: boolean;

}

export interface EsewaPaymentPayload {
    payment_url: string;
    product_code: string;
    success_url: string;
    failure_url: string;
    amount: string;
    total_amount: string;
    tax_amount: string;
    transaction_uuid: string;
    product_service_charge: number;
    product_delivery_charge: number;
    signature: string;
}
