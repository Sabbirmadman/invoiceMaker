/**
 * WidgetPreview
 *
 * Renders a scaled-down live preview of a widget using dummy data.
 * Used inside the palette tooltip so users can see what each widget looks like.
 */
import React from "react";
import type { DragType } from "./WidgetPalette";
import type { TemplateElement } from "@/types/template";
import type { TotalsResult } from "@/types/document";

import { LogoElement } from "@/components/elements/LogoElement";
import { CompanyDetailsElement } from "@/components/elements/CompanyDetailsElement";
import { BillToElement } from "@/components/elements/BillToElement";
import { ShipToElement } from "@/components/elements/ShipToElement";
import { DocumentInfoElement } from "@/components/elements/DocumentInfoElement";
import { ItemListElement } from "@/components/elements/ItemListElement";
import { TotalsBlockElement } from "@/components/elements/TotalsBlockElement";
import { NotesElement } from "@/components/elements/NotesElement";
import { TermsElement } from "@/components/elements/TermsElement";
import { PageNumberElement } from "@/components/elements/PageNumberElement";
import { DividerElement } from "@/components/elements/DividerElement";
import { TextLabelElement } from "@/components/elements/TextLabelElement";
import { WatermarkElement } from "@/components/elements/WatermarkElement";

// ── Dummy data ─────────────────────────────────────────────────────────────────

const DUMMY_EL: TemplateElement = {
    id: "preview",
    type: "textLabel",
    zIndex: 0,
    placement: "all-pages",
    config: {},
    styles: {},
    bindings: {},
};

const DUMMY_COMPANY = {
    name: "Your Company",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
    phone: "+1 (555) 000-0000",
    email: "hello@company.com",
    website: "www.company.com",
    taxId: "XX-XXXXXXX",
    logoUrl: undefined,
};

const DUMMY_CLIENT = {
    name: "Client Name",
    company: "Client Company",
    address: "456 Client Ave",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "USA",
    phone: "+1 (555) 111-1111",
    email: "client@example.com",
    taxId: "",
    shippingAddress: "789 Shipping Blvd\nLos Angeles, CA 90001",
};

const DUMMY_INVOICE_META = {
    type: "invoice" as const,
    number: "INV-001",
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    terms: "Net 30",
    poNumber: "",
    projectName: "",
    reference: "",
    placeOfSupply: "",
};

const DUMMY_ITEMS = [
    { id: "1", name: "Web Design", description: "Homepage design", qty: 1, unit: "", rate: 1200, discount: 0, discountType: "percent" as const, tax: 0 },
    { id: "2", name: "Development", description: "Frontend build", qty: 3, unit: "hrs", rate: 150, discount: 0, discountType: "percent" as const, tax: 8 },
];

const DUMMY_TOTALS: TotalsResult = {
    subTotal: 1650,
    itemDiscountTotal: 0,
    overallDiscount: 0,
    tax1: 36,
    tax2: 0,
    shipping: 0,
    adjustment: 0,
    total: 1686,
    amountPaid: 0,
    balanceDue: 1686,
};

const DUMMY_TOTALS_CONFIG = {
    overallDiscount: 0,
    overallDiscountType: "flat" as const,
    tax1: { label: "Tax", rate: 8, enabled: true },
    tax2: { label: "Tax 2", rate: 0, enabled: false },
    shipping: { label: "Shipping", amount: 0, enabled: false },
    adjustment: { label: "Adjustment", amount: 0, enabled: false },
    currency: "USD",
};

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
    type: DragType;
    label: string;
    description: string;
}

export function WidgetPreview({ type, label, description }: Props) {
    let content: React.ReactNode = null;

    switch (type) {
        case "logo":
            content = <LogoElement element={DUMMY_EL} company={DUMMY_COMPANY} />;
            break;
        case "companyDetails":
            content = (
                <CompanyDetailsElement
                    element={{ ...DUMMY_EL, config: { fields: ["name", "address", "phone", "email"], contentCols: 1 } }}
                    company={DUMMY_COMPANY}
                />
            );
            break;
        case "billTo":
            content = <BillToElement element={DUMMY_EL} client={DUMMY_CLIENT} />;
            break;
        case "shipTo":
            content = <ShipToElement element={DUMMY_EL} client={DUMMY_CLIENT} />;
            break;
        case "invoiceDetails":
        case "estimateDetails":
        case "receiptDetails":
        case "documentInfo":
            content = (
                <DocumentInfoElement
                    element={{ ...DUMMY_EL, config: { fields: ["number", "date", "dueDate"] } }}
                    meta={DUMMY_INVOICE_META}
                    docType="invoice"
                />
            );
            break;
        case "itemList":
            content = (
                <ItemListElement
                    element={DUMMY_EL}
                    items={DUMMY_ITEMS}
                    currency="USD"
                    showHeader
                    itemOffset={0}
                    isLastPage
                />
            );
            break;
        case "totalsBlock":
            content = (
                <TotalsBlockElement
                    element={DUMMY_EL}
                    totals={DUMMY_TOTALS}
                    config={DUMMY_TOTALS_CONFIG}
                />
            );
            break;
        case "notes":
            content = <NotesElement element={DUMMY_EL} notes="Payment is due within 30 days. Thank you for your business." />;
            break;
        case "termsConditions":
            content = <TermsElement element={DUMMY_EL} terms="All sales are final. Goods remain property of seller until paid in full." />;
            break;
        case "pageNumber":
            content = <PageNumberElement element={DUMMY_EL} current={1} total={3} />;
            break;
        case "divider":
            content = <DividerElement element={DUMMY_EL} />;
            break;
        case "textLabel":
            content = (
                <TextLabelElement
                    element={{ ...DUMMY_EL, config: { text: "Your text here", fontSize: 14 } }}
                />
            );
            break;
        case "watermark":
            content = (
                <WatermarkElement
                    element={{ ...DUMMY_EL, config: { text: "DRAFT" } }}
                />
            );
            break;
        default:
            content = null;
    }

    return (
        <div style={{ width: 260 }}>
            {/* Header: label + description */}
            <div style={{ padding: "8px 12px 6px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{label}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{description}</div>
            </div>

            {content && (
                <>
                    <div style={{ height: 1, background: "#e2e8f0" }} />
                    {/* Scaled widget render */}
                    <div style={{ overflow: "hidden", height: 160, position: "relative", background: "#f8fafc" }}>
                        <div
                            style={{
                                width: 400,
                                transformOrigin: "top left",
                                transform: "scale(0.6)",
                                padding: "10px 14px",
                                pointerEvents: "none",
                            }}
                        >
                            {content}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
