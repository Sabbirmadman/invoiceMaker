/**
 * ComponentTree
 *
 * Figma-style component tree showing the full hierarchy of the current template.
 * Clicking any node selects it via EditorSelectionContext.
 *
 * Structure:
 *   Page
 *   ├─ Header
 *   │   └─ Cell [1:1]
 *   │       └─ Logo
 *   ├─ Body
 *   │   └─ Section 1
 *   │       ├─ Cell [1:1]
 *   │       │   └─ Bill To
 *   │       └─ Cell [2:1]
 *   │           └─ Invoice Info
 *   └─ Footer
 *       └─ Cell [1:1]
 *           └─ Page Number
 */
import React, { useState } from "react";
import {
    ChevronRight, ChevronDown,
    LayoutGrid, Image, Building2, User, Truck, FileText,
    Table2, Calculator, StickyNote, ScrollText, Hash, Droplets,
    Type, Minus, Layers,
} from "lucide-react";
import type { TemplateV2, SectionGridV2, TemplateGridCell, TemplateWidget } from "@/types/templateV2";
import { useEditorSelection } from "@/components/editor/EditorSelectionContext";

// ── Widget icon map ───────────────────────────────────────────────────────────

const WIDGET_ICONS: Record<string, React.ReactNode> = {
    logo:            <Image size={11} />,
    companyDetails:  <Building2 size={11} />,
    billTo:          <User size={11} />,
    shipTo:          <Truck size={11} />,
    invoiceDetails:  <FileText size={11} />,
    estimateDetails: <FileText size={11} />,
    receiptDetails:  <FileText size={11} />,
    itemList:        <Table2 size={11} />,
    totalsBlock:     <Calculator size={11} />,
    notes:           <StickyNote size={11} />,
    termsConditions: <ScrollText size={11} />,
    pageNumber:      <Hash size={11} />,
    divider:         <Minus size={11} />,
    textLabel:       <Type size={11} />,
    watermark:       <Droplets size={11} />,
};

const WIDGET_LABELS: Record<string, string> = {
    logo:            "Logo",
    companyDetails:  "Company",
    billTo:          "Bill To",
    shipTo:          "Ship To",
    invoiceDetails:  "Invoice Info",
    estimateDetails: "Estimate Info",
    receiptDetails:  "Receipt Info",
    itemList:        "Item Table",
    totalsBlock:     "Totals",
    notes:           "Notes",
    termsConditions: "Terms",
    pageNumber:      "Page Number",
    divider:         "Divider",
    textLabel:       "Text Label",
    watermark:       "Watermark",
};

// ── Tree node styles ──────────────────────────────────────────────────────────

const INDENT = 10; // px per level

interface TreeNodeProps {
    label: string;
    icon?: React.ReactNode;
    depth: number;
    nodeId: string;
    nodeType: "section" | "cell" | "widget";
    isLast?: boolean;
    hasChildren?: boolean;
    muted?: boolean;
    children?: React.ReactNode;
    defaultOpen?: boolean;
}

function TreeNode({
    label,
    icon,
    depth,
    nodeId,
    nodeType,
    hasChildren = false,
    muted = false,
    children,
    defaultOpen = true,
}: TreeNodeProps) {
    const [open, setOpen] = useState(defaultOpen);
    const { selectNode, isSelected } = useEditorSelection();
    const selected = isSelected(nodeId);

    function handleClick(e: React.MouseEvent) {
        e.stopPropagation();
        selectNode(nodeId, nodeType);
        if (hasChildren) setOpen((v) => !v);
    }

    return (
        <div>
            <div
                onClick={handleClick}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    paddingLeft: 6 + depth * INDENT,
                    paddingRight: 6,
                    paddingTop: 3,
                    paddingBottom: 3,
                    cursor: "pointer",
                    background: selected ? "#eef2ff" : "transparent",
                    borderRadius: 4,
                    transition: "background 0.1s",
                    userSelect: "none",
                }}
                onMouseEnter={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                    if (!selected) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
            >
                {/* Expand/collapse chevron */}
                <span style={{
                    width: 12,
                    height: 12,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                }}>
                    {hasChildren
                        ? (open ? <ChevronDown size={10} /> : <ChevronRight size={10} />)
                        : null
                    }
                </span>

                {/* Icon */}
                <span style={{
                    color: selected ? "#4f46e5" : muted ? "#cbd5e1" : "#64748b",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                }}>
                    {icon}
                </span>

                {/* Label */}
                <span style={{
                    fontSize: 11,
                    color: selected ? "#3730a3" : muted ? "#94a3b8" : "#374151",
                    fontStyle: muted ? "italic" : "normal",
                    fontWeight: selected ? 600 : nodeType === "section" ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                }}>
                    {label}
                </span>
            </div>

            {/* Children */}
            {hasChildren && open && (
                <div>{children}</div>
            )}
        </div>
    );
}

// ── Widget node ────────────────────────────────────────────────────────────────

function WidgetNode({ widget, depth }: { widget: TemplateWidget; depth: number }) {
    return (
        <TreeNode
            label={WIDGET_LABELS[widget.type] ?? widget.type}
            icon={WIDGET_ICONS[widget.type] ?? <Layers size={11} />}
            depth={depth}
            nodeId={widget.id}
            nodeType="widget"
            hasChildren={false}
        />
    );
}

// ── Cell node ─────────────────────────────────────────────────────────────────

function CellNode({ cell, depth }: { cell: TemplateGridCell; depth: number }) {
    const label = `Cell [${cell.colStart}:${cell.rowStart}]${cell.colSpan > 1 || cell.rowSpan > 1 ? ` (${cell.colSpan}×${cell.rowSpan})` : ""}`;
    const hasChildren = cell.children.length > 0;

    return (
        <TreeNode
            label={label}
            icon={<LayoutGrid size={11} />}
            depth={depth}
            nodeId={cell.id}
            nodeType="cell"
            hasChildren={hasChildren}
            muted={!hasChildren}
        >
            {cell.children.map((child) => (
                child.kind === "widget"
                    ? <WidgetNode key={child.id} widget={child} depth={depth + 1} />
                    : null
            ))}
        </TreeNode>
    );
}

// ── Section node ──────────────────────────────────────────────────────────────

function SectionNode({
    section,
    label,
    depth,
    icon,
}: {
    section: SectionGridV2;
    label: string;
    depth: number;
    icon: React.ReactNode;
}) {
    const hasCells = section.cells.length > 0;

    return (
        <TreeNode
            label={label}
            icon={icon}
            depth={depth}
            nodeId={section.id}
            nodeType="section"
            hasChildren
            defaultOpen
        >
            {hasCells
                ? section.cells.map((cell) => (
                    <CellNode key={cell.id} cell={cell} depth={depth + 1} />
                ))
                : (
                    <div style={{
                        paddingLeft: 6 + (depth + 1) * INDENT + 15,
                        paddingTop: 2,
                        paddingBottom: 2,
                        fontSize: 10,
                        color: "#cbd5e1",
                        fontStyle: "italic",
                    }}>
                        empty
                    </div>
                )
            }
        </TreeNode>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
    template: TemplateV2;
}

export function ComponentTree({ template }: Props) {
    return (
        <div style={{ padding: "4px 4px 8px" }}>
            {/* Page root — not selectable, just a label */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 6px 4px",
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                userSelect: "none",
            }}>
                <Layers size={10} />
                <span>Page</span>
            </div>

            {/* Header */}
            <SectionNode
                section={template.header}
                label="Header"
                depth={0}
                icon={<LayoutGrid size={11} />}
            />

            {/* Body */}
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    paddingLeft: 6,
                    paddingTop: 4,
                    paddingBottom: 2,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    userSelect: "none",
                }}>
                    <span style={{ width: 12 }} />
                    <LayoutGrid size={10} />
                    <span style={{ marginLeft: 3 }}>Body</span>
                </div>
                {template.body.grids.map((grid, i) => (
                    <SectionNode
                        key={grid.id}
                        section={grid}
                        label={template.body.grids.length === 1 ? "Section" : `Section ${i + 1}`}
                        depth={1}
                        icon={<LayoutGrid size={11} />}
                    />
                ))}
            </div>

            {/* Footer */}
            <SectionNode
                section={template.footer}
                label="Footer"
                depth={0}
                icon={<LayoutGrid size={11} />}
            />
        </div>
    );
}
