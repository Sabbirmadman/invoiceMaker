import { View, Text, Image } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { TemplateElement, Theme } from "@/types/template";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { boldFont } from "./fonts";
import { renderHeaderEl, renderDetailsBlock } from "./renderHeader";
import { formatCurrency } from "@/services/calculations";

export function renderBodyEl(
    el: TemplateElement,
    doc: StoredDocument,
    totals: TotalsResult,
    font: string,
    theme: Theme,
): ReactNode {
    const { data } = doc;
    const bold = boldFont(font);
    const rowStyle = {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        paddingVertical: 3,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    };

    switch (el.type) {
        case "billTo": {
            const cl = data.client;
            const cityLine = [cl.city, cl.state, cl.zip]
                .filter(Boolean)
                .join(", ");
            return (
                <View style={{ marginBottom: 12 }}>
                    <Text
                        style={{
                            fontSize: 8,
                            color: "#888",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 4,
                            fontFamily: bold,
                        }}
                    >
                        BILL TO
                    </Text>
                    {cl.name ? (
                        <Text
                            style={{
                                fontSize: 11,
                                fontFamily: bold,
                                marginBottom: 2,
                            }}
                        >
                            {cl.name}
                        </Text>
                    ) : null}
                    {cl.company ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#444",
                                marginBottom: 1,
                            }}
                        >
                            {cl.company}
                        </Text>
                    ) : null}
                    {cl.address ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#444",
                                marginBottom: 1,
                            }}
                        >
                            {cl.address}
                        </Text>
                    ) : null}
                    {cityLine ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#444",
                                marginBottom: 1,
                            }}
                        >
                            {cityLine}
                        </Text>
                    ) : null}
                    {cl.country ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#444",
                                marginBottom: 1,
                            }}
                        >
                            {cl.country}
                        </Text>
                    ) : null}
                    {cl.phone ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#444",
                                marginBottom: 1,
                            }}
                        >
                            {cl.phone}
                        </Text>
                    ) : null}
                    {cl.email ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#444",
                                marginBottom: 1,
                            }}
                        >
                            {cl.email}
                        </Text>
                    ) : null}
                </View>
            );
        }
        case "shipTo": {
            if (!data.client.shippingAddress) return null;
            return (
                <View style={{ marginBottom: 12 }}>
                    <Text
                        style={{
                            fontSize: 8,
                            color: "#888",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 4,
                        }}
                    >
                        Ship To
                    </Text>
                    <Text style={{ fontSize: 9, color: "#444" }}>
                        {data.client.shippingAddress}
                    </Text>
                </View>
            );
        }
        case "logo": {
            if (!data.company.logoUrl) return null;
            return (
                <View style={{ marginBottom: 12 }}>
                    <Image
                        src={data.company.logoUrl}
                        style={{ maxHeight: 60, objectFit: "contain" }}
                    />
                </View>
            );
        }
        case "companyDetails":
            return (
                <View style={{ marginBottom: 12 }}>
                    {renderHeaderEl(el, doc, font)}
                </View>
            );
        case "invoiceDetails":
        case "estimateDetails":
        case "receiptDetails":
            return (
                <View style={{ marginBottom: 12 }}>
                    {renderDetailsBlock(
                        doc,
                        font,
                        el.config?.fields as string[] | undefined,
                        el.config?.contentCols as number | undefined,
                        el.styles?.accentColor,
                    )}
                </View>
            );
        case "totalsBlock": {
            const show = (el.config?.show as string[]) ?? [
                "subTotal",
                "tax1",
                "total",
                "balanceDue",
            ];
            const cur = data.totalsConfig.currency;
            return (
                <View style={{ marginTop: 8, alignItems: "flex-end" }}>
                    <View style={{ width: 220 }}>
                        {show.includes("subTotal") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    Sub Total
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    {formatCurrency(totals.subTotal, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("discount") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    Discount
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    -
                                    {formatCurrency(
                                        totals.overallDiscount,
                                        cur,
                                    )}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("tax1") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    {data.totalsConfig.tax1.label} (
                                    {data.totalsConfig.tax1.rate}%)
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    {formatCurrency(totals.tax1Amount, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("tax2") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    {data.totalsConfig.tax2.label} (
                                    {data.totalsConfig.tax2.rate}%)
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    {formatCurrency(totals.tax2Amount, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("shipping") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    Shipping
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    {formatCurrency(totals.shipping, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("adjustment") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    Adjustment
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    {formatCurrency(totals.adjustment, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("total") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    Total
                                </Text>
                                <Text style={{ fontSize: 9, fontFamily: bold }}>
                                    {formatCurrency(totals.total, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("amountPaid") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>
                                    Amount Paid
                                </Text>
                                <Text style={{ fontSize: 9 }}>
                                    {formatCurrency(totals.amountPaid, cur)}
                                </Text>
                            </View>
                        ) : null}
                        {show.includes("balanceDue") ? (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    paddingVertical: 5,
                                    marginTop: 4,
                                    borderTopWidth: 2,
                                    borderTopColor: theme.primaryColor,
                                }}
                            >
                                <Text
                                    style={{ fontFamily: bold, fontSize: 11 }}
                                >
                                    Balance Due
                                </Text>
                                <Text
                                    style={{ fontFamily: bold, fontSize: 11 }}
                                >
                                    {formatCurrency(totals.balanceDue, cur)}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            );
        }
        case "notes":
            if (!data.notes) return null;
            return (
                <View style={{ marginTop: 16 }}>
                    <Text
                        style={{
                            fontSize: 8,
                            color: "#888",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 4,
                        }}
                    >
                        Notes
                    </Text>
                    <Text
                        style={{ color: "#555", fontSize: 9, lineHeight: 1.5 }}
                    >
                        {data.notes}
                    </Text>
                </View>
            );
        case "termsConditions":
            if (!data.terms) return null;
            return (
                <View style={{ marginTop: 16 }}>
                    <Text
                        style={{
                            fontSize: 8,
                            color: "#888",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 4,
                        }}
                    >
                        Terms & Conditions
                    </Text>
                    <Text
                        style={{ color: "#555", fontSize: 9, lineHeight: 1.5 }}
                    >
                        {data.terms}
                    </Text>
                </View>
            );
        case "divider":
            return (
                <View
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#e5e7eb",
                        marginVertical: 8,
                    }}
                />
            );
        default:
            return null;
    }
}
