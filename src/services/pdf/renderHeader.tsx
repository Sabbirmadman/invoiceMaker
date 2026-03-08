import { View, Text, Image } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { TemplateElement } from "@/types/template";
import type { StoredDocument } from "@/types/document";
import { boldFont } from "./fonts";

/**
 * Renders the invoice/estimate/receipt details block.
 * Pass `fields` (from el.config?.fields) to show only selected fields.
 * Pass `contentCols` to lay fields out in multiple side-by-side columns (default 1).
 * Pass `accentColor` to colour the title underline (default gray).
 */
export function renderDetailsBlock(
    doc: StoredDocument,
    font: string,
    fields?: string[],
    contentCols?: number,
    accentColor?: string,
): ReactNode {
    const bold = boldFont(font);
    const meta = doc.data.meta;
    const show = (f: string) => !fields?.length || fields.includes(f);

    const rows: Array<{ label: string; value: string }> = [];

    if (meta.type === "invoice") {
        if (show("number"))
            rows.push({ label: "INVOICE #", value: meta.number || "" });
        if (show("date")) rows.push({ label: "DATE", value: meta.date || "" });
        if (show("dueDate") && meta.dueDate)
            rows.push({ label: "DUE DATE", value: meta.dueDate });
        if (show("terms") && meta.terms)
            rows.push({ label: "TERMS", value: meta.terms });
        if (show("poNumber") && meta.poNumber)
            rows.push({ label: "PO #", value: meta.poNumber });
        if (show("projectName") && meta.projectName)
            rows.push({ label: "PROJECT", value: meta.projectName });
        if (show("reference") && meta.reference)
            rows.push({ label: "REF", value: meta.reference });
        if (show("placeOfSupply") && meta.placeOfSupply)
            rows.push({ label: "PLACE", value: meta.placeOfSupply });
    } else if (meta.type === "estimate") {
        if (show("number"))
            rows.push({ label: "ESTIMATE #", value: meta.number || "" });
        if (show("date")) rows.push({ label: "DATE", value: meta.date || "" });
        if (show("expiryDate") && meta.expiryDate)
            rows.push({ label: "EXPIRY", value: meta.expiryDate });
        if (show("reference") && meta.reference)
            rows.push({ label: "REF", value: meta.reference });
        if (show("poNumber") && meta.poNumber)
            rows.push({ label: "PO #", value: meta.poNumber });
        if (show("projectName") && meta.projectName)
            rows.push({ label: "PROJECT", value: meta.projectName });
    } else {
        if (show("number"))
            rows.push({ label: "RECEIPT #", value: meta.number || "" });
        if (show("issueDate"))
            rows.push({ label: "ISSUE DATE", value: meta.issueDate || "" });
        if (show("paymentDate") && meta.paymentDate)
            rows.push({ label: "PAYMENT DATE", value: meta.paymentDate });
        if (show("paymentMethod") && meta.paymentMethod)
            rows.push({ label: "PAYMENT", value: meta.paymentMethod });
        if (show("transactionId") && meta.transactionId)
            rows.push({ label: "TXN ID", value: meta.transactionId });
        if (show("relatedInvoiceNumber") && meta.relatedInvoiceNumber)
            rows.push({ label: "INVOICE #", value: meta.relatedInvoiceNumber });
    }

    const cols = contentCols && contentCols > 1 ? contentCols : 1;
    const titleColor = accentColor ?? "#2563eb";

    /** Single field cell — label above, bold value below */
    const fieldCell = (r: { label: string; value: string }) => (
        <View key={r.label} style={{ marginBottom: 4, paddingRight: 8 }}>
            <Text
                style={{
                    fontSize: 8,
                    color: "#888",
                    marginBottom: 1,
                    fontFamily: bold,
                    letterSpacing: 1.5,
                }}
            >
                {r.label}
            </Text>
            <Text style={{ fontFamily: bold, fontSize: 11 }}>{r.value}</Text>
        </View>
    );

    // Split rows into chunks of `cols` for multi-column rendering
    const chunks: Array<typeof rows> = [];
    for (let i = 0; i < rows.length; i += cols) {
        chunks.push(rows.slice(i, i + cols));
    }

    return (
        <View>
            <Text
                style={{
                    fontSize: 24,
                    fontFamily: bold,
                    marginBottom: 4,
                    letterSpacing: 2,
                    color: titleColor,
                }}
            >
                {doc.documentType.toUpperCase()}
            </Text>
            <View
                style={{
                    borderBottomWidth: 2,
                    borderBottomColor: titleColor,
                    marginBottom: 6,
                }}
            />
            {cols > 1
                ? chunks.map((chunk, ci) => (
                      <View
                          key={ci}
                          style={{
                              flexDirection: "row",
                              marginBottom: ci < chunks.length - 1 ? 4 : 0,
                          }}
                      >
                          {chunk.map((r) => (
                              <View key={r.label} style={{ flex: 1 }}>
                                  {fieldCell(r)}
                              </View>
                          ))}
                      </View>
                  ))
                : rows.map((r) => fieldCell(r))}
        </View>
    );
}

/**
 * Renders a single header or footer section element.
 */
export function renderHeaderEl(
    el: TemplateElement,
    doc: StoredDocument,
    font: string,
): ReactNode {
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
            const cityLine = [c.city, c.state, c.zip]
                .filter(Boolean)
                .join(", ");
            return (
                <View>
                    {show("name") && c.name ? (
                        <Text
                            style={{
                                fontSize: 12,
                                fontFamily: bold,
                                marginBottom: 2,
                            }}
                        >
                            {c.name}
                        </Text>
                    ) : null}
                    {show("address") && c.address ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#555",
                                marginBottom: 1,
                            }}
                        >
                            {c.address}
                        </Text>
                    ) : null}
                    {show("cityStateZip") && cityLine ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#555",
                                marginBottom: 1,
                            }}
                        >
                            {cityLine}
                        </Text>
                    ) : null}
                    {show("country") && c.country ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#555",
                                marginBottom: 1,
                            }}
                        >
                            {c.country}
                        </Text>
                    ) : null}
                    {show("phone") && c.phone ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#555",
                                marginBottom: 1,
                            }}
                        >
                            {c.phone}
                        </Text>
                    ) : null}
                    {show("email") && c.email ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#555",
                                marginBottom: 1,
                            }}
                        >
                            {c.email}
                        </Text>
                    ) : null}
                    {show("website") && c.website ? (
                        <Text
                            style={{
                                fontSize: 9,
                                color: "#555",
                                marginBottom: 1,
                            }}
                        >
                            {c.website}
                        </Text>
                    ) : null}
                    {show("taxId") && c.taxId ? (
                        <Text style={{ fontSize: 9, color: "#555" }}>
                            Tax ID: {c.taxId}
                        </Text>
                    ) : null}
                </View>
            );
        }
        case "textLabel": {
            const text = (el.config?.text as string) ?? "";
            const fs = parseInt(el.styles?.fontSize ?? "28") || 28;
            return (
                <Text
                    style={{ fontSize: fs, fontFamily: bold, letterSpacing: 1 }}
                >
                    {text}
                </Text>
            );
        }
        case "invoiceDetails":
        case "estimateDetails":
        case "receiptDetails":
            return renderDetailsBlock(
                doc,
                font,
                el.config?.fields as string[] | undefined,
                el.config?.contentCols as number | undefined,
                el.styles?.accentColor,
            );
        default:
            return null;
    }
}
