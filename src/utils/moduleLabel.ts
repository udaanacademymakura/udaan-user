import type { PurchaseModuleTypes } from "../types/purchase";

const MODULE_LABELS: Record<PurchaseModuleTypes, string> = {
    course: "Course",
    test: "Test",
    bundle: "Bundle",
    ebook: "eBook",
};

export const getModuleLabel = (type?: PurchaseModuleTypes) => (type ? MODULE_LABELS[type] ?? "Course" : "Course");
