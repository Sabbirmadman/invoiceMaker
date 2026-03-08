import { Document, Page, View } from "@react-pdf/renderer";
import type { StoredDocument } from "@/types/document";
import type { TemplateElement } from "@/types/template";
import type { TemplateWidget, SectionGridV2, BodySectionV2 } from "@/types/templateV2";
import { resolvePdfFont } from "./fonts";
import { calculateTotals } from "@/services/calculations";
import { renderHeaderEl } from "./renderHeader";
import { renderBodyEl } from "./renderBody";
import { renderFooterEl } from "./renderFooter";
import { TemplateItemsTable } from "./ItemsTable";

// ---------------------------------------------------------------------------
// V2 helpers
// ---------------------------------------------------------------------------

function widgetToElement(w: TemplateWidget): TemplateElement {
    return { id: w.id, type: w.type, zIndex: 0, placement: w.placement, config: w.config, styles: w.styles, bindings: w.bindings };
}

/** Collect widgets from a section's cells sorted by position */
function sectionWidgets(section: SectionGridV2): TemplateWidget[] {
    const sorted = [...section.cells].sort((a, b) => a.colStart - b.colStart || a.rowStart - b.rowStart);
    const out: TemplateWidget[] = [];
    for (const cell of sorted) {
        for (const node of cell.children) {
            if (node.kind === "widget") out.push(node);
        }
    }
    return out;
}

/** Collect all widgets from body grids */
function bodyWidgets(body: BodySectionV2): TemplateWidget[] {
    const out: TemplateWidget[] = [];
    for (const grid of body.grids) {
        for (const cell of grid.cells) {
            for (const node of cell.children) {
                if (node.kind === "widget") out.push(node);
            }
        }
    }
    return out;
}

/**
 * Returns per-grid row groups: each body grid becomes a row group.
 * Widgets within a grid are laid out side-by-side using their colWidths.
 */
function bodyGridRows(body: BodySectionV2): Array<{ gridId: string; widgets: TemplateWidget[]; colWidths: string[] }> {
    return body.grids.map((grid) => {
        const sortedCells = [...grid.cells].sort((a, b) => a.colStart - b.colStart);
        const widgets: TemplateWidget[] = [];
        const colWidths: string[] = [];
        for (const cell of sortedCells) {
            for (const node of cell.children) {
                if (node.kind === "widget") {
                    widgets.push(node);
                    colWidths.push(grid.grid.colWidths[cell.colStart - 1] ?? `${(100 / grid.grid.columns).toFixed(1)}%`);
                }
            }
        }
        return { gridId: grid.id, widgets, colWidths };
    });
}

// ---------------------------------------------------------------------------
// PDF Document component — V2 template-driven
// ---------------------------------------------------------------------------

export function PdfDocument({ doc }: { doc: StoredDocument }) {
    const { data, templateSnapshot } = doc;
    const { theme, header, body, footer, pageSize } = templateSnapshot;
    const font = resolvePdfFont(theme.fontFamily);
    const totals = calculateTotals(data.items, data.totalsConfig);

    // Find itemList widget in V2 body grids
    const allBodyW = bodyWidgets(body);
    const itemListW = allBodyW.find((w) => w.placement === "all-pages");
    const itemColumns = (itemListW?.config?.columns as string[]) ?? ["name", "qty", "rate", "amount"];
    const tableHeaderBg = itemListW?.styles?.headerBackground ?? theme.primaryColor;
    const tableHeaderColor = itemListW?.styles?.headerColor ?? "#ffffff";
    const altRowColor = itemListW?.styles?.alternateRowColor ?? "#f9fafb";

    // Pre-table grid rows (first-page widgets, grouped by grid)
    const preTableRows = bodyGridRows(body).filter((row) =>
        row.widgets.some((w) => (w.placement ?? "last-page") === "first-page")
    );
    // Post-table widgets (last-page)
    const postTableW = allBodyW.filter((w) => (w.placement ?? "last-page") === "last-page");

    const footerHeight = footer.visible ? (footer.height ?? 60) : 0;
    const headerHeight = header.visible ? (header.height ?? 120) : 0;

    // Header widgets sorted by column
    const headerW = sectionWidgets(header);
    const footerW = sectionWidgets(footer);

    return (
        <Document>
            <Page
                size={pageSize === "Letter" ? "LETTER" : "A4"}
                style={{ fontFamily: font, fontSize: 10, color: "#1a1a1a", paddingBottom: footerHeight + 8 }}
            >
                {/* ── HEADER ─────────────────────────────────────────── */}
                {header.visible && (
                    <View style={{ minHeight: headerHeight, flexDirection: "row" }}>
                        {header.background?.color && (
                            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: header.background.color }} />
                        )}
                        {header.grid.colWidths.map((w, i) => {
                            const widget = headerW.find((hw) => {
                                const cell = header.cells.find((c) => c.children.some((n) => n.kind === "widget" && n.id === hw.id));
                                return cell ? cell.colStart === i + 1 : false;
                            });
                            const el = widget ? widgetToElement(widget) : null;
                            const align = el?.styles?.textAlign;
                            return (
                                <View
                                    key={i}
                                    style={{
                                        width: w,
                                        padding: 12,
                                        alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
                                    }}
                                >
                                    {el ? renderHeaderEl(el, doc, font) : null}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* ── BODY ───────────────────────────────────────────── */}
                <View style={{ padding: 16, flex: 1 }}>
                    {preTableRows.map((row) => {
                        if (row.widgets.length === 1) {
                            const el = widgetToElement(row.widgets[0]);
                            return <View key={row.gridId}>{renderBodyEl(el, doc, totals, font, theme)}</View>;
                        }
                        return (
                            <View key={row.gridId} style={{ flexDirection: "row", flexWrap: "nowrap", marginBottom: 8 }}>
                                {row.widgets.map((w, i) => {
                                    const pct = parseFloat(row.colWidths[i] ?? "50");
                                    return (
                                        <View key={w.id} style={{ flex: pct, minWidth: 0 }}>
                                            {renderBodyEl(widgetToElement(w), doc, totals, font, theme)}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}

                    <TemplateItemsTable
                        items={data.items}
                        columns={itemColumns}
                        currency={data.totalsConfig.currency}
                        headerBg={tableHeaderBg}
                        headerColor={tableHeaderColor}
                        altRowColor={altRowColor}
                        font={font}
                    />

                    {postTableW.map((w) => (
                        <View key={w.id}>{renderBodyEl(widgetToElement(w), doc, totals, font, theme)}</View>
                    ))}
                </View>

                {/* ── FOOTER ─────────────────────────────────────────── */}
                {footer.visible && (
                    <View fixed style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: footerHeight, flexDirection: "row" }}>
                        {footer.background?.color && (
                            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: footer.background.color }} />
                        )}
                        {footer.grid.colWidths.map((w, i) => {
                            const widget = footerW.find((fw) => {
                                const cell = footer.cells.find((c) => c.children.some((n) => n.kind === "widget" && n.id === fw.id));
                                return cell ? cell.colStart === i + 1 : false;
                            });
                            const el = widget ? widgetToElement(widget) : null;
                            const align = el?.styles?.textAlign;
                            return (
                                <View
                                    key={i}
                                    style={{
                                        width: w,
                                        padding: 8,
                                        justifyContent: "center",
                                        alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
                                    }}
                                >
                                    {el ? renderFooterEl(el, doc) : null}
                                </View>
                            );
                        })}
                    </View>
                )}
            </Page>
        </Document>
    );
}
