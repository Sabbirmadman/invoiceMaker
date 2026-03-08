import type { LineItem } from "@/types/document";
import { formatCurrency } from "@/services/calculations";

export type ColAlign = "left" | "right" | "center";

interface ColDef {
    flex?: number;
    fixedWidth?: number;
    align?: ColAlign;
}

const COLUMN_DEFS: Record<string, ColDef> = {
    name: { flex: 3 },
    description: { flex: 3 },
    qty: { fixedWidth: 40, align: "right" },
    unit: { fixedWidth: 40, align: "right" },
    rate: { fixedWidth: 65, align: "right" },
    discount: { fixedWidth: 55, align: "right" },
    tax: { fixedWidth: 45, align: "right" },
    amount: { fixedWidth: 75, align: "right" },
};

export const COLUMN_LABELS: Record<string, string> = {
    name: "Item",
    description: "Description",
    qty: "Qty",
    unit: "Unit",
    rate: "Rate",
    discount: "Discount",
    tax: "Tax %",
    amount: "Amount",
};

export function getColViewStyle(col: string): {
    flex?: number;
    width?: number;
} {
    const def = COLUMN_DEFS[col] ?? { flex: 1 };
    if (def.fixedWidth !== undefined) return { width: def.fixedWidth };
    return { flex: def.flex ?? 1 };
}

export function getColAlign(col: string): ColAlign {
    return COLUMN_DEFS[col]?.align ?? "left";
}

export function cellValue(
    item: LineItem,
    col: string,
    currency: string,
): string {
    switch (col) {
        case "name":
            return item.name;
        case "description":
            return item.description;
        case "qty":
            return String(item.qty);
        case "unit":
            return item.unit ?? "";
        case "rate":
            return formatCurrency(item.rate, currency);
        case "discount":
            return item.discountType === "percent"
                ? `${item.discount}%`
                : formatCurrency(item.discount, currency);
        case "tax":
            return `${item.taxRate}%`;
        case "amount":
            return formatCurrency(item.amount, currency);
        default:
            return "";
    }
}
