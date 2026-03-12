/**
 * PropertiesPanel — main component
 *
 * Two-tab right panel:
 *  - PAGE tab  → paper size, page padding, accent borders
 *  - SECTION tab (default) → context-sensitive:
 *      • Nothing / section selected → grid config + divider color
 *      • Cell selected → flex layout controls
 *      • Widget selected:
 *          logo      → image size / border controls
 *          textLabel → rich text formatting + content editor
 *          others    → placement + delete
 */
import { useState } from "react";
import type { SelectionNodeType } from "../EditorSelectionContext";
import type {
    TemplateV2,
    SectionGridV2,
    TemplateWidget,
    GridConfig,
    CellFlex,
    WatermarkConfig,
    SectionBorder,
    TemplateGridCell,
} from "@/types/templateV2";
import { collectWidgets, collectBodyWidgets } from "@/types/templateV2";
import type { SectionTarget } from "@/hooks/useTemplateEditor";
import type { ElementType } from "@/types/template";

import { TabBtn } from "./shared";
import { PageSettingsPanel, SectionWatermarkPanel, PageWatermarkPanel } from "./PageSettingsPanel";
import { GridConfigPanel, CellFlexPanel } from "./GridConfigPanel";
import { LogoWidgetPanel } from "./widgetPanels/LogoWidgetPanel";
import { TextLabelPanel } from "./widgetPanels/TextLabelPanel";
import { ItemListPanel } from "./widgetPanels/ItemListPanel";
import { TotalsBlockPanel } from "./widgetPanels/TotalsBlockPanel";
import { DocumentInfoPanel, FieldsConfigPanel } from "./widgetPanels/FieldsWidgetPanels";
import { WidgetStylesPanel, WidgetConfigPanel } from "./widgetPanels/WidgetConfigPanel";

// -- Helpers -----------------------------------------------------------------

function resolveFocusedSection(
    template: TemplateV2,
    focusedSectionId: string,
): { section: SectionGridV2 | null; target: SectionTarget } {
    if (focusedSectionId === "header")
        return { section: template.header, target: "header" };
    if (focusedSectionId === "footer")
        return { section: template.footer, target: "footer" };
    const grid = template.body.grids.find((g) => g.id === focusedSectionId);
    return { section: grid ?? null, target: { bodyGridId: focusedSectionId } };
}

function findCellById(
    template: TemplateV2,
    cellId: string,
): TemplateGridCell | null {
    const hc = template.header.cells.find((c) => c.id === cellId);
    if (hc) return hc;
    const fc = template.footer.cells.find((c) => c.id === cellId);
    if (fc) return fc;
    for (const grid of template.body.grids) {
        const bc = grid.cells.find((c) => c.id === cellId);
        if (bc) return bc;
    }
    return null;
}

function findCellContainingWidget(
    template: TemplateV2,
    widgetId: string,
): TemplateGridCell | null {
    for (const cell of template.header.cells) {
        if (cell.children.some((n) => n.id === widgetId)) return cell;
    }
    for (const cell of template.footer.cells) {
        if (cell.children.some((n) => n.id === widgetId)) return cell;
    }
    for (const grid of template.body.grids) {
        for (const cell of grid.cells) {
            if (cell.children.some((n) => n.id === widgetId)) return cell;
        }
    }
    return null;
}

// -- Main Component ----------------------------------------------------------

interface PropsPP {
    template: TemplateV2;
    selectedId: string | null;
    selectedType: SelectionNodeType;
    focusedSectionId: string;
    onUpdateGridConfig: (
        target: SectionTarget,
        patch: Partial<GridConfig>,
    ) => void;
    onUpdateSectionHeight: (sectionId: "header" | "footer", h: number) => void;
    onUpdateSectionBg: (
        target: SectionTarget,
        bg: SectionGridV2["background"],
    ) => void;
    onUpdateSectionDividerColor: (
        target: "header" | "footer",
        color: string,
    ) => void;
    onUpdateWidgetPlacement: (
        nodeId: string,
        p: import("@/types/templateV2").BodyPlacement,
    ) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddWidget: (
        target: SectionTarget,
        cellId: string,
        type: ElementType,
    ) => void;
    onUpdateTemplate: (
        patch: Partial<
            Pick<
                TemplateV2,
                "pageSize" | "orientation" | "pagePadding" | "accentBorders" | "theme" | "documentType"
            >
        >,
    ) => void;
    onUpdateWidgetConfig: (
        nodeId: string,
        patch: Partial<
            Pick<TemplateWidget, "config" | "styles" | "bindings" | "placement">
        >,
    ) => void;
    onUpdateCellFlex: (cellId: string, flex: CellFlex | undefined) => void;
    onUpdateCellSpan?: (cellId: string, colSpan: number, rowSpan: number) => void;
    onSetSectionWatermark?: (target: SectionTarget, config: WatermarkConfig | null) => void;
    onSetPageWatermark?: (layer: "background" | "foreground", config: WatermarkConfig | null) => void;
    onUpdateSectionBorder?: (target: SectionTarget, border: SectionBorder | null) => void;
}

export function PropertiesPanel({
    template,
    selectedId,
    selectedType,
    focusedSectionId,
    onUpdateGridConfig,
    onUpdateSectionHeight,
    onUpdateSectionBg,
    onUpdateSectionDividerColor,
    onUpdateWidgetPlacement,
    onDeleteNode,
    onUpdateTemplate,
    onUpdateWidgetConfig,
    onUpdateCellFlex,
    onUpdateCellSpan,
    onSetSectionWatermark,
    onSetPageWatermark,
    onUpdateSectionBorder,
}: PropsPP) {
    const [_pageMode, setPageMode] = useState(false);
    // Auto-exit page mode when a widget or cell is selected
    const pageMode =
        _pageMode && selectedType !== "widget" && selectedType !== "cell";

    const { section, target } = resolveFocusedSection(
        template,
        focusedSectionId,
    );
    const isHF = focusedSectionId === "header" || focusedSectionId === "footer";

    // Find selected widget
    let selectedWidget: TemplateWidget | null = null;
    if (selectedId && selectedType === "widget") {
        const all = [
            ...collectWidgets(template.header),
            ...collectWidgets(template.footer),
            ...collectBodyWidgets(template.body),
        ];
        selectedWidget = all.find((w) => w.id === selectedId) ?? null;
    }

    // Find selected cell
    const selectedCell =
        selectedId && selectedType === "cell"
            ? findCellById(template, selectedId)
            : null;

    // When a widget is selected, also find its containing cell so we can
    // always show cell layout controls at the bottom of the panel.
    const widgetParentCell =
        selectedType === "widget" && selectedWidget
            ? findCellContainingWidget(template, selectedWidget.id)
            : null;

    // Panel context label
    let panelLabel = "Section Config";
    if (pageMode) panelLabel = "Page Settings";
    else if (selectedType === "cell") panelLabel = "Cell Layout";
    else if (selectedType === "widget" && selectedWidget) {
        panelLabel = selectedWidget.type.replace(/([A-Z])/g, " $1").trim();
    }

    return (
        <div
            style={{
                width: 240,
                flexShrink: 0,
                borderLeft: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Tab bar */}
            <div
                style={{
                    display: "flex",
                    borderBottom: "1px solid #e2e8f0",
                    flexShrink: 0,
                }}
            >
                <TabBtn
                    active={!pageMode}
                    onClick={() => setPageMode(false)}
                    label="Section"
                />
                <TabBtn
                    active={pageMode}
                    onClick={() => setPageMode(true)}
                    label="Page"
                />
            </div>

            {/* Context label */}
            <div
                style={{
                    padding: "5px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #f1f5f9",
                    flexShrink: 0,
                }}
            >
                {panelLabel}
            </div>

            {/* Scrollable content */}
            <div style={{ padding: "10px 12px", flex: 1, overflowY: "auto" }}>
                {pageMode ? (
                    /* ── PAGE tab ── */
                    <>
                        <PageSettingsPanel
                            template={template}
                            onUpdateTemplate={onUpdateTemplate}
                        />
                        {onSetPageWatermark && (
                            <PageWatermarkPanel
                                pageWatermarks={template.pageWatermarks}
                                onChange={onSetPageWatermark}
                            />
                        )}
                    </>
                ) : (
                    /* ── SECTION tab (context-sensitive) ── */
                    <>
                        {/* Cell selected → flex layout controls */}
                        {selectedType === "cell" && selectedCell && (
                            <CellFlexPanel
                                cell={selectedCell}
                                onChange={(f) =>
                                    onUpdateCellFlex(selectedCell.id, f)
                                }
                            />
                        )}

                        {/* Widget selected → type-specific controls + placement/delete */}
                        {selectedType === "widget" && selectedWidget && (
                            <>
                                {selectedWidget.type === "logo" && (
                                    <LogoWidgetPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type === "textLabel" && (
                                    <TextLabelPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type === "itemList" && (
                                    <ItemListPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type === "totalsBlock" && (
                                    <TotalsBlockPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch,
                                            )
                                        }
                                    />
                                )}
                                {selectedWidget.type !== "logo" &&
                                    selectedWidget.type !== "textLabel" && (
                                        <WidgetStylesPanel
                                            widget={selectedWidget}
                                            onUpdateStyles={(s) =>
                                                onUpdateWidgetConfig(
                                                    selectedWidget!.id,
                                                    { styles: s },
                                                )
                                            }
                                        />
                                    )}
                                {selectedWidget.type === "documentInfo" && (
                                    <DocumentInfoPanel
                                        widget={selectedWidget}
                                        onUpdateConfig={(patch) =>
                                            onUpdateWidgetConfig(
                                                selectedWidget!.id,
                                                patch as Partial<TemplateWidget>,
                                            )
                                        }
                                    />
                                )}
                                <FieldsConfigPanel
                                    widget={selectedWidget}
                                    onUpdateConfig={(patch) =>
                                        onUpdateWidgetConfig(
                                            selectedWidget!.id,
                                            patch,
                                        )
                                    }
                                />
                                <WidgetConfigPanel
                                    widget={selectedWidget}
                                    onUpdatePlacement={(p) =>
                                        onUpdateWidgetPlacement(
                                            selectedWidget!.id,
                                            p,
                                        )
                                    }
                                    onDelete={() =>
                                        onDeleteNode(selectedWidget!.id)
                                    }
                                />
                                {widgetParentCell && (
                                    <div style={{ marginTop: 16 }}>
                                        <CellFlexPanel
                                            cell={widgetParentCell}
                                            section={section ?? undefined}
                                            onChange={(f) =>
                                                onUpdateCellFlex(
                                                    widgetParentCell.id,
                                                    f,
                                                )
                                            }
                                            onSpanChange={
                                                onUpdateCellSpan
                                                    ? (cs, rs) =>
                                                          onUpdateCellSpan(
                                                              widgetParentCell.id,
                                                              cs,
                                                              rs,
                                                          )
                                                    : undefined
                                            }
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Nothing / section selected → grid config */}
                        {(!selectedType || selectedType === "section") &&
                            section && (
                                <>
                                    <GridConfigPanel
                                        section={section}
                                        isHeaderOrFooter={isHF}
                                        onUpdate={(patch) =>
                                            onUpdateGridConfig(target, patch)
                                        }
                                        onUpdateHeight={
                                            isHF
                                                ? (h) =>
                                                      onUpdateSectionHeight(
                                                          focusedSectionId as
                                                              | "header"
                                                              | "footer",
                                                          h,
                                                      )
                                                : undefined
                                        }
                                        onUpdateBg={(bg) =>
                                            onUpdateSectionBg(target, bg)
                                        }
                                        onUpdateDividerColor={
                                            isHF
                                                ? (color) =>
                                                      onUpdateSectionDividerColor(
                                                          focusedSectionId as
                                                              | "header"
                                                              | "footer",
                                                          color,
                                                      )
                                                : undefined
                                        }
                                        onUpdateBorder={
                                            onUpdateSectionBorder
                                                ? (b) => onUpdateSectionBorder(target, b)
                                                : undefined
                                        }
                                    />
                                    {onSetSectionWatermark && (
                                        <SectionWatermarkPanel
                                            watermark={section.watermark}
                                            onChange={(cfg) => onSetSectionWatermark(target, cfg)}
                                        />
                                    )}
                                </>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}
