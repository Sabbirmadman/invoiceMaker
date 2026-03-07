import {
    Document,
    Page,
    View,
    Text,
    Image,
    pdf,
    Font,
} from "@react-pdf/renderer";
import type {
    StoredDocument,
    LineItem,
    TotalsResult,
} from "@/types/document";
import type { Theme, TemplateElement } from "@/types/template";
import { calculateTotals, formatCurrency } from "./calculations";

// ---------------------------------------------------------------------------
// Font resolution
// ---------------------------------------------------------------------------
const SYSTEM_FONT_FALLBACK = "Helvetica";
const SYSTEM_BOLD_FALLBACK = "Helvetica-Bold";

const GOOGLE_FONT_MAP: Record<string, string> = {
    inter: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
    roboto: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff",
    lato: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff",
    poppins: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrFJA.woff",
    "open sans":
        "https://fonts.gstatic.com/s/opensans/v35/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiH0C4n.woff",
};

const registeredFonts = new Set<string>();

function resolvePdfFont(fontFamily: string): string {
    const lower = fontFamily
        .toLowerCase()
        .split(",")[0]
        .trim()
        .replace(/['\"]/g, "");
    if (["system-ui", "sans-serif", "arial", "helvetica"].includes(lower)) {
        return SYSTEM_FONT_FALLBACK;
    }
    if (GOOGLE_FONT_MAP[lower]) {
        if (!registeredFonts.has(lower)) {
            Font.register({ family: lower, src: GOOGLE_FONT_MAP[lower] });
            registeredFonts.add(lower);
        }
        return lower;
    }
    return SYSTEM_FONT_FALLBACK;
}

function boldFont(font: string): string {
    return font === SYSTEM_FONT_FALLBACK ? SYSTEM_BOLD_FALLBACK : font;
}

// ---------------------------------------------------------------------------
// Column definitions for item table
// ---------------------------------------------------------------------------
const COLUMN_WIDTHS: Record<string, object> = {
    name:        { flex: 2 },
    description: { flex: 3 },
    qty:         { width: 36, textAlign: "right" as const },
    unit:        { width: 36, textAlign: "right" as const },
    rate:        { width: 60, textAlign: "right" as const },
    discount:    { width: 50, textAlign: "right" as const },
    tax:         { width: 40, textAlign: "right" as const },
    amount:      { width: 70, textAlign: "right" as const },
};

const COLUMN_LABELS: Record<string, string> = {
    name:        "Item",
    description: "Description",
    qty:         "Qty",
    unit:        "Unit",
    rate:        "Rate",
    discount:    "Disc.",
    tax:         "Tax%",
    amount:      "Amount",
};

function cellValue(item: LineItem, col: string, currency: string): string {
    switch (col) {
        case "name":        return item.name;
        case "description": return item.description;
        case "qty":         return String(item.qty);
        case "unit":        return item.unit ?? "";
        case "rate":        return formatCurrency(item.rate, currency);
        case "discount":
            return item.discountType === "percent"
                ? `${item.discount}%`
                : formatCurrency(item.discount, currency);
        case "tax":         return `${item.taxRate}%`;
        case "amount":      return formatCurrency(item.amount, currency);
        default:            return "";
    }
}

// ---------------------------------------------------------------------------
// Helper: parse borderTop shorthand
// ---------------------------------------------------------------------------
function parseBorderTop(val?: string): { borderTopWidth?: number; borderTopColor?: string } {
    if (!val) return {};
    const parts = val.trim().split(/\s+/);
    return {
        borderTopWidth: parseInt(parts[0]) || 1,
        borderTopColor: parts[2] ?? "#e5e7eb",
    };
}

// ---------------------------------------------------------------------------
// Render: header element
// ---------------------------------------------------------------------------
function renderHeaderEl(
    el: TemplateElement,
    doc: StoredDocument,
    font: string,
): React.ReactNode {
    const { data } = doc;
    const bold = boldFont(font);
    switch (el.type) {
        case "logo": {
            if (!data.company.logoUrl) return null;
            return (
                <Image
                    src={data.company.logoUrl}
                    style={{ maxHeight: 60, objectFit: "contain" }}
                />
            );
        }
        case "companyDetails": {
            const c = data.company;
            const fields = (el.config?.fields as string[]) ?? [];
            const show = (f: string) => !fields.length || fields.includes(f);
            const cityLine = [c.city, c.state, c.zip].filter(Boolean).join(", ");
            return (
                <View>
                    {show("name") && c.name ? (
                        <Text style={{ fontSize: 12, fontFamily: bold, marginBottom: 2 }}>{c.name}</Text>
                    ) : null}
                    {show("address") && c.address ? (
                        <Text style={{ fontSize: 9, color: "#555", marginBottom: 1 }}>{c.address}</Text>
                    ) : null}
                    {show("cityStateZip") && cityLine ? (
                        <Text style={{ fontSize: 9, color: "#555", marginBottom: 1 }}>{cityLine}</Text>
                    ) : null}
                    {show("country") && c.country ? (
                        <Text style={{ fontSize: 9, color: "#555", marginBottom: 1 }}>{c.country}</Text>
                    ) : null}
                    {show("phone") && c.phone ? (
                        <Text style={{ fontSize: 9, color: "#555", marginBottom: 1 }}>{c.phone}</Text>
                    ) : null}
                    {show("email") && c.email ? (
                        <Text style={{ fontSize: 9, color: "#555", marginBottom: 1 }}>{c.email}</Text>
                    ) : null}
                    {show("website") && c.website ? (
                        <Text style={{ fontSize: 9, color: "#555", marginBottom: 1 }}>{c.website}</Text>
                    ) : null}
                    {show("taxId") && c.taxId ? (
                        <Text style={{ fontSize: 9, color: "#555" }}>Tax ID: {c.taxId}</Text>
                    ) : null}
                </View>
            );
        }
        case "textLabel": {
            const text = (el.config?.text as string) ?? "";
            const fs = parseInt(el.styles?.fontSize ?? "28") || 28;
            return (
                <Text style={{ fontSize: fs, fontFamily: bold, letterSpacing: 1 }}>{text}</Text>
            );
        }
        case "invoiceDetails":
        case "estimateDetails":
        case "receiptDetails":
            return renderDetailsBlock(doc, font);
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// Render: invoice/estimate/receipt details block
// ---------------------------------------------------------------------------
function renderDetailsBlock(doc: StoredDocument, font: string): React.ReactNode {
    const bold = boldFont(font);
    const meta = doc.data.meta;
    const rows: Array<{ label: string; value: string }> = [];
    if (meta.type === "invoice") {
        rows.push({ label: "INVOICE #", value: meta.number || "" });
        rows.push({ label: "DATE", value: meta.date || "" });
        if (meta.dueDate)  rows.push({ label: "DUE DATE", value: meta.dueDate });
        if (meta.terms)    rows.push({ label: "TERMS", value: meta.terms });
        if (meta.poNumber) rows.push({ label: "PO #", value: meta.poNumber });
    } else if (meta.type === "estimate") {
        rows.push({ label: "ESTIMATE #", value: meta.number || "" });
        rows.push({ label: "DATE", value: meta.date || "" });
        if (meta.expiryDate) rows.push({ label: "EXPIRY", value: meta.expiryDate });
        if (meta.reference)  rows.push({ label: "REF", value: meta.reference });
    } else {
        rows.push({ label: "RECEIPT #", value: meta.number || "" });
        rows.push({ label: "ISSUE DATE", value: meta.issueDate || "" });
        if (meta.paymentMethod)        rows.push({ label: "PAYMENT", value: meta.paymentMethod });
        if (meta.relatedInvoiceNumber) rows.push({ label: "INVOICE #", value: meta.relatedInvoiceNumber });
    }
    return (
        <View>
            <Text style={{ fontSize: 20, fontFamily: bold, marginBottom: 6, letterSpacing: 1 }}>
                {doc.documentType.toUpperCase()}
            </Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginBottom: 6 }} />
            {rows.map((r) => (
                <View key={r.label} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 8, color: "#888", marginBottom: 1 }}>{r.label}</Text>
                    <Text style={{ fontFamily: bold, fontSize: 10 }}>{r.value}</Text>
                </View>
            ))}
        </View>
    );
}

// ---------------------------------------------------------------------------
// Render: body element
// ---------------------------------------------------------------------------
function renderBodyEl(
    el: TemplateElement,
    doc: StoredDocument,
    totals: TotalsResult,
    font: string,
    theme: Theme,
): React.ReactNode {
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
            const cityLine = [cl.city, cl.state, cl.zip].filter(Boolean).join(", ");
            return (
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                        Bill To
                    </Text>
                    {cl.name ? <Text style={{ fontSize: 11, fontFamily: bold, marginBottom: 2 }}>{cl.name}</Text> : null}
                    {cl.company ? <Text style={{ color: "#444", marginBottom: 1 }}>{cl.company}</Text> : null}
                    {cl.address ? <Text style={{ color: "#444", marginBottom: 1 }}>{cl.address}</Text> : null}
                    {cityLine   ? <Text style={{ color: "#444", marginBottom: 1 }}>{cityLine}</Text>   : null}
                    {cl.country ? <Text style={{ color: "#444", marginBottom: 1 }}>{cl.country}</Text> : null}
                    {cl.phone   ? <Text style={{ color: "#444", marginBottom: 1 }}>{cl.phone}</Text>   : null}
                    {cl.email   ? <Text style={{ color: "#444", marginBottom: 1 }}>{cl.email}</Text>   : null}
                </View>
            );
        }
        case "shipTo": {
            if (!data.client.shippingAddress) return null;
            return (
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                        Ship To
                    </Text>
                    <Text style={{ color: "#444" }}>{data.client.shippingAddress}</Text>
                </View>
            );
        }
        case "logo": {
            if (!data.company.logoUrl) return null;
            return (
                <View style={{ marginBottom: 12 }}>
                    <Image src={data.company.logoUrl} style={{ maxHeight: 60, objectFit: "contain" }} />
                </View>
            );
        }
        case "companyDetails":
            return (
                <View style={{ marginBottom: 12 }}>{renderHeaderEl(el, doc, font)}</View>
            );
        case "invoiceDetails":
        case "estimateDetails":
        case "receiptDetails":
            return (
                <View style={{ marginBottom: 12 }}>{renderDetailsBlock(doc, font)}</View>
            );
        case "totalsBlock": {
            const show = (el.config?.show as string[]) ?? ["subTotal", "tax1", "total", "balanceDue"];
            const cur = data.totalsConfig.currency;
            return (
                <View style={{ marginTop: 8, alignItems: "flex-end" }}>
                    <View style={{ width: 220 }}>
                        {show.includes("subTotal") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>Subtotal</Text>
                                <Text style={{ fontSize: 9 }}>{formatCurrency(totals.subTotal, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("discount") && totals.overallDiscount > 0 ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>Discount</Text>
                                <Text style={{ fontSize: 9 }}>-{formatCurrency(totals.overallDiscount, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("tax1") && data.totalsConfig.tax1.enabled && totals.tax1Amount !== 0 ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>{data.totalsConfig.tax1.label} ({data.totalsConfig.tax1.rate}%)</Text>
                                <Text style={{ fontSize: 9 }}>{formatCurrency(totals.tax1Amount, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("tax2") && data.totalsConfig.tax2.enabled && totals.tax2Amount !== 0 ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>{data.totalsConfig.tax2.label} ({data.totalsConfig.tax2.rate}%)</Text>
                                <Text style={{ fontSize: 9 }}>{formatCurrency(totals.tax2Amount, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("shipping") && totals.shipping !== 0 ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>Shipping</Text>
                                <Text style={{ fontSize: 9 }}>{formatCurrency(totals.shipping, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("adjustment") && totals.adjustment !== 0 ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>Adjustment</Text>
                                <Text style={{ fontSize: 9 }}>{formatCurrency(totals.adjustment, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("total") ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>Total</Text>
                                <Text style={{ fontSize: 9, fontFamily: bold }}>{formatCurrency(totals.total, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("amountPaid") && totals.amountPaid > 0 ? (
                            <View style={rowStyle}>
                                <Text style={{ color: "#555", fontSize: 9 }}>Amount Paid</Text>
                                <Text style={{ fontSize: 9 }}>-{formatCurrency(totals.amountPaid, cur)}</Text>
                            </View>
                        ) : null}
                        {show.includes("balanceDue") ? (
                            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, marginTop: 4, borderTopWidth: 2, borderTopColor: theme.primaryColor }}>
                                <Text style={{ fontFamily: bold, fontSize: 11 }}>Balance Due</Text>
                                <Text style={{ fontFamily: bold, fontSize: 11 }}>{formatCurrency(totals.balanceDue, cur)}</Text>
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
                    <Text style={{ fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Notes</Text>
                    <Text style={{ color: "#555", fontSize: 9, lineHeight: 1.5 }}>{data.notes}</Text>
                </View>
            );
        case "termsConditions":
            if (!data.terms) return null;
            return (
                <View style={{ marginTop: 16 }}>
                    <Text style={{ fontSize: 8, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Terms & Conditions</Text>
                    <Text style={{ color: "#555", fontSize: 9, lineHeight: 1.5 }}>{data.terms}</Text>
                </View>
            );
        case "divider":
            return (
                <View style={{ borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 8 }} />
            );
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// Render: footer element
// ---------------------------------------------------------------------------
function renderFooterEl(
    el: TemplateElement,
    doc: StoredDocument,
): React.ReactNode {
    switch (el.type) {
        case "notes":
            return <Text style={{ fontSize: 8, color: "#666" }}>{doc.data.notes}</Text>;
        case "termsConditions":
            return <Text style={{ fontSize: 8, color: "#666" }}>{doc.data.terms}</Text>;
        case "pageNumber": {
            const align = (el.styles?.textAlign ?? "right") as "left" | "center" | "right";
            return (
                <Text
                    style={{ fontSize: 8, color: "#aaa", textAlign: align, width: "100%" }}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                />
            );
        }
        case "companyDetails":
            return <Text style={{ fontSize: 8, color: "#666" }}>{doc.data.company.name}</Text>;
        case "textLabel": {
            const text = (el.config?.text as string) ?? "";
            return <Text style={{ fontSize: 8, color: "#666" }}>{text}</Text>;
        }
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// Item table component
// ---------------------------------------------------------------------------
function TemplateItemsTable({
    items,
    columns,
    currency,
    headerBg,
    headerColor,
    altRowColor,
    font,
}: {
    items: LineItem[];
    columns: string[];
    currency: string;
    headerBg: string;
    headerColor: string;
    altRowColor: string;
    font: string;
}) {
    const bold = boldFont(font);
    return (
        <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: "row", backgroundColor: headerBg, paddingVertical: 6, paddingHorizontal: 8 }}>
                <View style={{ width: 24 }}>
                    <Text style={{ color: headerColor, fontSize: 9, fontFamily: bold }}>#</Text>
                </View>
                {columns.map((col) => (
                    <View key={col} style={COLUMN_WIDTHS[col] ?? { flex: 1 }}>
                        <Text style={{ color: headerColor, fontSize: 9, fontFamily: bold }}>
                            {COLUMN_LABELS[col] ?? col}
                        </Text>
                    </View>
                ))}
            </View>
            {items.map((item, idx) => (
                <View
                    key={item.id}
                    style={{
                        flexDirection: "row",
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f1f5f9",
                        backgroundColor: idx % 2 === 1 ? altRowColor : "transparent",
                    }}
                >
                    <View style={{ width: 24 }}>
                        <Text style={{ fontSize: 9 }}>{idx + 1}</Text>
                    </View>
                    {columns.map((col) => (
                        <View key={col} style={COLUMN_WIDTHS[col] ?? { flex: 1 }}>
                            <Text style={{ fontSize: 9 }}>{cellValue(item, col, currency)}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

// ---------------------------------------------------------------------------
// PDF Document  fully template-driven
// ---------------------------------------------------------------------------
function PdfDocument({ doc }: { doc: StoredDocument }) {
    const { data, templateSnapshot } = doc;
    const { theme, header, body, footer, pageSize } = templateSnapshot;
    const font = resolvePdfFont(theme.fontFamily);
    const totals = calculateTotals(data.items, data.totalsConfig);

    const bodyEls = body.elements;
    const itemListEl = bodyEls.find((e) => e.type === "itemList");
    const itemColumns = (itemListEl?.config?.columns as string[]) ?? ["name", "qty", "rate", "amount"];
    const tableHeaderBg = itemListEl?.styles?.headerBackground ?? theme.primaryColor;
    const tableHeaderColor = itemListEl?.styles?.headerColor ?? "#ffffff";
    const altRowColor = itemListEl?.styles?.alternateRowColor ?? "#f9fafb";

    const preTableEls = bodyEls.filter(
        (e) => e.type !== "itemList" && (e.placement ?? "last-page") === "first-page",
    );
    const postTableEls = bodyEls.filter(
        (e) => e.type !== "itemList" && (e.placement ?? "last-page") === "last-page",
    );

    const footerHeight = footer.visible ? footer.height : 0;

    return (
        <Document>
            <Page
                size={pageSize === "Letter" ? "LETTER" : "A4"}
                style={{
                    fontFamily: font,
                    fontSize: 10,
                    color: "#1a1a1a",
                    paddingBottom: footerHeight + 8,
                }}
            >
                {/* HEADER */}
                {header.visible && (
                    <View style={{ minHeight: header.height, flexDirection: "row", position: "relative" }}>
                        {header.elements
                            .filter((e) => e.type === "background")
                            .map((bg) => (
                                <View
                                    key={bg.id}
                                    style={{
                                        position: "absolute",
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: bg.styles?.backgroundColor ?? "#ffffff",
                                    }}
                                />
                            ))}
                        {header.grid.columns.map((col) => {
                            const el = header.elements.find(
                                (e) => e.gridArea?.col === col.id && e.type !== "background",
                            );
                            const align = el?.styles?.textAlign;
                            return (
                                <View
                                    key={col.id}
                                    style={{
                                        width: col.width,
                                        padding: 12,
                                        alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
                                    }}
                                >
                                    {el ? renderHeaderEl(el, doc, font) : null}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* BODY */}
                <View style={{ padding: 16, flex: 1 }}>
                    {preTableEls.map((el) => (
                        <View key={el.id}>{renderBodyEl(el, doc, totals, font, theme)}</View>
                    ))}
                    <TemplateItemsTable
                        items={data.items}
                        columns={itemColumns}
                        currency={data.totalsConfig.currency}
                        headerBg={tableHeaderBg}
                        headerColor={tableHeaderColor}
                        altRowColor={altRowColor}
                        font={font}
                    />
                    {postTableEls.map((el) => (
                        <View key={el.id}>{renderBodyEl(el, doc, totals, font, theme)}</View>
                    ))}
                </View>

                {/* FOOTER */}
                {footer.visible && (
                    <View
                        fixed
                        style={{
                            position: "absolute",
                            bottom: 0, left: 0, right: 0,
                            height: footer.height,
                            flexDirection: "row",
                        }}
                    >
                        {footer.elements
                            .filter((e) => e.type === "background")
                            .map((bg) => {
                                const border = parseBorderTop(bg.styles?.borderTop);
                                return (
                                    <View
                                        key={bg.id}
                                        style={{
                                            position: "absolute",
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: bg.styles?.backgroundColor ?? "#f9fafb",
                                            ...border,
                                        }}
                                    />
                                );
                            })}
                        {footer.grid.columns.map((col) => {
                            const el = footer.elements.find(
                                (e) => e.gridArea?.col === col.id && e.type !== "background",
                            );
                            const align = el?.styles?.textAlign;
                            return (
                                <View
                                    key={col.id}
                                    style={{
                                        width: col.width,
                                        padding: 8,
                                        justifyContent: "center",
                                        alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
                                    }}
                                >
                                    {el ? renderFooterEl(el, doc) : null}
                                </View>
                            );
                        })}
                    </View>
                )}
            </Page>
        </Document>
    );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function downloadPdf(doc: StoredDocument): Promise<void> {
    const blob = await pdf(<PdfDocument doc={doc} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.data.meta.number || doc.documentType}-${doc.id.slice(0, 6)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
