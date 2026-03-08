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
    slice?: PageSlice;
    zoom?: number;
}

export function CanvasPage({
    doc,
    totals,
    pageNumber,
    totalPages,
    slice,
    zoom = 1,
}: Props) {
    const { templateSnapshot } = doc;
    const { pageSize, header, body, footer, theme } = templateSnapshot;
    const dims = PAGE_DIMENSIONS[pageSize];
    const { fillMode } = useFillMode();

    // Build a scoped doc for this page's item slice
    const pageDoc: StoredDocument = slice
        ? {
              ...doc,
              data: {
                  ...doc.data,
                  items: doc.data.items.slice(slice.itemStartIndex, slice.itemEndIndex),
              },
          }
        : doc;

    const { fontFamily, primaryColor, accentColor } = theme;

    // Page background (V2 stores it as pageBackground on the template)
    const pageBg = (templateSnapshot as Record<string, unknown>).pageBackground as
        | { color?: string; imageUrl?: string; imageSize?: string }
        | undefined;
    const pageBackgroundStyle: React.CSSProperties = {};
    if (pageBg?.color) pageBackgroundStyle.backgroundColor = pageBg.color;
    if (pageBg?.imageUrl) {
        pageBackgroundStyle.backgroundImage = `url('${pageBg.imageUrl}')`;
        pageBackgroundStyle.backgroundSize = pageBg.imageSize === "repeat" ? "auto" : (pageBg.imageSize ?? "cover");
        pageBackgroundStyle.backgroundPosition = "center";
        pageBackgroundStyle.backgroundRepeat = pageBg.imageSize === "repeat" ? "repeat" : "no-repeat";
    }

    const headerH = header.visible ? (header.height ?? 120) : 0;
    const footerH = footer.visible ? (footer.height ?? 60) : 0;

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
                    marginBottom: zoom < 1 ? `${dims.height * (zoom - 1)}px` : undefined,
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                    fontFamily,
                    color: primaryColor,
                    "--doc-accent": accentColor,
                    "--doc-primary": primaryColor,
                    ...pageBackgroundStyle,
                } as React.CSSProperties
            }
        >
            {/* Header */}
            {header.visible && (
                <div className="border-b border-border" style={{ height: headerH }}>
                    <SectionRenderer
                        section={header}
                        doc={doc}
                        totals={totals}
                        currentPage={pageNumber}
                        totalPages={totalPages}
                    />
                </div>
            )}

            {/* Body */}
            <div style={{ height: dims.height - headerH - footerH, overflow: "hidden" }}>
                <BodySectionRenderer
                    body={body}
                    doc={pageDoc}
                    totals={totals}
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    showTotals={slice ? slice.showTotals : true}
                    showColumnHeader={slice ? slice.showColumnHeader : true}
                    isFirstPage={pageNumber === 1}
                    itemOffset={slice ? slice.itemStartIndex : 0}
                    isLastPage={slice ? slice.itemEndIndex === doc.data.items.length : true}
                    allItems={doc.data.items}
                    postTableStartIndex={slice?.postTableStartIndex ?? 0}
                    postTableEndIndex={slice?.postTableEndIndex}
                />
            </div>

            {/* Footer */}
            {footer.visible && (
                <div
                    className="absolute bottom-0 left-0 right-0 border-t border-border"
                    style={{ height: footerH }}
                >
                    <SectionRenderer
                        section={footer}
                        doc={doc}
                        totals={totals}
                        currentPage={pageNumber}
                        totalPages={totalPages}
                    />
                </div>
            )}

            {/* Boundary guide lines — fill mode only */}
            {fillMode && (
                <>
                    {header.visible && (
                        <div
                            className="absolute left-0 right-0 pointer-events-none"
                            style={{ top: headerH + 16, height: 0, borderTop: "1.5px dashed #3b82f6", zIndex: 100 }}
                        >
                            <span
                                className="absolute font-mono"
                                style={{ fontSize: "8px", background: "#3b82f6", color: "#fff", padding: "1px 3px", top: -10, left: 0 }}
                            >
                                x:0 y:{headerH + 16}
                            </span>
                        </div>
                    )}
                    {footer.visible && (
                        <div
                            className="absolute left-0 right-0 pointer-events-none"
                            style={{ top: dims.height - footerH - 16, height: 0, borderTop: "1.5px dashed #3b82f6", zIndex: 100 }}
                        >
                            <span
                                className="absolute font-mono"
                                style={{ fontSize: "8px", background: "#3b82f6", color: "#fff", padding: "1px 3px", top: 2, left: 0 }}
                            >
                                x:0 y:{dims.height - footerH - 16}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
