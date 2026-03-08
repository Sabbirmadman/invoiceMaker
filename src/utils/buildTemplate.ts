import type {
    Template,
    TemplateElement,
    Section,
    BodySection,
    ElementType,
} from "@/types/template";
import type { DocumentType, PageSize } from "@/types/common";

export type HeaderElementSlot =
    | "logo"
    | "companyDetails"
    | "textLabel"
    | "detailsBlock"
    | "empty";
export type FooterElementSlot =
    | "notes"
    | "termsConditions"
    | "pageNumber"
    | "empty";

export const COMPANY_FIELD_OPTIONS = [
    { value: "name", label: "Company Name" },
    { value: "address", label: "Address" },
    { value: "cityStateZip", label: "City / State / ZIP" },
    { value: "country", label: "Country" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "website", label: "Website" },
    { value: "taxId", label: "Tax ID" },
] as const;

export type CompanyField = (typeof COMPANY_FIELD_OPTIONS)[number]["value"];

export const ALL_COMPANY_FIELDS: CompanyField[] = COMPANY_FIELD_OPTIONS.map(
    (o) => o.value,
);

export const INVOICE_DETAILS_FIELD_OPTIONS = [
    { value: "number", label: "Invoice #" },
    { value: "date", label: "Date" },
    { value: "dueDate", label: "Due Date" },
    { value: "terms", label: "Terms" },
    { value: "poNumber", label: "PO Number" },
    { value: "projectName", label: "Project" },
    { value: "reference", label: "Reference" },
    { value: "placeOfSupply", label: "Place of Supply" },
] as const;

export const ESTIMATE_DETAILS_FIELD_OPTIONS = [
    { value: "number", label: "Estimate #" },
    { value: "date", label: "Date" },
    { value: "expiryDate", label: "Expiry Date" },
    { value: "reference", label: "Reference" },
    { value: "poNumber", label: "PO Number" },
    { value: "projectName", label: "Project" },
] as const;

export const RECEIPT_DETAILS_FIELD_OPTIONS = [
    { value: "number", label: "Receipt #" },
    { value: "issueDate", label: "Issue Date" },
    { value: "paymentDate", label: "Payment Date" },
    { value: "paymentMethod", label: "Payment Method" },
    { value: "transactionId", label: "Transaction ID" },
    { value: "relatedInvoiceNumber", label: "Related Invoice #" },
] as const;

export function getDetailsFieldOptions(docType: DocumentType) {
    if (docType === "estimate") return ESTIMATE_DETAILS_FIELD_OPTIONS;
    if (docType === "receipt") return RECEIPT_DETAILS_FIELD_OPTIONS;
    return INVOICE_DETAILS_FIELD_OPTIONS;
}

// ──────────────────────────────────────────────────────────────────────
// Body first-page grid system
// ──────────────────────────────────────────────────────────────────────

export type BodyElementKey =
    | "billTo"
    | "shipTo"
    | "details"
    | "logo"
    | "companyDetails";

export interface BodyGridColumn {
    width: string;
    element: BodyElementKey | "empty";
    companyFields?: CompanyField[];
    detailsFields?: string[];
}

export interface BodySingleItem {
    type: "single";
    key: BodyElementKey;
    show: boolean;
    companyFields?: CompanyField[];
    detailsFields?: string[];
}

export interface BodyGridItem {
    type: "grid";
    id: string;
    columns: BodyGridColumn[];
}

export type BodyFirstPageItem = BodySingleItem | BodyGridItem;

// ──────────────────────────────────────────────────────────────────────

export interface ColumnConfig {
    width: string; // e.g. "50%"
    element: HeaderElementSlot | FooterElementSlot;
    align?: "left" | "center" | "right"; // horizontal alignment within the column
    textLabelText?: string; // only when element === 'textLabel'
    companyFields?: CompanyField[]; // only when element === 'companyDetails'
    detailsFields?: string[]; // only when element === 'detailsBlock'
    /** Number of internal columns to grid the element's fields into (default 1). */
    contentCols?: number;
}

export interface WizardState {
    // Step 1: Basics
    name: string;
    documentType: DocumentType;
    pageSize: PageSize;

    // Step 2: Theme
    primaryColor: string;
    accentColor: string;
    fontFamily: string;

    // Step 3: Header
    headerHeight: number;
    headerBackground: string;
    headerBackgroundImage: string; // DataURL or empty
    headerBackgroundSize: "cover" | "contain" | "repeat";
    headerColumns: ColumnConfig[];
    logoFit: "contain" | "cover" | "fill";
    logoMaxHeight: string; // e.g. '80px' or '100%'

    // Step 4: Body elements
    /** Ordered list of first-page body items — single toggle rows and/or grid rows */
    bodyFirstPageItems: BodyFirstPageItem[];
    itemColumns: string[]; // e.g. ['name','qty','rate','amount']
    itemHeaderBackground: string;
    itemHeaderColor: string;
    itemAlternateRowColor: string;
    totalsShow: string[]; // e.g. ['subTotal','tax1','total','balanceDue']
    showNotes: boolean;
    showTerms: boolean;
    showDivider: boolean; // divider line in body (before totals)
    // Ordered list of last-page body element keys for reordering
    bodyLastPageOrder: Array<"totals" | "notes" | "terms" | "divider">;

    // Body background
    bodyBackgroundColor: string;
    bodyBackgroundImage: string; // DataURL or empty
    bodyBackgroundSize: "cover" | "contain" | "repeat";

    // Footer
    footerHeight: number;
    footerBackground: string;
    footerBackgroundImage: string; // DataURL or empty
    footerBackgroundSize: "cover" | "contain" | "repeat";
    footerBorderColor: string;
    footerColumns: ColumnConfig[];
}

export function defaultWizardState(): WizardState {
    return {
        name: "My Template",
        documentType: "invoice",
        pageSize: "A4",
        primaryColor: "#111111",
        accentColor: "#2563eb",
        fontFamily: "system-ui, sans-serif",
        headerHeight: 140,
        headerBackground: "#ffffff",
        headerBackgroundImage: "",
        headerBackgroundSize: "cover",
        headerColumns: [
            { width: "50%", element: "companyDetails" },
            { width: "50%", element: "detailsBlock" },
        ],
        logoFit: "contain",
        logoMaxHeight: "80px",
        bodyFirstPageItems: [
            { type: "single", key: "billTo", show: true },
            { type: "single", key: "shipTo", show: false },
            { type: "single", key: "details", show: false },
            { type: "single", key: "logo", show: false },
            { type: "single", key: "companyDetails", show: false },
        ],
        bodyLastPageOrder: ["divider", "totals", "notes", "terms"],
        itemColumns: ["name", "qty", "rate", "amount"],
        itemHeaderBackground: "#111111",
        itemHeaderColor: "#ffffff",
        itemAlternateRowColor: "#f9fafb",
        totalsShow: ["subTotal", "tax1", "total", "balanceDue"],
        showNotes: true,
        showTerms: true,
        bodyBackgroundColor: "",
        bodyBackgroundImage: "",
        bodyBackgroundSize: "cover",
        footerHeight: 80,
        footerBackground: "#f9fafb",
        footerBackgroundImage: "",
        footerBackgroundSize: "cover",
        footerBorderColor: "#e5e7eb",
        footerColumns: [
            { width: "70%", element: "notes" },
            { width: "30%", element: "pageNumber" },
        ],
    };
}

// ──────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────

let _id = 0;
function uid(prefix: string) {
    return `${prefix}_${++_id}_${Date.now()}`;
}

function detailsElement(
    docType: DocumentType,
    colId: string,
    rowId: string,
    fields?: string[],
    accentColor?: string,
): TemplateElement {
    const accentStyle = accentColor ? { accentColor } : {};
    if (docType === "invoice") {
        return {
            id: uid("el_inv_details"),
            type: "invoiceDetails",
            zIndex: 3,
            gridArea: { col: colId, row: rowId },
            ...(fields ? { config: { fields } } : {}),
            styles: accentStyle,
            bindings: {
                number: "{{invoice.number}}",
                date: "{{invoice.date}}",
                dueDate: "{{invoice.dueDate}}",
                terms: "{{invoice.terms}}",
                poNumber: "{{invoice.poNumber}}",
            },
        };
    }
    if (docType === "estimate") {
        return {
            id: uid("el_est_details"),
            type: "estimateDetails",
            zIndex: 3,
            gridArea: { col: colId, row: rowId },
            ...(fields ? { config: { fields } } : {}),
            styles: accentStyle,
            bindings: {
                number: "{{estimate.number}}",
                date: "{{estimate.date}}",
                expiryDate: "{{estimate.expiryDate}}",
                reference: "{{estimate.reference}}",
            },
        };
    }
    return {
        id: uid("el_rec_details"),
        type: "receiptDetails",
        zIndex: 3,
        gridArea: { col: colId, row: rowId },
        ...(fields ? { config: { fields } } : {}),
        styles: accentStyle,
        bindings: {
            number: "{{receipt.number}}",
            issueDate: "{{receipt.issueDate}}",
            paymentMethod: "{{receipt.paymentMethod}}",
            relatedInvoiceNumber: "{{receipt.relatedInvoiceNumber}}",
        },
    };
}

function headerSlotElement(
    slot: HeaderElementSlot,
    colId: string,
    rowId: string,
    docType: DocumentType,
    textLabelText?: string,
    logoFit?: string,
    logoMaxHeight?: string,
    companyFields?: CompanyField[],
    align?: "left" | "center" | "right",
    detailsFields?: string[],
    accentColor?: string,
): TemplateElement | null {
    const alignStyle = align && align !== "left" ? { textAlign: align } : {};
    switch (slot) {
        case "logo":
            return {
                id: uid("el_logo"),
                type: "logo",
                zIndex: 5,
                gridArea: { col: colId, row: rowId },
                styles: {
                    maxHeight: logoMaxHeight ?? "80px",
                    objectFit: logoFit ?? "contain",
                    ...(logoFit === "fill"
                        ? { width: "100%", height: "100%" }
                        : {}),
                    ...alignStyle,
                },
            };
        case "companyDetails":
            return {
                id: uid("el_company"),
                type: "companyDetails",
                zIndex: 3,
                gridArea: { col: colId, row: rowId },
                config: { fields: companyFields ?? ALL_COMPANY_FIELDS },
                styles: alignStyle,
                bindings: {
                    name: "{{company.name}}",
                    address: "{{company.address}}",
                    phone: "{{company.phone}}",
                    email: "{{company.email}}",
                    website: "{{company.website}}",
                    taxId: "{{company.taxId}}",
                },
            };
        case "textLabel":
            return {
                id: uid("el_label"),
                type: "textLabel",
                zIndex: 3,
                gridArea: { col: colId, row: rowId },
                config: { text: textLabelText ?? "INVOICE" },
                styles: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    ...alignStyle,
                },
            };
        case "detailsBlock":
            return detailsElement(
                docType,
                colId,
                rowId,
                detailsFields,
                accentColor,
            );
        case "empty":
            return null;
    }
}

function footerSlotElement(
    slot: FooterElementSlot,
    colId: string,
    rowId: string,
): TemplateElement | null {
    switch (slot) {
        case "notes":
            return {
                id: uid("el_notes"),
                type: "notes",
                zIndex: 2,
                gridArea: { col: colId, row: rowId },
                bindings: { text: "{{document.notes}}" },
            };
        case "termsConditions":
            return {
                id: uid("el_terms"),
                type: "termsConditions",
                zIndex: 2,
                gridArea: { col: colId, row: rowId },
                bindings: { text: "{{document.terms}}" },
            };
        case "pageNumber":
            return {
                id: uid("el_page_num"),
                type: "pageNumber",
                zIndex: 2,
                gridArea: { col: colId, row: rowId },
                config: { format: "Page {{page.current}} of {{page.total}}" },
                styles: { textAlign: "right" },
            };
        case "empty":
            return null;
    }
}

// ──────────────────────────────────────────────────────────────────────
// Body element factory
// ──────────────────────────────────────────────────────────────────────

function bodyElementForKey(
    key: BodyElementKey,
    state: WizardState,
    companyFields?: CompanyField[],
    detailsFields?: string[],
): TemplateElement | null {
    switch (key) {
        case "billTo":
            return {
                id: uid("el_bill_to"),
                type: "billTo",
                placement: "first-page",
                zIndex: 3,
                bindings: {
                    name: "{{client.name}}",
                    company: "{{client.company}}",
                    address: "{{client.address}}",
                    city: "{{client.city}}",
                    state: "{{client.state}}",
                    zip: "{{client.zip}}",
                    country: "{{client.country}}",
                    phone: "{{client.phone}}",
                    email: "{{client.email}}",
                },
            };
        case "shipTo":
            return {
                id: uid("el_ship_to"),
                type: "shipTo",
                placement: "first-page",
                zIndex: 3,
                bindings: {
                    shippingAddress: "{{client.shippingAddress}}",
                },
            };
        case "details": {
            const el = detailsElement(
                state.documentType,
                "col_body",
                "row_body",
                detailsFields,
                state.accentColor,
            );
            return {
                ...el,
                placement: "first-page" as const,
                gridArea: undefined,
            };
        }
        case "logo":
            return {
                id: uid("el_body_logo"),
                type: "logo" as const,
                placement: "first-page" as const,
                zIndex: 3,
                styles: {
                    maxHeight: state.logoMaxHeight,
                    objectFit: state.logoFit,
                    ...(state.logoFit === "fill"
                        ? { width: "100%", height: "100%" }
                        : {}),
                },
            };
        case "companyDetails":
            return {
                id: uid("el_body_company"),
                type: "companyDetails" as const,
                placement: "first-page" as const,
                zIndex: 3,
                config: {
                    fields: companyFields ?? ALL_COMPANY_FIELDS,
                },
                bindings: {
                    name: "{{company.name}}",
                    address: "{{company.address}}",
                    phone: "{{company.phone}}",
                    email: "{{company.email}}",
                    website: "{{company.website}}",
                    taxId: "{{company.taxId}}",
                },
            };
    }
}

// ──────────────────────────────────────────────────────────────────────
// Main builder
// ──────────────────────────────────────────────────────────────────────

export function buildTemplateFromWizard(
    state: WizardState,
    templateId?: string,
): Template {
    const id = templateId ?? `tmpl_custom_${Date.now()}`;

    // ── Header ──────────────────────────────────────────────────────────
    const headerColIds = state.headerColumns.map((_, i) => `col_h${i + 1}`);
    const headerRowId = "row_h1";

    const headerBgStyles: Record<string, string> = {
        backgroundColor: state.headerBackground,
    };
    if (state.headerBackgroundImage) {
        headerBgStyles.backgroundImage = `url('${state.headerBackgroundImage}')`;
        headerBgStyles.backgroundSize = state.headerBackgroundSize;
        headerBgStyles.backgroundPosition = "center";
        headerBgStyles.backgroundRepeat =
            state.headerBackgroundSize === "repeat" ? "repeat" : "no-repeat";
    }

    const headerElements: TemplateElement[] = [
        {
            id: uid("el_hdr_bg"),
            type: "background",
            zIndex: 1,
            styles: headerBgStyles,
        },
    ];
    state.headerColumns.forEach((col, i) => {
        const el = headerSlotElement(
            col.element as HeaderElementSlot,
            headerColIds[i],
            headerRowId,
            state.documentType,
            col.textLabelText,
            state.logoFit,
            state.logoMaxHeight,
            col.companyFields,
            col.align,
            col.detailsFields,
            state.accentColor,
        );
        if (el) {
            // Pass contentCols into the element config
            if (col.contentCols && col.contentCols > 1) {
                el.config = {
                    ...(el.config ?? {}),
                    contentCols: col.contentCols,
                };
            }
            headerElements.push(el);
        }
    });

    const header: Section = {
        height: state.headerHeight,
        visible: true,
        grid: {
            columns: state.headerColumns.map((col, i) => ({
                id: headerColIds[i],
                width: col.width,
            })),
            rows: [{ id: headerRowId, height: "auto" }],
        },
        elements: headerElements,
    };

    // ── Body ─────────────────────────────────────────────────────────────
    const bodyElements: TemplateElement[] = [];

    // Add first-page items in user-defined order (singles + grid rows)
    for (const item of state.bodyFirstPageItems) {
        if (item.type === "single") {
            if (!item.show) continue;
            const el = bodyElementForKey(
                item.key,
                state,
                item.companyFields,
                item.detailsFields,
            );
            if (el) bodyElements.push(el);
        } else {
            // grid row — add each non-empty column element tagged with gridRowId
            for (const col of item.columns) {
                if (col.element === "empty") continue;
                const el = bodyElementForKey(
                    col.element,
                    state,
                    col.companyFields,
                    col.detailsFields,
                );
                if (el) {
                    el.gridRowId = item.id;
                    el.styles = {
                        ...(el.styles ?? {}),
                        gridColWidth: col.width,
                    };
                    bodyElements.push(el);
                }
            }
        }
    }

    bodyElements.push({
        id: uid("el_items"),
        type: "itemList",
        placement: "all-pages",
        zIndex: 3,
        config: {
            columns: state.itemColumns,
            columnHeaderRepeat: true,
        },
        styles: {
            headerBackground: state.itemHeaderBackground,
            headerColor: state.itemHeaderColor,
            alternateRowColor: state.itemAlternateRowColor,
        },
    });

    // Map of last-page element builders keyed by order id
    const lastPageBuilders: Record<string, TemplateElement | null> = {
        divider: state.showDivider
            ? {
                  id: uid("el_divider"),
                  type: "divider" as const,
                  placement: "last-page" as const,
                  zIndex: 3,
              }
            : null,
        totals: {
            id: uid("el_totals"),
            type: "totalsBlock" as const,
            placement: "last-page" as const,
            zIndex: 3,
            config: { show: state.totalsShow },
        },
        notes: state.showNotes
            ? {
                  id: uid("el_notes_body"),
                  type: "notes" as const,
                  placement: "last-page" as const,
                  zIndex: 3,
                  bindings: { text: "{{document.notes}}" },
              }
            : null,
        terms: state.showTerms
            ? {
                  id: uid("el_terms_body"),
                  type: "termsConditions" as const,
                  placement: "last-page" as const,
                  zIndex: 3,
                  bindings: { text: "{{document.terms}}" },
              }
            : null,
    };

    // Add last-page elements in user-defined order
    for (const key of state.bodyLastPageOrder) {
        const el = lastPageBuilders[key];
        if (el) bodyElements.push(el);
    }

    const body: BodySection = { elements: bodyElements };

    // ── Footer ────────────────────────────────────────────────────────────
    const footerColIds = state.footerColumns.map((_, i) => `col_f${i + 1}`);
    const footerRowId = "row_f1";

    const footerBgStyles: Record<string, string> = {
        backgroundColor: state.footerBackground,
        borderTop: `1px solid ${state.footerBorderColor}`,
    };
    if (state.footerBackgroundImage) {
        footerBgStyles.backgroundImage = `url('${state.footerBackgroundImage}')`;
        footerBgStyles.backgroundSize = state.footerBackgroundSize;
        footerBgStyles.backgroundPosition = "center";
        footerBgStyles.backgroundRepeat =
            state.footerBackgroundSize === "repeat" ? "repeat" : "no-repeat";
    }

    const footerElements: TemplateElement[] = [
        {
            id: uid("el_ftr_bg"),
            type: "background",
            zIndex: 1,
            styles: footerBgStyles,
        },
    ];
    state.footerColumns.forEach((col, i) => {
        const el = footerSlotElement(
            col.element as FooterElementSlot,
            footerColIds[i],
            footerRowId,
        );
        if (el) footerElements.push(el);
    });

    const footer: Section = {
        height: state.footerHeight,
        visible: true,
        grid: {
            columns: state.footerColumns.map((col, i) => ({
                id: footerColIds[i],
                width: col.width,
            })),
            rows: [{ id: footerRowId, height: "auto" }],
        },
        elements: footerElements,
    };

    return {
        id,
        name: state.name,
        documentType: state.documentType,
        pageSize: state.pageSize,
        orientation: "portrait",
        theme: {
            fontFamily: state.fontFamily,
            primaryColor: state.primaryColor,
            accentColor: state.accentColor,
            ...(state.bodyBackgroundColor || state.bodyBackgroundImage
                ? {
                      bodyBackground: {
                          color: state.bodyBackgroundColor || undefined,
                          imageUrl: state.bodyBackgroundImage || undefined,
                          imageSize: state.bodyBackgroundSize,
                      },
                  }
                : {}),
        },
        header,
        body,
        footer,
    };
}

// ──────────────────────────────────────────────────────────────────────
// Reverse-engineer a Template back into a WizardState for editing
// ──────────────────────────────────────────────────────────────────────

const DETAILS_TYPES: ElementType[] = [
    "invoiceDetails",
    "estimateDetails",
    "receiptDetails",
];

/**
 * Reconstructs a WizardState from a saved Template so the editor can be
 * pre-populated when the user clicks "Edit" on an existing template.
 */
export function wizardStateFromTemplate(tmpl: Template): WizardState {
    const defaults = defaultWizardState();

    // ── Step 1: Basics ──────────────────────────────────────────────────
    const name = tmpl.name;
    const documentType = tmpl.documentType;
    const pageSize = tmpl.pageSize;

    // ── Step 2: Theme ───────────────────────────────────────────────────
    const primaryColor = tmpl.theme.primaryColor ?? defaults.primaryColor;
    const accentColor = tmpl.theme.accentColor ?? defaults.accentColor;
    const fontFamily = tmpl.theme.fontFamily ?? defaults.fontFamily;

    // ── Step 3: Header ──────────────────────────────────────────────────
    const headerHeight = tmpl.header.height;
    const headerBgEl = tmpl.header.elements.find(
        (e) => e.type === "background",
    );
    const headerBackground = headerBgEl?.styles?.backgroundColor ?? "#ffffff";

    // Extract background image (strip url('...') wrapper)
    const rawHdrBgImg = headerBgEl?.styles?.backgroundImage ?? "";
    const headerBackgroundImage = rawHdrBgImg
        .replace(/^url\(['"]?/, "")
        .replace(/['"]?\)$/, "");
    const headerBackgroundSize = (headerBgEl?.styles?.backgroundSize ??
        "cover") as WizardState["headerBackgroundSize"];

    // Extract logo options from the logo element if present
    const logoEl = tmpl.header.elements.find((e) => e.type === "logo");
    const logoFit = (logoEl?.styles?.objectFit ??
        "contain") as WizardState["logoFit"];
    const logoMaxHeight = logoEl?.styles?.maxHeight ?? "80px";

    // Reconstruct header columns from the grid + elements
    const headerColumns: ColumnConfig[] = tmpl.header.grid.columns.map(
        (gridCol) => {
            const width = gridCol.width;
            // Find the element in this column (match by gridArea.col)
            const el = tmpl.header.elements.find(
                (e) =>
                    e.gridArea?.col === gridCol.id && e.type !== "background",
            );
            if (!el) return { width, element: "empty" };

            const contentCols = el.config?.contentCols as number | undefined;
            const colsExtra =
                contentCols && contentCols > 1 ? { contentCols } : {};

            if (el.type === "logo")
                return { width, element: "logo", ...colsExtra };
            if (el.type === "companyDetails") {
                const fields =
                    (el.config?.fields as CompanyField[] | undefined) ??
                    ALL_COMPANY_FIELDS;
                return {
                    width,
                    element: "companyDetails",
                    companyFields: fields,
                    ...colsExtra,
                };
            }
            if (el.type === "textLabel") {
                return {
                    width,
                    element: "textLabel",
                    textLabelText: (el.config?.text as string) ?? "INVOICE",
                    ...colsExtra,
                };
            }
            if (DETAILS_TYPES.includes(el.type)) {
                const detailsFields = el.config?.fields as string[] | undefined;
                return {
                    width,
                    element: "detailsBlock" as HeaderElementSlot,
                    ...(detailsFields ? { detailsFields } : {}),
                    ...colsExtra,
                };
            }
            return { width, element: "empty" };
        },
    );

    // ── Step 4: Body ────────────────────────────────────────────────────
    const bodyEls = tmpl.body.elements;

    const itemListEl = bodyEls.find((e) => e.type === "itemList");
    const itemColumns =
        (itemListEl?.config?.columns as string[]) ?? defaults.itemColumns;
    const itemHeaderBackground =
        itemListEl?.styles?.headerBackground ?? defaults.itemHeaderBackground;
    const itemHeaderColor =
        itemListEl?.styles?.headerColor ?? defaults.itemHeaderColor;
    const itemAlternateRowColor =
        itemListEl?.styles?.alternateRowColor ?? defaults.itemAlternateRowColor;

    const totalsEl = bodyEls.find((e) => e.type === "totalsBlock");
    const totalsShow =
        (totalsEl?.config?.show as string[]) ?? defaults.totalsShow;

    const showNotes = bodyEls.some((e) => e.type === "notes" && !e.gridArea);
    const showTerms = bodyEls.some(
        (e) => e.type === "termsConditions" && !e.gridArea,
    );
    const showDivider = bodyEls.some((e) => e.type === "divider");

    // Reconstruct bodyFirstPageItems from saved body elements
    const firstPageEls = bodyEls.filter(
        (e) => (e.placement ?? "last-page") === "first-page",
    );

    function elementTypeToBodyKey(type: string): BodyElementKey | null {
        if (type === "billTo") return "billTo";
        if (type === "shipTo") return "shipTo";
        if (DETAILS_TYPES.includes(type as ElementType)) return "details";
        if (type === "logo") return "logo";
        if (type === "companyDetails") return "companyDetails";
        return null;
    }

    const seenGridIds = new Set<string>();
    const usedSingleKeys = new Set<BodyElementKey>();
    const bodyFirstPageItems: BodyFirstPageItem[] = [];

    for (const el of firstPageEls) {
        if (el.gridRowId) {
            if (!seenGridIds.has(el.gridRowId)) {
                seenGridIds.add(el.gridRowId);
                const rowEls = firstPageEls.filter(
                    (e) => e.gridRowId === el.gridRowId,
                );
                const columns: BodyGridColumn[] = rowEls.map((re) => {
                    const key = elementTypeToBodyKey(re.type) ?? "empty";
                    return {
                        width: re.styles?.gridColWidth ?? "50%",
                        element: key,
                        ...(re.type === "companyDetails"
                            ? {
                                  companyFields: re.config?.fields as
                                      | CompanyField[]
                                      | undefined,
                              }
                            : {}),
                        ...(DETAILS_TYPES.includes(re.type as ElementType)
                            ? {
                                  detailsFields: re.config?.fields as
                                      | string[]
                                      | undefined,
                              }
                            : {}),
                    };
                });
                bodyFirstPageItems.push({
                    type: "grid",
                    id: el.gridRowId,
                    columns,
                });
            }
        } else {
            const key = elementTypeToBodyKey(el.type);
            if (key && !usedSingleKeys.has(key)) {
                usedSingleKeys.add(key);
                bodyFirstPageItems.push({
                    type: "single",
                    key,
                    show: true,
                    ...(el.type === "companyDetails"
                        ? {
                              companyFields: el.config?.fields as
                                  | CompanyField[]
                                  | undefined,
                          }
                        : {}),
                    ...(DETAILS_TYPES.includes(el.type)
                        ? {
                              detailsFields: el.config?.fields as
                                  | string[]
                                  | undefined,
                          }
                        : {}),
                });
            }
        }
    }

    // Append any single keys not found in the template as hidden items
    const ALL_BODY_KEYS: BodyElementKey[] = [
        "billTo",
        "shipTo",
        "details",
        "logo",
        "companyDetails",
    ];
    for (const key of ALL_BODY_KEYS) {
        if (!usedSingleKeys.has(key)) {
            bodyFirstPageItems.push({ type: "single", key, show: false });
        }
    }

    const lastPageEls = bodyEls.filter(
        (e) => (e.placement ?? "last-page") === "last-page",
    );
    const bodyLastPageOrder = lastPageEls
        .map((e): WizardState["bodyLastPageOrder"][number] | null => {
            if (e.type === "totalsBlock") return "totals";
            if (e.type === "notes" && !e.gridArea) return "notes";
            if (e.type === "termsConditions" && !e.gridArea) return "terms";
            if (e.type === "divider") return "divider";
            return null;
        })
        .filter(
            (k): k is WizardState["bodyLastPageOrder"][number] => k !== null,
        );

    // Body background
    const bodyBackground = tmpl.theme.bodyBackground;
    const bodyBackgroundColor = bodyBackground?.color ?? "";
    const bodyBackgroundImage = bodyBackground?.imageUrl ?? "";
    const bodyBackgroundSize = (bodyBackground?.imageSize ??
        "cover") as WizardState["bodyBackgroundSize"];

    // ── Footer ───────────────────────────────────────────────────────────
    const footerHeight = tmpl.footer.height;
    const footerBgEl = tmpl.footer.elements.find(
        (e) => e.type === "background",
    );
    const footerBackground = footerBgEl?.styles?.backgroundColor ?? "#f9fafb";
    const rawBorderTop = footerBgEl?.styles?.borderTop ?? "";
    // borderTop is "1px solid #color" — extract the color
    const footerBorderColor = rawBorderTop.split(" ").pop() ?? "#e5e7eb";

    const rawFtrBgImg = footerBgEl?.styles?.backgroundImage ?? "";
    const footerBackgroundImage = rawFtrBgImg
        .replace(/^url\(['"]?/, "")
        .replace(/['"]?\)$/, "");
    const footerBackgroundSize = (footerBgEl?.styles?.backgroundSize ??
        "cover") as WizardState["footerBackgroundSize"];

    const footerColumns: ColumnConfig[] = tmpl.footer.grid.columns.map(
        (gridCol) => {
            const width = gridCol.width;
            const el = tmpl.footer.elements.find(
                (e) =>
                    e.gridArea?.col === gridCol.id && e.type !== "background",
            );
            if (!el) return { width, element: "empty" };
            if (el.type === "notes") return { width, element: "notes" };
            if (el.type === "termsConditions")
                return { width, element: "termsConditions" };
            if (el.type === "pageNumber")
                return { width, element: "pageNumber" };
            return { width, element: "empty" };
        },
    );

    return {
        name,
        documentType,
        pageSize,
        primaryColor,
        accentColor,
        fontFamily,
        headerHeight,
        headerBackground,
        headerBackgroundImage,
        headerBackgroundSize,
        headerColumns,
        logoFit,
        logoMaxHeight,
        showDivider,
        bodyFirstPageItems:
            bodyFirstPageItems.length > 0
                ? bodyFirstPageItems
                : defaults.bodyFirstPageItems,
        bodyLastPageOrder:
            bodyLastPageOrder.length > 0
                ? bodyLastPageOrder
                : defaults.bodyLastPageOrder,
        itemColumns,
        itemHeaderBackground,
        itemHeaderColor,
        itemAlternateRowColor,
        totalsShow,
        showNotes,
        showTerms,
        bodyBackgroundColor,
        bodyBackgroundImage,
        bodyBackgroundSize,
        footerHeight,
        footerBackground,
        footerBackgroundImage,
        footerBackgroundSize,
        footerBorderColor,
        footerColumns,
    };
}
