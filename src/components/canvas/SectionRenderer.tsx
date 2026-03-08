import { useRef } from "react";
import type { Section, BodySection, TemplateElement } from "@/types/template";
import type { StoredDocument, TotalsResult, LineItem } from "@/types/document";
import { GridLayout, GridCell } from "./GridLayout";
import { ElementBoundingBox } from "./ElementBoundingBox";
import { useFillMode } from "@/components/fill-mode/FillModeContext";
import { LogoElement } from "@/components/elements/LogoElement";
import { CompanyDetailsElement } from "@/components/elements/CompanyDetailsElement";
import { BillToElement } from "@/components/elements/BillToElement";
import { ShipToElement } from "@/components/elements/ShipToElement";
import { InvoiceDetailsElement } from "@/components/elements/InvoiceDetailsElement";
import { EstimateDetailsElement } from "@/components/elements/EstimateDetailsElement";
import { ReceiptDetailsElement } from "@/components/elements/ReceiptDetailsElement";
import { ItemListElement } from "@/components/elements/ItemListElement";
import { TotalsBlockElement } from "@/components/elements/TotalsBlockElement";
import { NotesElement } from "@/components/elements/NotesElement";
import { TermsElement } from "@/components/elements/TermsElement";
import { PageNumberElement } from "@/components/elements/PageNumberElement";
import { WatermarkElement } from "@/components/elements/WatermarkElement";
import { DividerElement } from "@/components/elements/DividerElement";
import { TextLabelElement } from "@/components/elements/TextLabelElement";

// Colors per section type
const SECTION_COLORS = {
    header: "#3b82f6", // blue
    body: "#22c55e", // green
    footer: "#f97316", // orange
} as const;

type SectionType = keyof typeof SECTION_COLORS;

// Wrapper that attaches a ref and renders the bounding box overlay
function BoundedCell({
    children,
    sectionType,
    showBounds,
    className,
    style,
}: {
    children: React.ReactNode;
    sectionType: SectionType;
    showBounds: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div ref={ref} className={className} style={style}>
            {children}
            {showBounds && (
                <ElementBoundingBox
                    elementRef={ref}
                    color={SECTION_COLORS[sectionType]}
                />
            )}
        </div>
    );
}

interface SectionRendererProps {
    section: Section;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
    sectionType?: SectionType;
    /** Editor-only: called with new percentage widths when user drags a column divider */
    onColsResize?: (widths: string[]) => void;
    resizeScale?: number;
}

export function SectionRenderer({
    section,
    doc,
    totals,
    currentPage,
    totalPages,
    sectionType = "header",
    onColsResize,
    resizeScale = 1,
}: SectionRendererProps) {
    const { showBounds } = useFillMode();
    const sorted = [...section.elements].sort((a, b) => a.zIndex - b.zIndex);
    const containerRef = useRef<HTMLDivElement>(null);
    const colDragRef = useRef<{
        startX: number;
        leftPct: number;
        totalPct: number;
        colIdx: number;
    } | null>(null);

    // Cumulative column boundary positions (percentage) for drag handles
    const colBoundaries: Array<{ pct: number; colIdx: number }> = [];
    if (onColsResize && section.grid.columns.length > 1) {
        let cum = 0;
        for (let i = 0; i < section.grid.columns.length - 1; i++) {
            const w = parseFloat(section.grid.columns[i].width);
            if (isNaN(w)) break;
            cum += w;
            colBoundaries.push({ pct: cum, colIdx: i });
        }
    }

    function startColDrag(e: React.MouseEvent, colIdx: number) {
        e.preventDefault();
        e.stopPropagation();
        const container = containerRef.current;
        if (!container || !onColsResize) return;
        const containerW = container.offsetWidth;
        const leftPct = parseFloat(section.grid.columns[colIdx].width);
        const rightPct = parseFloat(section.grid.columns[colIdx + 1].width);
        if (isNaN(leftPct) || isNaN(rightPct)) return;
        colDragRef.current = {
            startX: e.clientX,
            leftPct,
            totalPct: leftPct + rightPct,
            colIdx,
        };

        function onMove(ev: MouseEvent) {
            if (!colDragRef.current) return;
            const {
                startX,
                leftPct: origLeft,
                totalPct,
                colIdx: ci,
            } = colDragRef.current;
            const deltaCanvas = (ev.clientX - startX) / resizeScale;
            const deltaPct = (deltaCanvas / containerW) * 100;
            const newLeft = Math.max(
                10,
                Math.min(totalPct - 10, origLeft + deltaPct),
            );
            const newRight = totalPct - newLeft;
            const newWidths = section.grid.columns.map((col, i) => {
                if (i === ci) return `${newLeft.toFixed(1)}%`;
                if (i === ci + 1) return `${newRight.toFixed(1)}%`;
                return col.width;
            });
            onColsResize!(newWidths);
        }

        function onUp() {
            colDragRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{ height: section.height, width: "100%" }}
        >
            <GridLayout grid={section.grid}>
                {sorted.map((el) => {
                    if (el.type === "background") {
                        return (
                            <div
                                key={el.id}
                                className="absolute inset-0"
                                style={
                                    {
                                        ...el.styles,
                                        zIndex: el.zIndex,
                                    } as React.CSSProperties
                                }
                            />
                        );
                    }

                    if (el.type === "watermark") {
                        return <WatermarkElement key={el.id} element={el} />;
                    }

                    if (!el.gridArea) return null;

                    return (
                        <GridCell
                            key={el.id}
                            gridArea={el.gridArea}
                            grid={section.grid}
                        >
                            <BoundedCell
                                sectionType={sectionType}
                                showBounds={showBounds}
                                className={`p-3 ${el.type === "logo" ? "" : "h-full"}`}
                                style={
                                    {
                                        zIndex: el.zIndex,
                                        position: "relative",
                                        ...(el.styles?.textAlign
                                            ? {
                                                  textAlign: el.styles
                                                      .textAlign as React.CSSProperties["textAlign"],
                                              }
                                            : {}),
                                    } as React.CSSProperties
                                }
                            >
                                {renderElement(
                                    el,
                                    doc,
                                    totals,
                                    currentPage,
                                    totalPages,
                                )}
                            </BoundedCell>
                        </GridCell>
                    );
                })}
            </GridLayout>

            {/* Column resize handles — hover-only vertical lines between columns */}
            {colBoundaries.map((boundary) => (
                <div
                    key={boundary.colIdx}
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${boundary.pct}%`,
                        width: 10,
                        marginLeft: -5,
                        zIndex: 60,
                        cursor: "col-resize",
                    }}
                    className="group/colhandle flex items-center justify-center select-none"
                    onMouseDown={(e) => startColDrag(e, boundary.colIdx)}
                    title="Drag to resize column"
                >
                    <div className="absolute inset-y-0 w-0.5 bg-blue-400 opacity-25 group-hover/colhandle:opacity-75 transition-opacity" />
                </div>
            ))}
        </div>
    );
}

interface BodySectionRendererProps {
    section: BodySection;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
    showTotals?: boolean;
    showColumnHeader?: boolean;
    isFirstPage?: boolean;
    itemOffset?: number;
    isLastPage?: boolean;
    allItems?: LineItem[];
    postTableStartIndex?: number; // first post-table element to render on this page
    postTableEndIndex?: number; // exclusive end; undefined = render all
    /** Editor-only: called when user drags a column divider inside a body grid row */
    onGridRowColsResize?: (rowId: string, widths: string[]) => void;
    resizeScale?: number;
}

// Placement helpers — use the element's explicit placement field.
// Fallback to 'last-page' for elements without placement (safe default).
function isPreTable(el: TemplateElement): boolean {
    const p = el.placement ?? "last-page";
    return p === "first-page" || p === "all-pages";
}

export function BodySectionRenderer({
    section,
    doc,
    totals,
    currentPage,
    totalPages,
    showTotals = true,
    showColumnHeader = true,
    isFirstPage = true,
    itemOffset = 0,
    isLastPage = true,
    allItems,
    postTableStartIndex = 0,
    postTableEndIndex,
    onGridRowColsResize,
    resizeScale = 1,
}: BodySectionRendererProps) {
    const { showBounds, fillMode } = useFillMode();
    const sorted = [...section.elements].sort((a, b) => a.zIndex - b.zIndex);

    // Build the ordered list of post-table elements (last-page placement)
    // In fill mode always show all elements so users can enter data.
    // In preview/PDF mode skip empty notes/terms so they don't create extra pages.
    const postTableElements = sorted.filter((el) => {
        if (el.type === "watermark" || isPreTable(el)) return false;
        if (!fillMode && el.type === "notes" && !doc.data.notes) return false;
        if (!fillMode && el.type === "termsConditions" && !doc.data.terms) return false;
        return true;
    });
    // Slice to only the elements assigned to this page
    const visiblePostElements =
        postTableEndIndex !== undefined
            ? postTableElements.slice(postTableStartIndex, postTableEndIndex)
            : postTableElements.slice(postTableStartIndex);

    // Build ordered render groups for pre-table elements, grouping by gridRowId
    type RenderGroup =
        | { kind: "single"; el: TemplateElement }
        | { kind: "grid"; rowId: string; elements: TemplateElement[] };

    const seenGridIds = new Set<string>();
    const preTableGroups: RenderGroup[] = [];

    for (const el of sorted) {
        if (el.type === "watermark") continue;
        if (!isPreTable(el)) continue;
        if ((el.placement ?? "last-page") === "first-page" && !isFirstPage)
            continue;
        if (
            el.placement === "all-pages" &&
            doc.data.items.length === 0 &&
            !isFirstPage
        )
            continue;

        if (el.gridRowId) {
            if (!seenGridIds.has(el.gridRowId)) {
                seenGridIds.add(el.gridRowId);
                // Collect all elements in this grid row in sorted order
                const rowEls = sorted.filter(
                    (e) => e.gridRowId === el.gridRowId,
                );
                preTableGroups.push({
                    kind: "grid",
                    rowId: el.gridRowId,
                    elements: rowEls,
                });
            }
        } else {
            preTableGroups.push({ kind: "single", el });
        }
    }

    return (
        <div className="relative flex flex-col p-4 overflow-hidden">
            {/* Watermarks — absolute-positioned, render on every page */}
            {sorted
                .filter((el) => el.type === "watermark")
                .map((el) => (
                    <WatermarkElement key={el.id} element={el} />
                ))}

            {/* Pre-table group: first-page and all-pages elements */}
            <div className="flex flex-col gap-4">
                {preTableGroups.map((group) => {
                    if (group.kind === "grid") {
                        return (
                            <BodyGridRow
                                key={group.rowId}
                                rowId={group.rowId}
                                elements={group.elements}
                                doc={doc}
                                totals={totals}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                showColumnHeader={showColumnHeader}
                                itemOffset={itemOffset}
                                isLastPage={isLastPage}
                                allItems={allItems}
                                showBounds={showBounds}
                                onColsResize={onGridRowColsResize}
                                resizeScale={resizeScale}
                            />
                        );
                    }
                    const el = group.el;
                    return (
                        <BoundedCell
                            key={el.id}
                            sectionType="body"
                            showBounds={showBounds}
                            style={{ zIndex: el.zIndex, position: "relative" }}
                        >
                            {renderElement(
                                el,
                                doc,
                                totals,
                                currentPage,
                                totalPages,
                                showColumnHeader,
                                itemOffset,
                                isLastPage,
                                allItems,
                            )}
                        </BoundedCell>
                    );
                })}
            </div>

            {/* Post-table group: only the elements assigned to this page slice */}
            {showTotals && visiblePostElements.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                    {visiblePostElements.map((el) => (
                        <BoundedCell
                            key={el.id}
                            sectionType="body"
                            showBounds={showBounds}
                            style={{ zIndex: el.zIndex, position: "relative" }}
                        >
                            {renderElement(
                                el,
                                doc,
                                totals,
                                currentPage,
                                totalPages,
                                showColumnHeader,
                                itemOffset,
                                isLastPage,
                                allItems,
                            )}
                        </BoundedCell>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Body grid row with drag-to-resize column handles ─────────────────

function BodyGridRow({
    rowId,
    elements,
    doc,
    totals,
    currentPage,
    totalPages,
    showColumnHeader,
    itemOffset,
    isLastPage,
    allItems,
    showBounds,
    onColsResize,
    resizeScale = 1,
}: {
    rowId: string;
    elements: TemplateElement[];
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
    showColumnHeader: boolean;
    itemOffset: number;
    isLastPage: boolean;
    allItems?: LineItem[];
    showBounds: boolean;
    onColsResize?: (rowId: string, widths: string[]) => void;
    resizeScale?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const colDragRef = useRef<{
        startX: number;
        leftPct: number;
        totalPct: number;
        leftElIdx: number;
    } | null>(null);

    const colWidthsPct = elements.map((el) =>
        parseFloat(el.styles?.gridColWidth ?? "0"),
    );

    // Cumulative boundary positions for drag handles
    const colBoundaries: Array<{ pct: number; elIdx: number }> = [];
    if (onColsResize && elements.length > 1) {
        let cum = 0;
        for (let i = 0; i < elements.length - 1; i++) {
            const w = colWidthsPct[i];
            if (isNaN(w)) break;
            cum += w;
            colBoundaries.push({ pct: cum, elIdx: i });
        }
    }

    function startColDrag(e: React.MouseEvent, elIdx: number) {
        e.preventDefault();
        e.stopPropagation();
        const container = containerRef.current;
        if (!container || !onColsResize) return;
        const containerW = container.offsetWidth;
        const leftPct = colWidthsPct[elIdx];
        const rightPct = colWidthsPct[elIdx + 1];
        if (isNaN(leftPct) || isNaN(rightPct)) return;
        colDragRef.current = {
            startX: e.clientX,
            leftPct,
            totalPct: leftPct + rightPct,
            leftElIdx: elIdx,
        };

        function onMove(ev: MouseEvent) {
            if (!colDragRef.current) return;
            const {
                startX,
                leftPct: origLeft,
                totalPct,
                leftElIdx,
            } = colDragRef.current;
            const deltaCanvas = (ev.clientX - startX) / resizeScale;
            const deltaPct = (deltaCanvas / containerW) * 100;
            const newLeft = Math.max(
                10,
                Math.min(totalPct - 10, origLeft + deltaPct),
            );
            const newRight = totalPct - newLeft;
            const newWidths = elements.map((el, i) => {
                if (i === leftElIdx) return `${newLeft.toFixed(1)}%`;
                if (i === leftElIdx + 1) return `${newRight.toFixed(1)}%`;
                return el.styles?.gridColWidth ?? "50%";
            });
            onColsResize!(rowId, newWidths);
        }

        function onUp() {
            colDragRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }

    return (
        <div ref={containerRef} className="relative flex flex-row">
            {elements.map((el) => (
                <BoundedCell
                    key={el.id}
                    sectionType="body"
                    showBounds={showBounds}
                    style={{
                        flex: el.styles?.gridColWidth
                            ? `0 0 ${el.styles.gridColWidth}`
                            : "1",
                        minWidth: 0,
                        zIndex: el.zIndex,
                        position: "relative",
                    }}
                >
                    {renderElement(
                        el,
                        doc,
                        totals,
                        currentPage,
                        totalPages,
                        showColumnHeader,
                        itemOffset,
                        isLastPage,
                        allItems,
                    )}
                </BoundedCell>
            ))}

            {/* Column resize handles */}
            {colBoundaries.map((boundary) => (
                <div
                    key={boundary.elIdx}
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${boundary.pct}%`,
                        width: 10,
                        marginLeft: -5,
                        zIndex: 60,
                        cursor: "col-resize",
                    }}
                    className="group/colhandle flex items-center justify-center select-none"
                    onMouseDown={(e) => startColDrag(e, boundary.elIdx)}
                    title="Drag to resize column"
                >
                    <div className="absolute inset-y-0 w-0.5 bg-green-400 opacity-25 group-hover/colhandle:opacity-75 transition-opacity" />
                </div>
            ))}
        </div>
    );
}

function renderElement(
    el: TemplateElement,
    doc: StoredDocument,
    totals: TotalsResult,
    currentPage: number,
    totalPages: number,
    showColumnHeader = true,
    itemOffset = 0,
    isLastPage = true,
    allItems?: LineItem[],
): React.ReactNode {
    const { data } = doc;
    const meta = data.meta;

    switch (el.type) {
        case "logo":
            return <LogoElement element={el} company={data.company} />;

        case "companyDetails":
            return (
                <CompanyDetailsElement element={el} company={data.company} />
            );

        case "billTo":
            return <BillToElement element={el} client={data.client} />;

        case "shipTo":
            return <ShipToElement element={el} client={data.client} />;

        case "invoiceDetails":
            if (meta.type !== "invoice") return null;
            return <InvoiceDetailsElement element={el} meta={meta} />;

        case "estimateDetails":
            if (meta.type !== "estimate") return null;
            return <EstimateDetailsElement element={el} meta={meta} />;

        case "receiptDetails":
            if (meta.type !== "receipt") return null;
            return <ReceiptDetailsElement element={el} meta={meta} />;

        case "itemList":
            return (
                <ItemListElement
                    element={el}
                    items={data.items}
                    allItems={allItems}
                    currency={data.totalsConfig.currency}
                    showHeader={showColumnHeader}
                    itemOffset={itemOffset}
                    isLastPage={isLastPage}
                />
            );

        case "totalsBlock":
            return (
                <TotalsBlockElement
                    element={el}
                    totals={totals}
                    config={data.totalsConfig}
                />
            );

        case "notes":
            return <NotesElement element={el} notes={data.notes} />;

        case "termsConditions":
            return <TermsElement element={el} terms={data.terms} />;

        case "pageNumber":
            return (
                <PageNumberElement
                    element={el}
                    current={currentPage}
                    total={totalPages}
                />
            );

        case "divider":
            return <DividerElement element={el} />;

        case "textLabel":
            return <TextLabelElement element={el} />;

        default:
            return null;
    }
}
