import type { TemplateWidget } from "@/types/templateV2";
import { PanelSection, SelectInput } from "../shared";

const DOCUMENT_INFO_FIELDS: Array<{ key: string; label: string }> = [
    { key: "title", label: "Document Title (INVOICE/ESTIMATE/RECEIPT)" },
    { key: "number", label: "Number (#)" },
    { key: "date", label: "Date / Issue Date" },
    { key: "dueDate", label: "Due Date (invoice)" },
    { key: "expiryDate", label: "Expiry Date (estimate)" },
    { key: "terms", label: "Terms (invoice)" },
    { key: "poNumber", label: "PO Number" },
    { key: "projectName", label: "Project" },
    { key: "reference", label: "Reference" },
    { key: "placeOfSupply", label: "Place of Supply (invoice)" },
    { key: "paymentDate", label: "Payment Date (receipt)" },
    { key: "paymentMethod", label: "Payment Method (receipt)" },
    { key: "transactionId", label: "Transaction ID (receipt)" },
    { key: "relatedInvoiceNumber", label: "Related Invoice # (receipt)" },
];

const WIDGET_FIELDS: Partial<Record<string, Array<{ key: string; label: string }>>> = {
    companyDetails: [
        { key: "name", label: "Name" },
        { key: "address", label: "Address" },
        { key: "cityStateZip", label: "City / State / ZIP" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "website", label: "Website" },
        { key: "taxId", label: "Tax ID" },
    ],
    billTo: [
        { key: "label", label: '"Bill To" heading' },
        { key: "name", label: "Name" },
        { key: "company", label: "Company" },
        { key: "address", label: "Address" },
        { key: "cityStateZip", label: "City / State / ZIP" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
    ],
    shipTo: [
        { key: "label", label: '"Ship To" heading' },
        { key: "address", label: "Address" },
    ],
    documentInfo: DOCUMENT_INFO_FIELDS,
    invoiceDetails: DOCUMENT_INFO_FIELDS,
    estimateDetails: DOCUMENT_INFO_FIELDS,
    receiptDetails: DOCUMENT_INFO_FIELDS,
};

// -- Document Info Panel -----------------------------------------------------

function colorRow(label: string, value: string, onChange: (v: string) => void) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 6 }}>
            <span style={{ fontSize: 11, color: "#374151", flexShrink: 0 }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: 24, height: 24, padding: 1, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                    }}
                    onBlur={(e) => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{3}$/.test(v)) onChange(`#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`);
                    }}
                    style={{ width: 72, fontSize: 11, padding: "2px 4px", border: "1px solid #d1d5db", borderRadius: 4, fontFamily: "monospace" }}
                />
            </div>
        </div>
    );
}

export function DocumentInfoPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config" | "styles">>) => void;
}) {
    const config = widget.config ?? {};
    const styles = (widget.styles ?? {}) as Record<string, string>;
    const docType = (config.docType as string | undefined) ?? "";
    const layout = (config.layout as string | undefined) ?? "vertical";
    const isTable = layout === "table";

    const setStyle = (k: string, v: unknown) =>
        onUpdateConfig({ styles: { ...styles, [k]: v as string } });

    return (
        <>
            <PanelSection title="Document Type">
                <SelectInput
                    value={docType}
                    onChange={(v) => onUpdateConfig({ config: { ...config, docType: v || undefined } })}
                    options={[
                        { value: "", label: "Auto (from template)" },
                        { value: "invoice", label: "Invoice" },
                        { value: "estimate", label: "Estimate" },
                        { value: "receipt", label: "Receipt" },
                    ]}
                />
            </PanelSection>

            {isTable && (
                <PanelSection title="Field Style">
                    <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8, marginTop: -2 }}>Label column</p>
                    {colorRow("Background", (styles.labelBg as string) ?? "#111111", (v) => setStyle("labelBg", v))}
                    {colorRow("Text", (styles.labelColor as string) ?? "#ffffff", (v) => setStyle("labelColor", v))}
                    <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8, marginTop: 6 }}>Value column</p>
                    {colorRow("Background", (styles.valueBg as string) ?? "#ffffff", (v) => setStyle("valueBg", v))}
                    {colorRow("Text", (styles.valueColor as string) ?? "#111111", (v) => setStyle("valueColor", v))}
                    {colorRow("Border", (styles.tableBorderColor as string) ?? "#e5e7eb", (v) => setStyle("tableBorderColor", v))}
                </PanelSection>
            )}
        </>
    );
}

// -- Fields Config Panel -----------------------------------------------------

export function FieldsConfigPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (patch: Partial<Pick<TemplateWidget, "config">>) => void;
}) {
    const fieldDefs = WIDGET_FIELDS[widget.type];
    if (!fieldDefs) return null;

    const config = widget.config ?? {};
    const allKeys = fieldDefs.map((fd) => fd.key);
    const enabledFields: string[] =
        (config.fields as string[] | undefined) ?? allKeys;
    const layout = (config.layout as string | undefined) ?? "vertical";

    function toggleField(key: string) {
        const next = enabledFields.includes(key)
            ? enabledFields.filter((k) => k !== key)
            : [...enabledFields, key];
        const ordered = allKeys.filter((k) => next.includes(k));
        onUpdateConfig({ config: { ...config, fields: ordered } });
    }

    const gridColumns = (config.gridColumns as number | undefined) ?? 3;

    function setLayout(v: string) {
        onUpdateConfig({ config: { ...config, layout: v } });
    }

    function setGridColumns(v: number) {
        onUpdateConfig({ config: { ...config, gridColumns: v } });
    }

    return (
        <>
            <PanelSection title="Layout Direction">
                <div style={{ display: "flex", gap: 6 }}>
                    {([
                        { value: "vertical", label: "↕ Vertical" },
                        { value: "horizontal", label: "↔ Horizontal" },
                        { value: "table", label: "⊞ Table" },
                    ] as const).map(({ value: v, label }) => (
                        <button
                            key={v}
                            onClick={() => setLayout(v)}
                            style={{
                                flex: 1,
                                padding: "5px 4px",
                                fontSize: 11,
                                fontWeight: layout === v ? 700 : 500,
                                color: layout === v ? "#4f46e5" : "#64748b",
                                background: layout === v ? "#ede9fe" : "white",
                                border: `1px solid ${layout === v ? "#c7d2fe" : "#d1d5db"}`,
                                borderRadius: 5,
                                cursor: "pointer",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {layout === "horizontal" && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>Columns per row</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setGridColumns(n)}
                                    style={{
                                        flex: 1,
                                        padding: "4px 0",
                                        fontSize: 11,
                                        fontWeight: gridColumns === n ? 700 : 500,
                                        color: gridColumns === n ? "#4f46e5" : "#64748b",
                                        background: gridColumns === n ? "#ede9fe" : "white",
                                        border: `1px solid ${gridColumns === n ? "#c7d2fe" : "#d1d5db"}`,
                                        borderRadius: 5,
                                        cursor: "pointer",
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </PanelSection>

            <PanelSection title="Visible Fields">
                {fieldDefs.map(({ key, label }) => (
                    <label
                        key={key}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            marginBottom: 5,
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#374151",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={enabledFields.includes(key)}
                            onChange={() => toggleField(key)}
                        />
                        {label}
                    </label>
                ))}
            </PanelSection>
        </>
    );
}
