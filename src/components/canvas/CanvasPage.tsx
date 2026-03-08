import { useRef } from "react";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { PAGE_DIMENSIONS } from "@/types/common";
import { SectionRenderer, BodySectionRenderer } from "./SectionRenderer";
import type { PageSlice } from "@/hooks/usePagination";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    doc: StoredDocument;
    totals: TotalsResult;
    pageNumber: number;
    totalPages: number;
    slice?: PageSlice; // when provided, only render items in this slice
    zoom?: number;
    /** Editor-only: callback to update header height (px). Omit outside editor. */
    onHeaderResize?: (height: number) => void;
    /** Editor-only: callback to update footer height (px). Omit outside editor. */
    onFooterResize?: (height: number) => void;
    /** Editor-only: called with new column widths when user drags a header column divider. */
    onHeaderColsResize?: (widths: string[]) => void;
    /** Editor-only: called with new column widths when user drags a footer column divider. */
    onFooterColsResize?: (widths: string[]) => void;
    /** Editor-only: called when user drags a column divider inside a body grid row. */
    onBodyGridRowColsResize?: (rowId: string, widths: string[]) => void;
    /** CSS scale applied to the canvas by the parent — used to convert screen-pixel drag deltas to canvas pixels. */
    resizeScale?: number;
}

export function CanvasPage({
    doc,
    totals,
    pageNumber,
    totalPages,
    slice,
    zoom = 1,
    onHeaderResize,
    onFooterResize,
    onHeaderColsResize,
    onFooterColsResize,
    onBodyGridRowColsResize,
    resizeScale = 1,
}: Props) {
    const { templateSnapshot } = doc;
    const { pageSize, header, body, footer } = templateSnapshot;
    const dims = PAGE_DIMENSIONS[pageSize];
    const { fillMode } = useFillMode();

    // ── Drag-to-resize logic (editor only) ──────────────────────────────
    const dragRef = useRef<{
        startY: number;
        startHeight: number;
        type: "header" | "footer";
    } | null>(null);

    function startDrag(
        e: React.MouseEvent,
        type: "header" | "footer",
        startHeight: number,
    ) {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = { startY: e.clientY, startHeight, type };

        function onMove(ev: MouseEvent) {
            if (!dragRef.current) return;
            const delta = (ev.clientY - dragRef.current.startY) / resizeScale;
            if (dragRef.current.type === "header") {
                const newH = Math.max(
                    60,
                    Math.min(300, dragRef.current.startHeight + delta),
                );
                onHeaderResize?.(Math.round(newH));
            } else {
                // footer is anchored at the bottom — drag up = larger footer, so negate delta
                const newH = Math.max(
                    40,
                    Math.min(200, dragRef.current.startHeight - delta),
                );
                onFooterResize?.(Math.round(newH));
            }
        }

        function onUp() {
            dragRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        }

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }

    // Build a scoped doc for this page that only contains the items for this slice
    const pageDoc: StoredDocument = slice
        ? {
              ...doc,
              data: {
                  ...doc.data,
                  items: doc.data.items.slice(
                      slice.itemStartIndex,
                      slice.itemEndIndex,
                  ),
              },
          }
        : doc;

    const { fontFamily, primaryColor, accentColor } = templateSnapshot.theme;
    const bodyBg = templateSnapshot.theme.bodyBackground;
    const pageBackgroundStyle: React.CSSProperties = {};
    if (bodyBg?.color) pageBackgroundStyle.backgroundColor = bodyBg.color;
    if (bodyBg?.imageUrl) {
        pageBackgroundStyle.backgroundImage = `url('${bodyBg.imageUrl}')`;
        pageBackgroundStyle.backgroundSize =
            bodyBg.imageSize === "repeat"
                ? "auto"
                : (bodyBg.imageSize ?? "cover");
        pageBackgroundStyle.backgroundPosition = "center";
        pageBackgroundStyle.backgroundRepeat =
            bodyBg.imageSize === "repeat" ? "repeat" : "no-repeat";
    }

    return (
        <div
            data-canvas-page="true"
            className="relative bg-white shadow-md overflow-hidden print:transform-none print:shadow-none print:mb-0"
            style={
                {
                    width: dims.width,
                    height: dims.height,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    marginBottom:
                        zoom < 1 ? `${dims.height * (zoom - 1)}px` : undefined,
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                    // Theme — these cascade to all child elements
                    fontFamily: fontFamily,
                    color: primaryColor,
                    "--doc-accent": accentColor,
                    "--doc-primary": primaryColor,
                    ...pageBackgroundStyle,
                } as React.CSSProperties
            }
        >
            {/* Header */}
            {header.visible && (
                <div
                    className={`border-b border-border${onHeaderResize ? " group/hdr relative" : ""}`}
                    style={{ height: header.height }}
                >
                    <SectionRenderer
                        section={header}
                        doc={doc}
                        totals={totals}
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        sectionType="header"
                        onColsResize={onHeaderColsResize}
                        resizeScale={resizeScale}
                    />
                    {/* Header resize handle — hover-only pill at the bottom edge */}
                    {onHeaderResize && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: -5,
                                left: 0,
                                right: 0,
                                height: 10,
                                zIndex: 50,
                                cursor: "row-resize",
                            }}
                            className="flex items-center justify-center select-none"
                            onMouseDown={(e) =>
                                startDrag(e, "header", header.height)
                            }
                            title="Drag to resize header"
                        >
                            <div className="h-1 w-24 rounded-full bg-blue-500 opacity-0 group-hover/hdr:opacity-70 transition-opacity" />
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div
                style={{
                    height:
                        dims.height -
                        (header.visible ? header.height : 0) -
                        (footer.visible ? footer.height : 0),
                    overflow: "hidden",
                }}
            >
                <BodySectionRenderer
                    section={body}
                    doc={pageDoc}
                    totals={totals}
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    showTotals={slice ? slice.showTotals : true}
                    showColumnHeader={slice ? slice.showColumnHeader : true}
                    isFirstPage={pageNumber === 1}
                    itemOffset={slice ? slice.itemStartIndex : 0}
                    isLastPage={
                        slice
                            ? slice.itemEndIndex === doc.data.items.length
                            : true
                    }
                    allItems={doc.data.items}
                    postTableStartIndex={slice?.postTableStartIndex ?? 0}
                    onGridRowColsResize={onBodyGridRowColsResize}
                    resizeScale={resizeScale}
                    postTableEndIndex={slice?.postTableEndIndex}
                />
            </div>

            {/* Footer */}
            {footer.visible && (
                <div
                    className={`absolute bottom-0 left-0 right-0 border-t border-border${onFooterResize ? " group/ftr" : ""}`}
                    style={{ height: footer.height }}
                >
                    {/* Footer resize handle — hover-only pill at the top edge */}
                    {onFooterResize && (
                        <div
                            style={{
                                position: "absolute",
                                top: -5,
                                left: 0,
                                right: 0,
                                height: 10,
                                zIndex: 50,
                                cursor: "row-resize",
                            }}
                            className="flex items-center justify-center select-none"
                            onMouseDown={(e) =>
                                startDrag(e, "footer", footer.height)
                            }
                            title="Drag to resize footer"
                        >
                            <div className="h-1 w-24 rounded-full bg-blue-500 opacity-0 group-hover/ftr:opacity-70 transition-opacity" />
                        </div>
                    )}
                    <SectionRenderer
                        section={footer}
                        doc={doc}
                        totals={totals}
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        sectionType="footer"
                        onColsResize={onFooterColsResize}
                        resizeScale={resizeScale}
                    />
                </div>
            )}

            {/* Boundary guide lines — fill mode only, not in preview or PDF.
          Offset by 16px (body p-4 padding) to match the actual content boundary
          that usePagination uses for its availableH calculation. */}
            {fillMode && (
                <>
                    {header.visible && (
                        <div
                            className="absolute left-0 right-0 pointer-events-none"
                            style={{
                                top: header.height + 16,
                                height: 0,
                                borderTop: "1.5px dashed #3b82f6",
                                zIndex: 100,
                            }}
                        >
                            <span
                                className="absolute font-mono"
                                style={{
                                    fontSize: "8px",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    padding: "1px 3px",
                                    top: -10,
                                    left: 0,
                                }}
                            >
                                x:0 y:{header.height + 16}
                            </span>
                        </div>
                    )}
                    {footer.visible && (
                        <div
                            className="absolute left-0 right-0 pointer-events-none"
                            style={{
                                top: dims.height - footer.height - 16,
                                height: 0,
                                borderTop: "1.5px dashed #3b82f6",
                                zIndex: 100,
                            }}
                        >
                            <span
                                className="absolute font-mono"
                                style={{
                                    fontSize: "8px",
                                    background: "#3b82f6",
                                    color: "#fff",
                                    padding: "1px 3px",
                                    top: 2,
                                    left: 0,
                                }}
                            >
                                x:0 y:{dims.height - footer.height - 16}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
