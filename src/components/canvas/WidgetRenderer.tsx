/**
 * WidgetRenderer
 *
 * Thin wrapper that renders a TemplateWidget using the existing element components.
 * In editor mode: shows selection outline and drag handle.
 * In preview mode: transparent wrapper, identical output to current rendering.
 */
import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { TemplateWidget } from "@/types/templateV2";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { useEditorSelection } from "@/components/editor/EditorSelectionContext";
import { useDrag } from "@/components/editor/DragContext";

// Existing element components
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

// Adapt TemplateWidget to the TemplateElement shape the existing components expect
import type { TemplateElement } from "@/types/template";

// ── Widget metadata ───────────────────────────────────────────────────────────

const WIDGET_META: Record<string, { label: string; description: string }> = {
    logo:            { label: "Logo",            description: "Company logo image" },
    companyDetails:  { label: "Company",         description: "Company name, address, contact info" },
    billTo:          { label: "Bill To",         description: "Client billing address" },
    shipTo:          { label: "Ship To",         description: "Shipping address" },
    invoiceDetails:  { label: "Document Info",   description: "Invoice/Estimate/Receipt details" },
    estimateDetails: { label: "Document Info",   description: "Invoice/Estimate/Receipt details" },
    receiptDetails:  { label: "Document Info",   description: "Invoice/Estimate/Receipt details" },
    documentInfo:    { label: "Document Info",   description: "Invoice / Estimate / Receipt details" },
    itemList:        { label: "Item Table",      description: "Line items — repeats on every page" },
    totalsBlock:     { label: "Totals",          description: "Subtotal, taxes, total, balance due" },
    notes:           { label: "Notes",           description: "Custom freeform notes text" },
    termsConditions: { label: "Terms",           description: "Terms & conditions block" },
    pageNumber:      { label: "Page Number",     description: "Current page / total pages" },
    divider:         { label: "Divider",         description: "Horizontal separator line" },
    textLabel:       { label: "Text Label",      description: "Static text / label block" },
    watermark:       { label: "Watermark",       description: "Background watermark text" },
};

function widgetToElement(w: TemplateWidget): TemplateElement {
    return {
        id: w.id,
        type: w.type,
        zIndex: 0,
        placement: w.placement,
        config: w.config,
        styles: w.styles,
        bindings: w.bindings,
    };
}

interface Props {
    widget: TemplateWidget;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage?: number;
    totalPages?: number;
    /** Editor mode: show selection outline + drag handle */
    editMode?: boolean;
    /** Called when the user clicks to select this widget */
    onSelect?: (id: string) => void;
}

export function WidgetRenderer({
    widget,
    doc,
    totals,
    currentPage = 1,
    totalPages = 1,
    editMode = false,
    onSelect,
}: Props) {
    const { isSelected, selectNode } = useEditorSelection();
    const { startDragExisting } = useDrag();
    const selected = editMode && isSelected(widget.id);
    const el = widgetToElement(widget);
    const { data } = doc;
    const meta = data.meta;

    // ── Hover tooltip state ───────────────────────────────────────────────────
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
    const hideTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
        if (!editMode) return;
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltip({ x: rect.left, y: rect.top });
    }, [editMode]);

    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
        if (!editMode) return;
        // Only hide if the mouse left the widget entirely (not just moved to a child)
        const related = e.relatedTarget as Node | null;
        if (related && (e.currentTarget as HTMLElement).contains(related)) return;
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setTooltip(null), 120);
    }, [editMode]);

    function handleClick(e: React.MouseEvent) {
        if (!editMode) return;
        e.stopPropagation();
        selectNode(widget.id, "widget");
        onSelect?.(widget.id);
    }

    function handleDragStart(e: React.DragEvent) {
        if (!editMode) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({ nodeId: widget.id }));
        startDragExisting(widget.id);
    }

    let content: React.ReactNode = null;
    switch (widget.type) {
        case "logo":
            content = <LogoElement element={el} company={data.company} />;
            break;
        case "companyDetails":
            content = <CompanyDetailsElement element={el} company={data.company} />;
            break;
        case "billTo":
            content = <BillToElement element={el} client={data.client} />;
            break;
        case "shipTo":
            content = <ShipToElement element={el} client={data.client} />;
            break;
        case "invoiceDetails":
        case "estimateDetails":
        case "receiptDetails":
        case "documentInfo": {
            const docType =
                widget.type === "invoiceDetails" ? "invoice" :
                widget.type === "estimateDetails" ? "estimate" :
                widget.type === "receiptDetails" ? "receipt" :
                (el.config?.docType as import("@/types/common").DocumentType | undefined) ?? doc.documentType;
            content = <DocumentInfoElement element={el} meta={data.meta} docType={docType} />;
            break;
        }
        case "itemList":
            content = (
                <ItemListElement
                    element={el}
                    items={data.items}
                    currency={data.totalsConfig.currency}
                    showHeader
                    itemOffset={0}
                    isLastPage
                />
            );
            break;
        case "totalsBlock":
            content = <TotalsBlockElement element={el} totals={totals} config={data.totalsConfig} />;
            break;
        case "notes":
            content = <NotesElement element={el} notes={data.notes} />;
            break;
        case "termsConditions":
            content = <TermsElement element={el} terms={data.terms} />;
            break;
        case "pageNumber":
            content = <PageNumberElement element={el} current={currentPage} total={totalPages} />;
            break;
        case "divider":
            content = <DividerElement element={el} />;
            break;
        case "textLabel":
            content = <TextLabelElement element={el} />;
            break;
        case "watermark":
            content = <WatermarkElement element={el} />;
            break;
        default:
            content = null;
    }

    if (!editMode) {
        return <>{content}</>;
    }

    // In editor mode, show a placeholder for widgets that rendered nothing (e.g. empty notes/terms)
    const displayContent = content ?? (
        <div style={{
            padding: "6px 10px",
            color: "#9ca3af",
            fontSize: 11,
            fontStyle: "italic",
            background: "#f9fafb",
            borderRadius: 3,
            minHeight: 28,
            display: "flex",
            alignItems: "center",
        }}>
            {widget.type} (empty)
        </div>
    );

    const meta_ = WIDGET_META[widget.type];

    return (
        <>
            <div
                draggable
                onClick={handleClick}
                onDragStart={handleDragStart}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: "relative",
                    outline: selected
                        ? "2px solid #2563eb"
                        : tooltip
                        ? "1px dashed #94a3b8"
                        : "1px dashed transparent",
                    outlineOffset: 1,
                    cursor: "grab",
                    borderRadius: 2,
                    transition: "outline-color 0.1s",
                }}
                className="group/widget"
                data-widget-id={widget.id}
            >
                {/* Drag handle dot — top-left, visible on hover/select */}
                <div
                    style={{
                        position: "absolute",
                        top: -1,
                        left: -1,
                        zIndex: 50,
                        background: selected ? "#2563eb" : "#94a3b8",
                        borderRadius: "2px 0 2px 0",
                        width: 12,
                        height: 12,
                        opacity: selected ? 1 : 0,
                        transition: "opacity 0.1s",
                        cursor: "grab",
                        pointerEvents: "none",
                    }}
                    className="group-hover/widget:opacity-100"
                />
                {displayContent}
            </div>

            {/* Tooltip — rendered via portal so it escapes overflow:hidden parents */}
            {tooltip && meta_ && !selected && createPortal(
                <div
                    style={{
                        position: "fixed",
                        left: tooltip.x,
                        top: tooltip.y - 6,
                        transform: "translateY(-100%)",
                        zIndex: 9999,
                        pointerEvents: "none",
                    }}
                >
                    <div style={{
                        background: "#1e293b",
                        color: "#f1f5f9",
                        borderRadius: 6,
                        padding: "5px 10px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
                        maxWidth: 220,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                            {meta_.label}
                        </span>
                        <span style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4 }}>
                            {meta_.description}
                        </span>
                    </div>
                    {/* Arrow */}
                    <div style={{
                        position: "absolute",
                        bottom: -5,
                        left: 14,
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: "5px solid #1e293b",
                    }} />
                </div>,
                document.body
            )}
        </>
    );
}
