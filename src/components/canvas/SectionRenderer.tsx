/**
 * SectionRenderer — V2 native renderer for header/footer SectionGridV2.
 * BodySectionRenderer — V2 native renderer for BodySectionV2.
 *
 * Replaces the old V1 renderer that used GridLayout/GridCell and flat elements arrays.
 * Now reads SectionGridV2 cells directly, using CSS grid from GridConfig.
 */
import type { SectionGridV2, BodySectionV2, TemplateWidget, TemplateGridCell } from "@/types/templateV2";
import type { StoredDocument, TotalsResult, LineItem } from "@/types/document";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

// Element components
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
import { DividerElement } from "@/components/elements/DividerElement";
import { TextLabelElement } from "@/components/elements/TextLabelElement";
import { WatermarkElement } from "@/components/elements/WatermarkElement";

// Adapt TemplateWidget to TemplateElement shape that existing components expect
import type { TemplateElement } from "@/types/template";

function widgetToElement(w: TemplateWidget): TemplateElement {
    return { id: w.id, type: w.type, zIndex: 0, placement: w.placement, config: w.config, styles: w.styles, bindings: w.bindings };
}

// ── Widget content renderer ────────────────────────────────────────────────────

export function renderWidget(
    widget: TemplateWidget,
    doc: StoredDocument,
    totals: TotalsResult,
    currentPage: number,
    totalPages: number,
    opts: { showColumnHeader?: boolean; itemOffset?: number; isLastPage?: boolean; allItems?: LineItem[] } = {},
): React.ReactNode {
    const { data } = doc;
    const meta = data.meta;
    const el = widgetToElement(widget);
    const { showColumnHeader = true, itemOffset = 0, isLastPage = true, allItems } = opts;

    switch (widget.type) {
        case "logo":
            return <LogoElement element={el} company={data.company} />;
        case "companyDetails":
            return <CompanyDetailsElement element={el} company={data.company} />;
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
            return <TotalsBlockElement element={el} totals={totals} config={data.totalsConfig} />;
        case "notes":
            return <NotesElement element={el} notes={data.notes} />;
        case "termsConditions":
            return <TermsElement element={el} terms={data.terms} />;
        case "pageNumber":
            return <PageNumberElement element={el} current={currentPage} total={totalPages} />;
        case "divider":
            return <DividerElement element={el} />;
        case "textLabel":
            return <TextLabelElement element={el} />;
        case "watermark":
            return <WatermarkElement element={el} />;
        default:
            return null;
    }
}

// ── Fixed section renderer (header / footer) ─────────────────────────────────

interface SectionRendererProps {
    section: SectionGridV2;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
}

export function SectionRenderer({ section, doc, totals, currentPage, totalPages }: SectionRendererProps) {
    const { grid, cells, background } = section;

    // Build CSS grid template from GridConfig
    const colTemplate = grid.colWidths.length > 0
        ? grid.colWidths.join(" ")
        : `repeat(${grid.columns}, 1fr)`;
    const rowTemplate = grid.rowHeights.length > 0
        ? grid.rowHeights.join(" ")
        : `repeat(${grid.rows}, auto)`;

    const sectionStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: colTemplate,
        gridTemplateRows: rowTemplate,
        columnGap: grid.colGap,
        rowGap: grid.rowGap,
        padding: grid.padding,
        height: "100%",
        width: "100%",
        position: "relative",
        boxSizing: "border-box",
    };

    if (background?.color) sectionStyle.backgroundColor = background.color;
    if (background?.imageUrl) {
        sectionStyle.backgroundImage = `url('${background.imageUrl}')`;
        sectionStyle.backgroundSize = background.imageSize === "repeat" ? "auto" : (background.imageSize ?? "cover");
        sectionStyle.backgroundPosition = "center";
        sectionStyle.backgroundRepeat = background.imageSize === "repeat" ? "repeat" : "no-repeat";
    }

    return (
        <div style={sectionStyle}>
            {cells.map((cell) => (
                <GridCellRenderer
                    key={cell.id}
                    cell={cell}
                    doc={doc}
                    totals={totals}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            ))}
        </div>
    );
}

function GridCellRenderer({ cell, doc, totals, currentPage, totalPages }: {
    cell: TemplateGridCell;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
}) {
    const cellStyle: React.CSSProperties = {
        gridColumn: `${cell.colStart} / span ${cell.colSpan}`,
        gridRow: `${cell.rowStart} / span ${cell.rowSpan}`,
        overflow: "hidden",
        minWidth: 0,
    };

    if (cell.flex) {
        cellStyle.display = "flex";
        cellStyle.flexDirection = cell.flex.direction ?? "column";
        if (cell.flex.alignItems) cellStyle.alignItems = cell.flex.alignItems;
        if (cell.flex.justifyContent) cellStyle.justifyContent = cell.flex.justifyContent;
        if (cell.flex.gap) cellStyle.gap = cell.flex.gap;
    }

    return (
        <div style={cellStyle}>
            {cell.children.map((node) => {
                if (node.kind !== "widget") return null;
                return (
                    <div key={node.id} style={{ height: "100%" }}>
                        {renderWidget(node, doc, totals, currentPage, totalPages)}
                    </div>
                );
            })}
        </div>
    );
}

// ── Body section renderer (V2) ────────────────────────────────────────────────

interface BodySectionRendererProps {
    body: BodySectionV2;
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
    postTableStartIndex?: number;
    postTableEndIndex?: number;
}

/**
 * Collects all widgets from a V2 body in order, classified by placement.
 * "first-page" → shown only on page 1
 * "all-pages"  → itemList, shown on every page
 * "last-page"  → totals/notes/terms, shown at end
 */
function collectBodyWidgets(body: BodySectionV2): TemplateWidget[] {
    const widgets: TemplateWidget[] = [];
    for (const grid of body.grids) {
        for (const cell of grid.cells) {
            for (const node of cell.children) {
                if (node.kind === "widget") widgets.push(node);
            }
        }
    }
    return widgets;
}

/**
 * For each body grid in V2, collect its widgets as a "row group" for rendering side-by-side.
 * Returns an array of grid row groups: [{gridId, widgets[]}]
 */
function collectBodyGridRows(body: BodySectionV2): Array<{ gridId: string; widgets: TemplateWidget[]; colWidths: string[] }> {
    return body.grids.map((grid) => {
        const widgets: TemplateWidget[] = [];
        const colWidths: string[] = [];

        // Sort cells by colStart to preserve column order
        const sortedCells = [...grid.cells].sort((a, b) => a.colStart - b.colStart);
        for (const cell of sortedCells) {
            for (const node of cell.children) {
                if (node.kind === "widget") {
                    widgets.push(node);
                    // Width = colSpan / total columns as fraction
                    const pct = (cell.colSpan / grid.grid.columns) * 100;
                    colWidths.push(
                        grid.grid.colWidths[cell.colStart - 1] ?? `${pct.toFixed(1)}%`
                    );
                }
            }
        }
        return { gridId: grid.id, widgets, colWidths };
    });
}

export function BodySectionRenderer({
    body,
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
}: BodySectionRendererProps) {
    const { fillMode } = useFillMode();

    // Collect all widgets flat to identify by placement
    const allWidgets = collectBodyWidgets(body);

    // Post-table widgets (last-page placement), filtered for empty notes/terms in preview
    const postTableWidgets = allWidgets.filter((w) => {
        if ((w.placement ?? "last-page") !== "last-page") return false;
        if (!fillMode && w.type === "notes" && !doc.data.notes) return false;
        if (!fillMode && w.type === "termsConditions" && !doc.data.terms) return false;
        return true;
    });
    const visiblePostWidgets = postTableEndIndex !== undefined
        ? postTableWidgets.slice(postTableStartIndex, postTableEndIndex)
        : postTableWidgets.slice(postTableStartIndex);

    // Grid rows for pre-table content (first-page + all-pages grids)
    const allGridRows = collectBodyGridRows(body);

    // Pre-table grid rows: grids whose widgets are first-page or all-pages placement
    const preTableGridRows = allGridRows.filter((row) =>
        row.widgets.some((w) => {
            const p = w.placement ?? "last-page";
            return p === "first-page" || p === "all-pages";
        })
    );

    return (
        <div className="relative flex flex-col p-4 overflow-hidden">
            {/* Watermarks */}
            {allWidgets
                .filter((w) => w.type === "watermark")
                .map((w) => {
                    const el = widgetToElement(w);
                    return <WatermarkElement key={w.id} element={el} />;
                })}

            {/* Pre-table: first-page and all-pages grids */}
            <div className="flex flex-col gap-4">
                {preTableGridRows.map((row) => {
                    // Filter widgets for this page
                    const visibleWidgets = row.widgets.filter((w) => {
                        const p = w.placement ?? "last-page";
                        if (p === "first-page" && !isFirstPage) return false;
                        if (p === "all-pages" && doc.data.items.length === 0 && !isFirstPage) return false;
                        return p === "first-page" || p === "all-pages";
                    });
                    if (visibleWidgets.length === 0) return null;

                    if (visibleWidgets.length === 1) {
                        const w = visibleWidgets[0];
                        return (
                            <div key={row.gridId}>
                                {renderWidget(w, doc, totals, currentPage, totalPages, {
                                    showColumnHeader, itemOffset, isLastPage, allItems,
                                })}
                            </div>
                        );
                    }

                    // Multiple widgets side-by-side
                    return (
                        <div key={row.gridId} className="flex flex-row">
                            {visibleWidgets.map((w, i) => (
                                <div
                                    key={w.id}
                                    style={{ flex: `0 0 ${row.colWidths[i] ?? "auto"}`, minWidth: 0 }}
                                >
                                    {renderWidget(w, doc, totals, currentPage, totalPages, {
                                        showColumnHeader, itemOffset, isLastPage, allItems,
                                    })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Post-table: last-page widgets (totals, notes, terms…) */}
            {showTotals && visiblePostWidgets.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                    {visiblePostWidgets.map((w) => (
                        <div key={w.id}>
                            {renderWidget(w, doc, totals, currentPage, totalPages, {
                                showColumnHeader, itemOffset, isLastPage, allItems,
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
