import type { LineItem, TotalsConfig, TotalsResult } from "@/types/document";

export function calculateLineAmount(
    item: Omit<LineItem, "amount" | "id">,
): number {
    const base = item.qty * item.rate;
    const discount =
        item.discountType === "percent"
            ? base * (item.discount / 100)
            : item.discount;
    const afterDiscount = Math.max(0, base - discount);
    // Per-item tax is applied to the line amount (e.g. GST/VAT per item)
    return afterDiscount * (1 + (item.taxRate ?? 0) / 100);
}

export function calculateTotals(
    items: LineItem[],
    config: TotalsConfig,
): TotalsResult {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);

    const itemDiscountTotal = items.reduce((sum, item) => {
        const base = item.qty * item.rate;
        const disc =
            item.discountType === "percent"
                ? base * (item.discount / 100)
                : item.discount;
        return sum + disc;
    }, 0);

    const overallDiscount =
        config.overallDiscountType === "percent"
            ? subTotal * (config.overallDiscount / 100)
            : config.overallDiscount;

    const afterDiscount = Math.max(0, subTotal - overallDiscount);

    const tax1Amount = config.tax1.enabled
        ? afterDiscount * (config.tax1.rate / 100)
        : 0;
    const tax2Amount = config.tax2.enabled
        ? afterDiscount * (config.tax2.rate / 100)
        : 0;

    const total =
        afterDiscount +
        tax1Amount +
        tax2Amount +
        config.shipping +
        config.adjustment;

    const balanceDue = total - config.amountPaid;

    return {
        subTotal,
        itemDiscountTotal,
        overallDiscount,
        tax1Amount,
        tax2Amount,
        shipping: config.shipping,
        adjustment: config.adjustment,
        total,
        amountPaid: config.amountPaid,
        balanceDue,
    };
}

export function formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
