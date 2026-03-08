import { Document, Page, View } from "@react-pdf/renderer";
import type { StoredDocument } from "@/types/document";
import type { TemplateElement } from "@/types/template";
import { resolvePdfFont } from "./fonts";
import { calculateTotals } from "@/services/calculations";
import { renderHeaderEl } from "./renderHeader";
import { renderBodyEl } from "./renderBody";
import { renderFooterEl } from "./renderFooter";
import { TemplateItemsTable } from "./ItemsTable";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseBorderTop(val?: string): {
    borderTopWidth?: number;
    borderTopColor?: string;
} {
    if (!val) return {};
    const parts = val.trim().split(/\s+/);
    return {
        borderTopWidth: parseInt(parts[0]) || 1,
        borderTopColor: parts[2] ?? "#e5e7eb",
    };
}

type RenderGroup =
    | { kind: "single"; el: TemplateElement }
    | { kind: "grid"; rowId: string; elements: TemplateElement[] };

/**
 * Groups a flat list of body elements by gridRowId.
 * Elements sharing the same gridRowId are collected into a "grid" group
 * to be rendered side-by-side in a flex row.
 */
function groupByGridRow(elements: TemplateElement[]): RenderGroup[] {
    const seenGridIds = new Set<string>();
    const groups: RenderGroup[] = [];
    for (const el of elements) {
        if (el.gridRowId) {
            if (!seenGridIds.has(el.gridRowId)) {
                seenGridIds.add(el.gridRowId);
                const rowEls = elements.filter(
                    (e) => e.gridRowId === el.gridRowId,
                );
                groups.push({
                    kind: "grid",
                    rowId: el.gridRowId,
                    elements: rowEls,
                });
            }
        } else {
            groups.push({ kind: "single", el });
        }
    }
    return groups;
}

// ---------------------------------------------------------------------------
// PDF Document component — fully template-driven
// ---------------------------------------------------------------------------

export function PdfDocument({ doc }: { doc: StoredDocument }) {
    const { data, templateSnapshot } = doc;
    const { theme, header, body, footer, pageSize } = templateSnapshot;
    const font = resolvePdfFont(theme.fontFamily);
    const totals = calculateTotals(data.items, data.totalsConfig);

    const bodyEls = body.elements;
    const itemListEl = bodyEls.find((e) => e.type === "itemList");
    const itemColumns = (itemListEl?.config?.columns as string[]) ?? [
        "name",
        "qty",
        "rate",
        "amount",
    ];
    const tableHeaderBg =
        itemListEl?.styles?.headerBackground ?? theme.primaryColor;
    const tableHeaderColor = itemListEl?.styles?.headerColor ?? "#ffffff";
    const altRowColor = itemListEl?.styles?.alternateRowColor ?? "#f9fafb";

    // First-page elements (before item table): may include grid-row groups
    const preTableEls = bodyEls.filter(
        (e) =>
            e.type !== "itemList" &&
            (e.placement ?? "last-page") === "first-page",
    );
    // Last-page elements (after item table)
    const postTableEls = bodyEls.filter(
        (e) =>
            e.type !== "itemList" &&
            (e.placement ?? "last-page") === "last-page",
    );

    const preTableGroups = groupByGridRow(preTableEls);
    const footerHeight = footer.visible ? footer.height : 0;

    return (
        <Document>
            <Page
                size={pageSize === "Letter" ? "LETTER" : "A4"}
                style={{
                    fontFamily: font,
                    fontSize: 10,
                    color: "#1a1a1a",
                    paddingBottom: footerHeight + 8,
                }}
            >
                {/* ── HEADER ─────────────────────────────────────────── */}
                {header.visible && (
                    <View
                        style={{
                            minHeight: header.height,
                            flexDirection: "row",
                            position: "relative",
                        }}
                    >
                        {header.elements
                            .filter((e) => e.type === "background")
                            .map((bg) => (
                                <View
                                    key={bg.id}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor:
                                            bg.styles?.backgroundColor ??
                                            "#ffffff",
                                    }}
                                />
                            ))}
                        {header.grid.columns.map((col) => {
                            const el = header.elements.find(
                                (e) =>
                                    e.gridArea?.col === col.id &&
                                    e.type !== "background",
                            );
                            const align = el?.styles?.textAlign;
                            return (
                                <View
                                    key={col.id}
                                    style={{
                                        width: col.width,
                                        padding: 12,
                                        alignItems:
                                            align === "right"
                                                ? "flex-end"
                                                : align === "center"
                                                  ? "center"
                                                  : "flex-start",
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
                    {/* Pre-table: first-page elements, grid rows rendered side-by-side */}
                    {preTableGroups.map((group) => {
                        if (group.kind === "grid") {
                            return (
                                <View
                                    key={group.rowId}
                                    style={{
                                        flexDirection: "row",
                                        flexWrap: "nowrap",
                                        marginBottom: 8,
                                    }}
                                >
                                    {group.elements.map((el) => {
                                        // Use proportional flex so columns share space
                                        // correctly without relying on percentage widths
                                        const pct = parseFloat(
                                            el.styles?.gridColWidth ?? "50",
                                        );
                                        return (
                                            <View
                                                key={el.id}
                                                style={{
                                                    flex: pct,
                                                    minWidth: 0,
                                                }}
                                            >
                                                {renderBodyEl(
                                                    el,
                                                    doc,
                                                    totals,
                                                    font,
                                                    theme,
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        }
                        return (
                            <View key={group.el.id}>
                                {renderBodyEl(
                                    group.el,
                                    doc,
                                    totals,
                                    font,
                                    theme,
                                )}
                            </View>
                        );
                    })}

                    {/* Item table */}
                    <TemplateItemsTable
                        items={data.items}
                        columns={itemColumns}
                        currency={data.totalsConfig.currency}
                        headerBg={tableHeaderBg}
                        headerColor={tableHeaderColor}
                        altRowColor={altRowColor}
                        font={font}
                    />

                    {/* Post-table: last-page elements */}
                    {postTableEls.map((el) => (
                        <View key={el.id}>
                            {renderBodyEl(el, doc, totals, font, theme)}
                        </View>
                    ))}
                </View>

                {/* ── FOOTER ─────────────────────────────────────────── */}
                {footer.visible && (
                    <View
                        fixed
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: footer.height,
                            flexDirection: "row",
                        }}
                    >
                        {footer.elements
                            .filter((e) => e.type === "background")
                            .map((bg) => {
                                const border = parseBorderTop(
                                    bg.styles?.borderTop,
                                );
                                return (
                                    <View
                                        key={bg.id}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor:
                                                bg.styles?.backgroundColor ??
                                                "#f9fafb",
                                            ...border,
                                        }}
                                    />
                                );
                            })}
                        {footer.grid.columns.map((col) => {
                            const el = footer.elements.find(
                                (e) =>
                                    e.gridArea?.col === col.id &&
                                    e.type !== "background",
                            );
                            const align = el?.styles?.textAlign;
                            return (
                                <View
                                    key={col.id}
                                    style={{
                                        width: col.width,
                                        padding: 8,
                                        justifyContent: "center",
                                        alignItems:
                                            align === "right"
                                                ? "flex-end"
                                                : align === "center"
                                                  ? "center"
                                                  : "flex-start",
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
