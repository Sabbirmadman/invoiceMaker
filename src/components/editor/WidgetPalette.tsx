/**
 * WidgetPalette
 *
 * Left sidebar with two tabs:
 *   1. Components — All draggable widgets grouped by type (Layout / Business / Custom)
 *   2. Tree       — Figma-style component tree of the current template
 *
 * Drag any item onto a grid cell to add it.
 * Clicking "Watermark" fires onWatermarkClick instead of opening a drag.
 */
import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { WidgetPreview } from "./WidgetPreview";
import { ComponentTree } from "./ComponentTree";
import {
    LayoutGrid, Minus,
    Image, Building2, User, Truck, FileText, Table2, Calculator,
    StickyNote, ScrollText, Hash, Droplets,
    Type,
} from "lucide-react";
import type { ElementType } from "@/types/template";
import type { TemplateV2 } from "@/types/templateV2";
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
    { type: "documentInfo",    label: "Document Info",   icon: <FileText size={15} />,   description: "Invoice / Estimate / Receipt fields" },
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

const CUSTOM_ITEMS: PaletteItem[] = [
    { type: "textLabel", label: "Text",  icon: <Type size={15} />, description: "Static text / label block" },
    // Future: richText, image upload, QR code, barcode
];

// ── Component groups shown in the "Components" tab ───────────────────────────

const COMPONENT_GROUPS: { label: string; items: PaletteItem[] }[] = [
    { label: "Layout",   items: LAYOUT_ITEMS },
    { label: "Business", items: BUSINESS_ITEMS },
    { label: "Custom",   items: CUSTOM_ITEMS },
];

// ── Tab definitions ───────────────────────────────────────────────────────────

type TabId = "components" | "tree";

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
    /** Called when a body grid drag starts — parent can add grid then show the new cell as drop target */
    onAddBodyGrid?: () => void;
    /** Called when the user clicks the Watermark item (instead of drag) */
    onWatermarkClick?: () => void;
    /** Current template — used by the Tree tab */
    template: TemplateV2;
}

export function WidgetPalette({ onAddBodyGrid, onWatermarkClick, template }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>("components");
    const { startDragFromPalette, endDrag } = useDrag();

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
        } else if (item.type === "watermark") {
            onWatermarkClick?.();
        }
    }

    return (
        <div
            style={{
                width: 240,
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

            {/* Tabs */}
            <div style={{ display: "flex", padding: "6px 6px 0", gap: 3 }}>
                {(["components", "tree"] as TabId[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: "4px 2px",
                            fontSize: 10,
                            fontWeight: activeTab === tab ? 700 : 500,
                            color: activeTab === tab ? "#4f46e5" : "#64748b",
                            background: activeTab === tab ? "white" : "transparent",
                            border: activeTab === tab ? "1px solid #c7d2fe" : "1px solid transparent",
                            borderRadius: 5,
                            cursor: "pointer",
                            transition: "all 0.12s",
                            textTransform: "capitalize",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ width: "100%", height: 1, background: "#e2e8f0", margin: "6px 0 4px" }} />

            {/* Tab content */}
            {activeTab === "components" ? (
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                }}>
                    {COMPONENT_GROUPS.map((group, gi) => (
                        <div key={group.label}>
                            {/* Group header */}
                            <div style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "#94a3b8",
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                padding: gi === 0 ? "2px 2px 4px" : "8px 2px 4px",
                                userSelect: "none",
                            }}>
                                {group.label}
                            </div>
                            {/* Items */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {group.items.map((item) => (
                                    <PaletteCard
                                        key={item.type}
                                        item={item}
                                        onDragStart={(e) => handleDragStart(e, item)}
                                        onDragEnd={endDrag}
                                        onClick={() => handleClick(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: "auto" }}>
                    <ComponentTree template={template} />
                </div>
            )}

            {/* Footer hint — components tab only */}
            {activeTab === "components" && (
                <div style={{
                    padding: "6px 10px",
                    fontSize: 10,
                    color: "#9ca3af",
                    borderTop: "1px solid #f1f5f9",
                    lineHeight: 1.4,
                }}>
                    Drag onto a cell or click Grid to add.
                </div>
            )}
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
    const isLayout = item.type === "bodyGrid";
    const isItemList = item.type === "itemList";
    const isWatermark = item.type === "watermark";
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

    // Watermark and bodyGrid use click-only (no drag for watermark — dialog handles placement)
    const isDraggable = item.type !== "bodyGrid" && item.type !== "watermark";

    return (
        <>
            <div
                draggable={isDraggable}
                onDragStart={isDraggable ? onDragStart : undefined}
                onDragEnd={isDraggable ? onDragEnd : undefined}
                onClick={onClick}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: isDraggable ? "grab" : "pointer",
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
                    color: isLayout ? "#4f46e5" : isItemList ? "#0369a1" : isWatermark ? "#7c3aed" : "#64748b",
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
                {item.type === "watermark" && (
                    <span style={{
                        background: "#f5f3ff",
                        color: "#7c3aed",
                        fontSize: 8,
                        padding: "1px 3px",
                        borderRadius: 3,
                        flexShrink: 0,
                    }}>
                        place
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
