import type { DocumentData } from "@/types/document";
import type { TotalsResult } from "@/types/document";
import { formatCurrency } from "./calculations";

type TokenMap = Record<string, string>;

export function buildTokenMap(
    data: DocumentData,
    totals: TotalsResult,
): TokenMap {
    const { company, client, meta, totalsConfig, notes, terms } = data;
    const currency = totalsConfig.currency || "USD";

    const base: TokenMap = {
        // Company
        "{{company.name}}": company.name ?? "",
        "{{company.address}}": company.address ?? "",
        "{{company.city}}": company.city ?? "",
        "{{company.state}}": company.state ?? "",
        "{{company.zip}}": company.zip ?? "",
        "{{company.country}}": company.country ?? "",
        "{{company.phone}}": company.phone ?? "",
        "{{company.email}}": company.email ?? "",
        "{{company.website}}": company.website ?? "",
        "{{company.taxId}}": company.taxId ?? "",
        // Client
        "{{client.name}}": client.name ?? "",
        "{{client.company}}": client.company ?? "",
        "{{client.address}}": client.address ?? "",
        "{{client.city}}": client.city ?? "",
        "{{client.state}}": client.state ?? "",
        "{{client.zip}}": client.zip ?? "",
        "{{client.country}}": client.country ?? "",
        "{{client.phone}}": client.phone ?? "",
        "{{client.email}}": client.email ?? "",
        "{{client.taxId}}": client.taxId ?? "",
        "{{client.shippingAddress}}": client.shippingAddress ?? "",
        // Totals
        "{{totals.subTotal}}": formatCurrency(totals.subTotal, currency),
        "{{totals.discount}}": formatCurrency(totals.overallDiscount, currency),
        "{{totals.tax1.label}}": totalsConfig.tax1.label,
        "{{totals.tax1.rate}}": `${totalsConfig.tax1.rate}%`,
        "{{totals.tax1.amount}}": formatCurrency(totals.tax1Amount, currency),
        "{{totals.tax2.label}}": totalsConfig.tax2.label,
        "{{totals.tax2.rate}}": `${totalsConfig.tax2.rate}%`,
        "{{totals.tax2.amount}}": formatCurrency(totals.tax2Amount, currency),
        "{{totals.shipping}}": formatCurrency(totals.shipping, currency),
        "{{totals.adjustment}}": formatCurrency(totals.adjustment, currency),
        "{{totals.total}}": formatCurrency(totals.total, currency),
        "{{totals.amountPaid}}": formatCurrency(totals.amountPaid, currency),
        "{{totals.balanceDue}}": formatCurrency(totals.balanceDue, currency),
        // Document footer
        "{{document.notes}}": notes,
        "{{document.terms}}": terms,
    };

    if (meta.type === "invoice") {
        Object.assign(base, {
            "{{invoice.number}}": meta.number ?? "",
            "{{invoice.date}}": meta.date ?? "",
            "{{invoice.dueDate}}": meta.dueDate ?? "",
            "{{invoice.terms}}": meta.terms ?? "",
            "{{invoice.poNumber}}": meta.poNumber ?? "",
            "{{invoice.projectName}}": meta.projectName ?? "",
            "{{invoice.reference}}": meta.reference ?? "",
            "{{invoice.placeOfSupply}}": meta.placeOfSupply ?? "",
            "{{invoice.currency}}": meta.currency ?? "",
        });
    } else if (meta.type === "estimate") {
        Object.assign(base, {
            "{{estimate.number}}": meta.number ?? "",
            "{{estimate.date}}": meta.date ?? "",
            "{{estimate.expiryDate}}": meta.expiryDate ?? "",
            "{{estimate.reference}}": meta.reference ?? "",
            "{{estimate.poNumber}}": meta.poNumber ?? "",
            "{{estimate.projectName}}": meta.projectName ?? "",
            "{{estimate.currency}}": meta.currency ?? "",
        });
    } else if (meta.type === "receipt") {
        Object.assign(base, {
            "{{receipt.number}}": meta.number ?? "",
            "{{receipt.issueDate}}": meta.issueDate ?? "",
            "{{receipt.paymentDate}}": meta.paymentDate ?? "",
            "{{receipt.paymentMethod}}": meta.paymentMethod ?? "",
            "{{receipt.transactionId}}": meta.transactionId ?? "",
            "{{receipt.relatedInvoiceNumber}}": meta.relatedInvoiceNumber ?? "",
            "{{receipt.currency}}": meta.currency ?? "",
        });
    }

    return base;
}

export function resolveToken(token: string, tokenMap: TokenMap): string {
    return tokenMap[token] ?? token;
}

export function resolveText(text: string, tokenMap: TokenMap): string {
    return text.replace(/\{\{[^}]+\}\}/g, (match) => tokenMap[match] ?? match);
}
