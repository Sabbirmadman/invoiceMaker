import React, { useState, useRef, useEffect } from "react";
import type { TemplateElement } from "@/types/template";
import type { LineItem } from "@/types/document";
import { formatCurrency, calculateLineAmount } from "@/services/calculations";
import { useFillMode } from "@/components/fill-mode/FillModeContext";
import { usePageSlice } from "@/context/PageSliceContext";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";

export function newLineItem(): LineItem {
    return {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: "",
        description: "",
        qty: 1,
        unit: "",
        rate: 0,
        discount: 0,
        discountType: "flat",
        taxRate: 0,
        amount: 0,
    };
}

interface Props {
    element: TemplateElement;
    items: LineItem[]; // sliced items for this page (display only)
    allItems?: LineItem[]; // full unsliced list — used for mutations
    currency?: string;
    showHeader?: boolean;
    itemOffset?: number; // global index of first item in this slice (for row numbering)
    isLastPage?: boolean; // show Add Row button only on the last items page
}

const DEFAULT_COLUMNS = ["name", "description", "qty", "rate", "tax", "amount"];

export type ColKey =
    | "name"
    | "description"
    | "qty"
    | "unit"
    | "rate"
    | "discount"
    | "tax"
    | "amount";

const COLUMN_LABELS: Record<ColKey, string> = {
    name: "Item",
    description: "Description",
    qty: "Qty",
    unit: "Unit",
    rate: "Rate",
    discount: "Discount",
    tax: "Tax %",
    amount: "Amount",
};

const COLUMN_ALIGN: Record<ColKey, string> = {
    name: "text-left",
    description: "text-left",
    qty: "text-right",
    unit: "text-right",
    rate: "text-right",
    discount: "text-right",
    tax: "text-right",
    amount: "text-right",
};

// Fixed height for every data row cell — keeps edit and preview heights identical.
const CELL_H = "min-h-[28px]";

export function ItemListElement({
    element,
    items,
    allItems,
    currency = "USD",
    showHeader = true,
    itemOffset = 0,
    isLastPage = true,
}: Props) {
    const { fillMode, onUpdateItems } = useFillMode();
    usePageSlice();
    const columns = (element.config?.columns as ColKey[]) ?? DEFAULT_COLUMNS;
    const stackNameDescription =
        (element.config?.stackNameDescription as boolean) ?? false;
    const headerBg = (element.styles?.headerBackground as string) ?? "#111111";
    const headerColor = (element.styles?.headerColor as string) ?? "#ffffff";
    const altRowColor =
        (element.styles?.alternateRowColor as string) ?? "#f0f2f5";
    const rowBorderColor =
        (element.styles?.rowBorderColor as string) ?? "#e5e7eb";
    const showOuterBorder = element.styles?.showOuterBorder === "true";
    const showColumnBorders =
        (element.config?.showColumnBorders as boolean) ?? false;
    const descriptionWrap =
        (element.config?.descriptionWrap as boolean) ?? false;
    const full = allItems ?? items;

    // Text style — from the shared WidgetStylesPanel (color, fontSize, fontWeight)
    const textStyle: React.CSSProperties = {
        ...(element.styles?.color
            ? { color: element.styles.color as string }
            : {}),
        ...(element.styles?.fontSize
            ? { fontSize: element.styles.fontSize as string }
            : {}),
        ...(element.styles?.fontWeight
            ? { fontWeight: element.styles.fontWeight as string }
            : {}),
    };

    // When stacked, description is folded into the name column — remove it from the column list
    const effectiveColumns: ColKey[] = stackNameDescription
        ? columns.filter((c) => c !== "description")
        : columns;

    function updateItem(idx: number, patch: Partial<LineItem>) {
        const globalIdx = itemOffset + idx;
        const updated = full.map((item, i) => {
            if (i !== globalIdx) return item;
            const merged = { ...item, ...patch };
            merged.amount = calculateLineAmount(merged);
            return merged;
        });
        onUpdateItems(updated);
    }

    function addItem() {
        onUpdateItems([...full, newLineItem()]);
    }

    function removeItem(idx: number) {
        onUpdateItems(full.filter((_, i) => i !== itemOffset + idx));
    }

    function moveItem(fromGlobal: number, toGlobal: number) {
        if (toGlobal < 0 || toGlobal >= full.length) return;
        const next = [...full];
        const [moved] = next.splice(fromGlobal, 1);
        next.splice(toGlobal, 0, moved);
        onUpdateItems(next);
    }

    const rowBorderStyle = `1px solid ${rowBorderColor}`;

    const colBorder = showColumnBorders ? rowBorderStyle : undefined;

    return (
        <div
            className="w-full text-sm"
            style={{
                ...textStyle,
                ...(showOuterBorder
                    ? { border: rowBorderStyle, borderRadius: 2 }
                    : {}),
            }}
        >
            {showHeader && (
                <div
                    data-col-header
                    className="flex w-full"
                    style={{
                        backgroundColor: headerBg,
                        color: headerColor,
                        borderBottom: rowBorderStyle,
                    }}
                >
                    {/* Spacer — always same width in both modes to keep columns aligned */}
                    <div className="w-8 shrink-0" />
                    <div
                        className="w-8 px-3 py-2 text-left font-medium shrink-0"
                        style={{ borderRight: colBorder }}
                    >
                        #
                    </div>
                    {effectiveColumns.map((col, ci) => (
                        <div
                            key={col}
                            className={`px-3 py-2 font-medium ${COLUMN_ALIGN[col]}`}
                            style={{
                                flex:
                                    stackNameDescription && col === "name"
                                        ? 2
                                        : 1,
                                borderRight:
                                    ci < effectiveColumns.length - 1
                                        ? colBorder
                                        : undefined,
                            }}
                        >
                            {stackNameDescription && col === "name"
                                ? "Item & Description"
                                : COLUMN_LABELS[col]}
                        </div>
                    ))}
                </div>
            )}

            {items.length === 0 && !fillMode ? (
                <div
                    className="text-muted-foreground text-center py-6 text-sm"
                    style={{ borderBottom: rowBorderStyle }}
                >
                    No items yet
                </div>
            ) : (
                items.map((item, idx) => {
                    const globalIdx = itemOffset + idx;
                    return (
                        <div
                            key={item.id}
                            data-row-index={globalIdx}
                            className="flex w-full items-stretch group"
                            style={{
                                backgroundColor:
                                    idx % 2 === 1 ? altRowColor : "#ffffff",
                                borderBottom: rowBorderStyle,
                            }}
                        >
                            {/* Delete button — fill mode only */}
                            {fillMode ? (
                                <button
                                    onClick={() => removeItem(idx)}
                                    className="w-8 px-1 py-2 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ borderRight: colBorder }}
                                >
                                    <Trash2 className="size-3" />
                                </button>
                            ) : (
                                <div className="w-8 shrink-0" />
                            )}

                            {/* Row number — doubles as ↑↓ move buttons on hover in fill mode */}
                            <div
                                className={`w-8 shrink-0 ${CELL_H} flex items-center relative`}
                                style={{ borderRight: colBorder }}
                            >
                                {fillMode ? (
                                    <>
                                        <span className="px-3 text-muted-foreground group-hover:opacity-0 transition-opacity select-none">
                                            {globalIdx + 1}
                                        </span>
                                        <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() =>
                                                    moveItem(
                                                        globalIdx,
                                                        globalIdx - 1,
                                                    )
                                                }
                                                disabled={globalIdx === 0}
                                                className="flex-1 flex items-center justify-center text-blue-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <ChevronUp className="size-3" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    moveItem(
                                                        globalIdx,
                                                        globalIdx + 1,
                                                    )
                                                }
                                                disabled={
                                                    globalIdx ===
                                                    full.length - 1
                                                }
                                                className="flex-1 flex items-center justify-center text-blue-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <ChevronDown className="size-3" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <span className="px-3 text-muted-foreground">
                                        {globalIdx + 1}
                                    </span>
                                )}
                            </div>

                            {/* Data columns */}
                            {effectiveColumns.map((col, ci) => {
                                const isStackedName =
                                    stackNameDescription && col === "name";
                                const isWrapDesc =
                                    col === "description" && descriptionWrap;
                                const cellPadding = isStackedName
                                    ? "py-2"
                                    : isWrapDesc
                                      ? "py-1"
                                      : CELL_H;
                                const cellAlign =
                                    isStackedName || isWrapDesc
                                        ? "items-start"
                                        : "items-center";
                                return (
                                    <div
                                        key={col}
                                        className={`min-w-0 px-2 ${cellPadding} flex ${cellAlign} ${COLUMN_ALIGN[col]}`}
                                        style={{
                                            flex: isStackedName ? 2 : 1,
                                            borderRight:
                                                ci < effectiveColumns.length - 1
                                                    ? colBorder
                                                    : undefined,
                                        }}
                                    >
                                        {col === "amount"
                                            ? renderCell(
                                                  col,
                                                  item,
                                                  currency,
                                                  descriptionWrap,
                                              )
                                            : fillMode
                                              ? stackNameDescription &&
                                                col === "name"
                                                  ? renderStackedEditCell(
                                                        item,
                                                        idx,
                                                        updateItem,
                                                    )
                                                  : renderEditCell(
                                                        col,
                                                        item,
                                                        idx,
                                                        updateItem,
                                                        currency,
                                                        descriptionWrap,
                                                    )
                                              : stackNameDescription &&
                                                  col === "name"
                                                ? renderStackedCell(
                                                      item,
                                                      descriptionWrap,
                                                  )
                                                : renderCell(
                                                      col,
                                                      item,
                                                      currency,
                                                      descriptionWrap,
                                                  )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })
            )}

            {fillMode && isLastPage && (
                <div data-add-row-btn style={{ paddingTop: 8 }}>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                    >
                        <Plus className="size-3" />
                        Add Row
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Stacked name + description (preview) ─────────────────────────────────────

function renderStackedCell(
    item: LineItem,
    descriptionWrap: boolean,
): React.ReactNode {
    return (
        <div className="py-0.5 w-full">
            <div className="font-medium leading-snug">
                {item.name || (
                    <span className="text-muted-foreground/40">Item name</span>
                )}
            </div>
            {item.description && (
                <div
                    className={`text-xs text-muted-foreground leading-snug mt-0.5 ${descriptionWrap ? "whitespace-normal wrap-break-word" : "truncate"}`}
                >
                    {item.description}
                </div>
            )}
        </div>
    );
}

// ── Stacked name + description (fill mode) ────────────────────────────────────

function renderStackedEditCell(
    item: LineItem,
    idx: number,
    updateItem: (idx: number, patch: Partial<LineItem>) => void,
): React.ReactNode {
    const base =
        "w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 py-0 leading-5";
    return (
        <div className="w-full py-0.5">
            <input
                className={`${base} text-sm`}
                value={item.name}
                onChange={(e) => updateItem(idx, { name: e.target.value })}
                placeholder="Item name"
            />
            <AutoResizeTextarea
                className={`${base} text-xs text-muted-foreground`}
                value={item.description}
                onChange={(v) => updateItem(idx, { description: v })}
                placeholder="Description"
            />
        </div>
    );
}

function renderCell(
    col: ColKey,
    item: LineItem,
    currency: string,
    descriptionWrap = false,
): React.ReactNode {
    switch (col) {
        case "name":
            return item.name;
        case "description":
            return (
                <span
                    className={
                        descriptionWrap
                            ? "whitespace-normal wrap-break-word w-full"
                            : "truncate w-full"
                    }
                >
                    {item.description}
                </span>
            );
        case "qty":
            return String(item.qty);
        case "unit":
            return item.unit;
        case "rate":
            return formatCurrency(item.rate, currency);
        case "discount":
            return item.discountType === "percent"
                ? `${item.discount}%`
                : formatCurrency(item.discount, currency);
        case "tax":
            return `${item.taxRate}%`;
        case "amount":
            return formatCurrency(item.amount, currency);
        default:
            return "";
    }
}

/** Auto-resizing textarea — expands to fit content, looks like a single line when empty. */
function AutoResizeTextarea({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.height = "auto";
        ref.current.style.height = ref.current.scrollHeight + "px";
    }, [value]);
    return (
        <textarea
            ref={ref}
            rows={1}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
                onChange(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
            }}
            className={className}
            style={{ resize: "none", overflow: "hidden", font: "inherit" }}
        />
    );
}

/**
 * NumericEditCell — shows formatted text when idle, raw number input when focused.
 * This keeps fill mode visually identical to preview when the user isn't actively editing.
 */
function NumericEditCell({
    value,
    onChange,
    format,
    min,
    max,
    step,
}: {
    value: number;
    onChange: (v: number) => void;
    format: (v: number) => string;
    min?: number;
    max?: number;
    step?: number;
}) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const baseClass =
        "w-full bg-transparent border border-transparent hover:border-blue-300 rounded px-1 py-0 leading-5 text-sm text-right";

    if (!focused) {
        return (
            <div
                className={`${baseClass} cursor-text`}
                onClick={() => {
                    setFocused(true);
                    setTimeout(() => {
                        inputRef.current?.select();
                    }, 0);
                }}
            >
                {format(value)}
            </div>
        );
    }

    return (
        <input
            ref={inputRef}
            autoFocus
            className={`${baseClass} focus:border-blue-500 focus:outline-none`}
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            onBlur={() => setFocused(false)}
        />
    );
}

function renderEditCell(
    col: ColKey,
    item: LineItem,
    idx: number,
    updateItem: (idx: number, patch: Partial<LineItem>) => void,
    currency: string,
    descriptionWrap = false,
): React.ReactNode {
    // py-0 removes browser UA vertical padding so input height matches the 28px cell height.
    const inputClass =
        "w-full bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded px-1 py-0 leading-5 text-sm";

    switch (col) {
        case "name":
            return (
                <input
                    className={inputClass}
                    value={item.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                    placeholder="Item name"
                />
            );
        case "description":
            return descriptionWrap ? (
                <AutoResizeTextarea
                    className={inputClass}
                    value={item.description}
                    onChange={(v) => updateItem(idx, { description: v })}
                    placeholder="Description"
                />
            ) : (
                <input
                    className={inputClass}
                    value={item.description}
                    onChange={(e) =>
                        updateItem(idx, { description: e.target.value })
                    }
                    placeholder="Description"
                />
            );
        case "qty":
            return (
                <NumericEditCell
                    value={item.qty}
                    onChange={(v) => updateItem(idx, { qty: v })}
                    format={(v) => String(v)}
                    min={0}
                />
            );
        case "unit":
            return (
                <input
                    className={inputClass}
                    value={item.unit}
                    onChange={(e) => updateItem(idx, { unit: e.target.value })}
                    placeholder="pcs"
                />
            );
        case "rate":
            return (
                <NumericEditCell
                    value={item.rate}
                    onChange={(v) => updateItem(idx, { rate: v })}
                    format={(v) => formatCurrency(v, currency)}
                    min={0}
                    step={0.01}
                />
            );
        case "discount":
            return (
                <NumericEditCell
                    value={item.discount}
                    onChange={(v) => updateItem(idx, { discount: v })}
                    format={(v) =>
                        item.discountType === "percent"
                            ? `${v}%`
                            : formatCurrency(v, currency)
                    }
                    min={0}
                    step={0.01}
                />
            );
        case "tax":
            return (
                <NumericEditCell
                    value={item.taxRate}
                    onChange={(v) => updateItem(idx, { taxRate: v })}
                    format={(v) => `${v}%`}
                    min={0}
                    max={100}
                    step={0.1}
                />
            );
        default:
            return null;
    }
}
