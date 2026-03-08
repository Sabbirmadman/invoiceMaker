/**
 * WidgetPalette
 *
 * Left sidebar with three segments:
 *   1. Layout   — Grid, Container, Divider
 *   2. Business — pre-built document components (Logo, Bill To, Item Table, etc.)
 *   3. Elements — generic custom elements (Text, Image)
 *
 * Drag any item onto a grid cell or container to add it.
 */
import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { WidgetPreview } from "./WidgetPreview";
import {
    LayoutGrid, Minus,
    Image, Building2, User, Truck, FileText, Table2, Calculator,
    StickyNote, ScrollText, Hash, Droplets,
    Type,
} from "lucide-react";
import type { ElementType } from "@/types/template";
import { useDrag } from "./DragContext";

// ── Item definitions ──────────────────────────────────────────────────────────

export type DragType = ElementType | "bodyGrid";

interface PaletteItem {
    type: DragType;
    label: string;
    icon: React.ReactNode;
    description: string;
    badge?: string;
    badgeColor?: string;
}

const LAYOUT_ITEMS: PaletteItem[] = [
    {
        type: "bodyGrid",
        label: "Grid",
        icon: <LayoutGrid size={15} />,
        description: "Add a configurable CSS grid section to the body",
    },
    {
        type: "divider",
        label: "Divider",
        icon: <Minus size={15} />,
        description: "Horizontal separator line",
    },
];

const BUSINESS_ITEMS: PaletteItem[] = [
    { type: "logo",            label: "Logo",            icon: <Image size={15} />,      description: "Company logo image" },
    { type: "companyDetails",  label: "Company",         icon: <Building2 size={15} />,  description: "Company name, address, contact" },
    { type: "billTo",          label: "Bill To",         icon: <User size={15} />,       description: "Client billing address" },
    { type: "shipTo",          label: "Ship To",         icon: <Truck size={15} />,      description: "Shipping address" },
    { type: "invoiceDetails",  label: "Invoice Info",    icon: <FileText size={15} />,   description: "Invoice #, date, due date" },
    { type: "estimateDetails", label: "Estimate Info",   icon: <FileText size={15} />,   description: "Estimate #, date, expiry" },
    { type: "receiptDetails",  label: "Receipt Info",    icon: <FileText size={15} />,   description: "Receipt #, payment info" },
    {
        type: "itemList",
        label: "Item Table",
        icon: <Table2 size={15} />,
        description: "Line items — repeats on every page",
        badge: "all pages",
        badgeColor: "#1d4ed8",
    },
    { type: "totalsBlock",     label: "Totals",          icon: <Calculator size={15} />, description: "Subtotal, taxes, total, balance" },
    { type: "notes",           label: "Notes",           icon: <StickyNote size={15} />, description: "Custom freeform notes" },
    { type: "termsConditions", label: "Terms",           icon: <ScrollText size={15} />, description: "Terms & conditions block" },
    { type: "pageNumber",      label: "Page Number",     icon: <Hash size={15} />,       description: "Current / total pages (footer)" },
    { type: "watermark",       label: "Watermark",       icon: <Droplets size={15} />,   description: "Background watermark text" },
];

const ELEMENT_ITEMS: PaletteItem[] = [
    { type: "textLabel", label: "Text",  icon: <Type size={15} />,      description: "Static text / label block" },
    // Future: richText, image upload, QR code, barcode
];

// ── Segment definitions ───────────────────────────────────────────────────────

type SegmentId = "layout" | "business" | "elements";

const SEGMENTS: { id: SegmentId; label: string; items: PaletteItem[] }[] = [
    { id: "layout",   label: "Layout",   items: LAYOUT_ITEMS },
    { id: "business", label: "Business", items: BUSINESS_ITEMS },
    { id: "elements", label: "Custom",   items: ELEMENT_ITEMS },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
    /** Called when a body grid drag starts — parent can add grid then show the new cell as drop target */
    onAddBodyGrid?: () => void;
}

export function WidgetPalette({ onAddBodyGrid }: Props) {
    const [activeSegment, setActiveSegment] = useState<SegmentId>("layout");
    const { startDragFromPalette, endDrag } = useDrag();

    const segment = SEGMENTS.find((s) => s.id === activeSegment)!;

    function handleDragStart(e: React.DragEvent, item: PaletteItem) {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", JSON.stringify({ widgetType: item.type }));
        if (item.type !== "bodyGrid") {
            startDragFromPalette(item.type as ElementType);
        }
    }

    function handleClick(item: PaletteItem) {
        if (item.type === "bodyGrid") {
            onAddBodyGrid?.();
        }
    }

    return (
        <div
            style={{
                width: 168,
                flexShrink: 0,
                borderRight: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={{
                padding: "8px 10px 0",
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
            }}>
                Elements
            </div>

            {/* Segment tabs */}
            <div style={{
                display: "flex",
                padding: "6px 6px 0",
                gap: 3,
            }}>
                {SEGMENTS.map((seg) => (
                    <button
                        key={seg.id}
                        onClick={() => setActiveSegment(seg.id)}
                        style={{
                            flex: 1,
                            padding: "4px 2px",
                            fontSize: 10,
                            fontWeight: activeSegment === seg.id ? 700 : 500,
                            color: activeSegment === seg.id ? "#4f46e5" : "#64748b",
                            background: activeSegment === seg.id ? "white" : "transparent",
                            border: activeSegment === seg.id ? "1px solid #c7d2fe" : "1px solid transparent",
                            borderRadius: 5,
                            cursor: "pointer",
                            transition: "all 0.12s",
                        }}
                    >
                        {seg.label}
                    </button>
                ))}
            </div>

            <div style={{ width: "100%", height: 1, background: "#e2e8f0", margin: "6px 0 4px" }} />

            {/* Item list */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 6px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}>
                {segment.items.length === 0 ? (
                    <div style={{ fontSize: 11, color: "#9ca3af", padding: "8px 4px", textAlign: "center" }}>
                        More elements coming soon
                    </div>
                ) : (
                    segment.items.map((item) => (
                        <PaletteCard
                            key={item.type}
                            item={item}
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={endDrag}
                            onClick={() => handleClick(item)}
                        />
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div style={{
                padding: "6px 10px",
                fontSize: 10,
                color: "#9ca3af",
                borderTop: "1px solid #f1f5f9",
                lineHeight: 1.4,
            }}>
                Drag onto a cell or click Grid / Container to add.
            </div>
        </div>
    );
}

// ── Palette card ──────────────────────────────────────────────────────────────

function PaletteCard({
    item,
    onDragStart,
    onDragEnd,
    onClick,
}: {
    item: PaletteItem;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onClick: () => void;
}) {
    const isLayout = item.type === "container" || item.type === "bodyGrid";
    const isItemList = item.type === "itemList";
    const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
    const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showTooltip = useCallback((e: React.MouseEvent) => {
        if (hideRef.current) clearTimeout(hideRef.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltip({ x: rect.right + 8, y: rect.top });
    }, []);

    const hideTooltip = useCallback(() => {
        hideRef.current = setTimeout(() => setTooltip(null), 100);
    }, []);

    return (
        <>
            <div
                draggable={item.type !== "bodyGrid"}
                onDragStart={item.type !== "bodyGrid" ? onDragStart : undefined}
                onDragEnd={item.type !== "bodyGrid" ? onDragEnd : undefined}
                onClick={onClick}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: item.type === "bodyGrid" ? "pointer" : "grab",
                    background: "white",
                    border: `1px solid ${isLayout ? "#c7d2fe" : "#e2e8f0"}`,
                    fontSize: 11,
                    color: isLayout ? "#4f46e5" : "#374151",
                    userSelect: "none",
                    transition: "box-shadow 0.1s, border-color 0.1s",
                    boxShadow: tooltip ? "0 1px 4px rgba(0,0,0,0.1)" : undefined,
                }}
            >
                <span style={{
                    color: isLayout ? "#4f46e5" : isItemList ? "#0369a1" : "#64748b",
                    flexShrink: 0,
                }}>
                    {item.icon}
                </span>
                <span style={{ fontSize: 11, lineHeight: 1.3, flex: 1 }}>{item.label}</span>
                {item.badge && (
                    <span style={{
                        background: "#dbeafe",
                        color: item.badgeColor ?? "#1d4ed8",
                        fontSize: 8,
                        padding: "1px 3px",
                        borderRadius: 3,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}>
                        {item.badge}
                    </span>
                )}
                {item.type === "bodyGrid" && (
                    <span style={{
                        background: "#f0fdf4",
                        color: "#16a34a",
                        fontSize: 8,
                        padding: "1px 3px",
                        borderRadius: 3,
                        flexShrink: 0,
                    }}>
                        + add
                    </span>
                )}
            </div>

            {/* Tooltip — pops to the right of the card, via portal to escape overflow */}
            {tooltip && createPortal(
                <div
                    style={{
                        position: "fixed",
                        left: tooltip.x,
                        top: tooltip.y,
                        zIndex: 9999,
                        pointerEvents: "none",
                    }}
                >
                    <div style={{
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                    }}>
                        <WidgetPreview type={item.type} label={item.label} description={item.description} />
                    </div>
                    {/* Left arrow */}
                    <div style={{
                        position: "absolute",
                        top: 14,
                        left: -6,
                        width: 0,
                        height: 0,
                        borderTop: "6px solid transparent",
                        borderBottom: "6px solid transparent",
                        borderRight: "6px solid #e2e8f0",
                    }} />
                    <div style={{
                        position: "absolute",
                        top: 15,
                        left: -5,
                        width: 0,
                        height: 0,
                        borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent",
                        borderRight: "5px solid #fff",
                    }} />
                </div>,
                document.body
            )}
        </>
    );
}
