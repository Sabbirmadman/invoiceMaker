import type { DocumentType, PageSize, Orientation } from "./common";

export type ElementType =
    | "background"
    | "watermark"
    | "logo"
    | "companyDetails"
    | "billTo"
    | "shipTo"
    | "invoiceDetails"
    | "estimateDetails"
    | "receiptDetails"
    | "documentInfo"
    | "itemList"
    | "totalsBlock"
    | "notes"
    | "termsConditions"
    | "pageNumber"
    | "divider"
    | "textLabel"
    | "signature";

export interface GridColumn {
    id: string;
    width: string; // e.g. "30%", "1fr", "200px"
}

export interface GridRow {
    id: string;
    height: string; // e.g. "auto", "100px"
}

export interface Grid {
    columns: GridColumn[];
    rows: GridRow[];
}

export interface GridArea {
    col: string; // column id
    row: string; // row id
    colSpan?: number;
    rowSpan?: number;
}

export interface Theme {
    fontFamily: string;
    primaryColor: string;
    accentColor: string;
    secondaryColor?: string;
    bodyBackground?: {
        color?: string;
        imageUrl?: string;
        imageSize?: "cover" | "contain" | "repeat";
    };
}

/**
 * Controls where a body element is placed across pages:
 * - 'first-page'  : rendered only on page 1 (billTo, shipTo, invoiceDetails, etc.)
 * - 'all-pages'   : repeated on every page (itemList)
 * - 'last-page'   : rendered only on the final page (totalsBlock, notes, terms, etc.)
 * Defaults to 'last-page' if omitted (safe fallback — treated as post-table).
 */
export type BodyPlacement = "first-page" | "all-pages" | "last-page";

export interface TemplateElement {
    id: string;
    type: ElementType;
    zIndex: number;
    placement?: BodyPlacement; // only meaningful for body elements
    gridArea?: GridArea;
    gridRowId?: string; // groups elements into a horizontal body grid row
    bindings?: Record<string, string>; // { fieldName: '{{token}}' }
    config?: Record<string, unknown>;
    styles?: Record<string, string>; // gridColWidth stored here for body grid columns
}

export interface Section {
    height: number;
    visible: boolean;
    grid: Grid;
    elements: TemplateElement[];
}

export interface BodySection {
    // Body has no fixed height — it drives pagination
    elements: TemplateElement[];
}

export interface Template {
    id: string;
    name: string;
    documentType: DocumentType;
    pageSize: PageSize;
    orientation: Orientation;
    theme: Theme;
    header: Section;
    body: BodySection;
    footer: Section;
}

// ── V1/V2 union ──────────────────────────────────────────────────────────────
export type { TemplateV2 } from "./templateV2";

/** Any template — V1 (no version field) or V2 (version: 2) */
export type AnyTemplate = Template | import("./templateV2").TemplateV2;

/** Type guard: is this a V1 template? */
export function isTemplateV1(t: AnyTemplate): t is Template {
    return !("version" in t);
}
