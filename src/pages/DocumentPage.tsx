/**
 * DocumentPage
 *
 * Unified document fill + preview page built on the V2 EditorGrid pipeline.
 * Replaces the old FillModePage + PreviewPage.
 *
 * Modes:
 *  - Edit (default): fillMode=true — all widgets render as editable fields.
 *  - Preview: fillMode=false — clean static render.
 *
 * Layout:
 *  - Continuous (default): one scrollable canvas, no page breaks.
 *  - Paged: fixed page-height boxes with pagination measured from DOM.
 */
import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Layers,
    FileText,
    Scroll,
    Download,
    Printer,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAppSelector, useAppDispatch } from "@/hooks/useAppDispatch";
import { updateDocument } from "@/store/slices/documentsSlice";
import { FillModeProvider, useFillMode } from "@/components/fill-mode/FillModeContext";
import { EditorGrid } from "@/components/canvas/EditorGrid";
import { PageSliceProvider } from "@/context/PageSliceContext";
import { useDocumentPagination } from "@/hooks/useDocumentPagination";
import { calculateTotals } from "@/services/calculations";
import { downloadHtml } from "@/services/htmlExport";
import { downloadPdf } from "@/services/pdfExport";
import { PAGE_DIMENSIONS } from "@/types/common";
import { WatermarkElement } from "@/components/elements/WatermarkElement";
import { newLineItem } from "@/components/elements/ItemListElement";

import type {
    CompanyData,
    ClientData,
    InvoiceMeta,
    EstimateMeta,
    ReceiptMeta,
    LineItem,
    TotalsConfig,
    DocumentData,
} from "@/types/document";

// ── DocumentPage ─────────────────────────────────────────────────────────────

export default function DocumentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const doc = useAppSelector((s) =>
        s.documents.documents.find((d) => d.id === id),
    );

    const [previewMode, setPreviewMode] = useState(false);
    const [showGuides, setShowGuides] = useState(false);
    const [pagedMode, setPagedMode] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // ── Totals ────────────────────────────────────────────────────────────────
    const totals = useMemo(
        () =>
            doc
                ? calculateTotals(doc.data.items, doc.data.totalsConfig)
                : null,
        [doc],
    );

    // ── Pagination ────────────────────────────────────────────────────────────
    const { pages, measureRef } = useDocumentPagination(doc!, pagedMode);

    // ── Update callbacks ──────────────────────────────────────────────────────
    const patch = useCallback(
        (data: Partial<DocumentData>) => {
            if (!id) return;
            setHasSaved(true);
            dispatch(updateDocument({ id, data }));
        },
        [id, dispatch],
    );

    const fillModeCtx = useMemo(
        () => ({
            fillMode: !previewMode,
            showBounds: showGuides,
            docId: id ?? "",
            onUpdateCompany: (p: Partial<CompanyData>) =>
                patch({ company: { ...doc!.data.company, ...p } }),
            onUpdateClient: (p: Partial<ClientData>) =>
                patch({ client: { ...doc!.data.client, ...p } }),
            onUpdateInvoiceMeta: (p: Partial<InvoiceMeta>) =>
                doc!.data.meta.type === "invoice"
                    ? patch({ meta: { ...doc!.data.meta, ...p } })
                    : undefined,
            onUpdateEstimateMeta: (p: Partial<EstimateMeta>) =>
                doc!.data.meta.type === "estimate"
                    ? patch({ meta: { ...doc!.data.meta, ...p } })
                    : undefined,
            onUpdateReceiptMeta: (p: Partial<ReceiptMeta>) =>
                doc!.data.meta.type === "receipt"
                    ? patch({ meta: { ...doc!.data.meta, ...p } })
                    : undefined,
            onUpdateItems: (items: LineItem[]) => patch({ items }),
            onUpdateTotalsConfig: (p: Partial<TotalsConfig>) =>
                patch({ totalsConfig: { ...doc!.data.totalsConfig, ...p } }),
            onUpdateNotes: (notes: string) => patch({ notes }),
            onUpdateTerms: (terms: string) => patch({ terms }),
            onUpdateData: patch,
        }),
        [previewMode, showGuides, id, doc, patch],
    );

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!doc || !id || !totals) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-muted-foreground">Document not found.</p>
                <Button variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Documents
                </Button>
            </div>
        );
    }

    const template = doc.templateSnapshot;
    const dims = PAGE_DIMENSIONS[template.pageSize ?? "A4"];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <FillModeProvider value={fillModeCtx}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    overflow: "hidden",
                    background: "#f8fafc",
                }}
            >
                {/* ── Toolbar ── */}
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        background: "white",
                        borderBottom: "1px solid #e2e8f0",
                        flexShrink: 0,
                        zIndex: 100,
                    }}
                >
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: "#64748b",
                            padding: 4,
                        }}
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                            {doc.data.meta.number}
                        </span>
                        <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "capitalize" }}>
                            {doc.documentType}
                        </span>
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Auto-saved indicator */}
                    {hasSaved && (
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                color: "#16a34a",
                            }}
                        >
                            <CheckCircle size={12} /> Auto-saved
                        </span>
                    )}

                    {/* Guidelines toggle */}
                    <button
                        onClick={() => setShowGuides((v) => !v)}
                        title={showGuides ? "Hide guidelines" : "Show guidelines"}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid",
                            borderColor: showGuides ? "#6366f1" : "#e2e8f0",
                            background: showGuides ? "#eef2ff" : "white",
                            color: showGuides ? "#6366f1" : "#64748b",
                            cursor: "pointer",
                        }}
                    >
                        <Layers size={13} />
                        Guides
                    </button>

                    {/* Layout mode: Continuous / Paged */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            padding: 2,
                            gap: 2,
                        }}
                    >
                        <button
                            title="Continuous scroll — one long page"
                            onClick={() => setPagedMode(false)}
                            style={modeTabStyle(!pagedMode)}
                        >
                            <Scroll size={12} /> Scroll
                        </button>
                        <button
                            title="Paginated — fixed page-height boxes"
                            onClick={() => setPagedMode(true)}
                            style={modeTabStyle(pagedMode)}
                        >
                            <FileText size={12} /> Paged
                        </button>
                    </div>

                    {/* Preview toggle */}
                    <Button
                        variant={previewMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewMode((v) => !v)}
                        title={previewMode ? "Switch back to edit mode" : "Preview — see clean output"}
                    >
                        {previewMode ? (
                            <><EyeOff className="size-3.5 mr-1" /> Edit</>
                        ) : (
                            <><Eye className="size-3.5 mr-1" /> Preview</>
                        )}
                    </Button>

                    {/* Exports */}
                    <button
                        onClick={() => downloadHtml(doc)}
                        title="Download HTML"
                        style={exportBtnStyle}
                    >
                        <Download size={13} /> HTML
                    </button>
                    <button
                        onClick={() => downloadPdf(doc)}
                        title="Download / Print PDF"
                        style={exportBtnStyle}
                    >
                        <Printer size={13} /> PDF
                    </button>
                </header>

                {/* ── Canvas area ── */}
                <div
                    style={{
                        flex: 1,
                        overflow: "auto",
                        background: "#d1d5db",
                        position: "relative",
                    }}
                >
                    {pagedMode ? (
                        <PagedCanvas
                            doc={doc}
                            totals={totals}
                            dims={dims}
                            pages={pages}
                            measureRef={measureRef as React.RefObject<HTMLDivElement>}
                            template={template}
                        />
                    ) : (
                        <ContinuousCanvas doc={doc} totals={totals} dims={dims} template={template} />
                    )}
                </div>
            </div>
        </FillModeProvider>
    );
}

// ── Continuous canvas ─────────────────────────────────────────────────────────

function ContinuousCanvas({
    doc,
    totals,
    dims,
    template,
}: {
    doc: import("@/types/document").StoredDocument;
    totals: import("@/types/document").TotalsResult;
    dims: { width: number; height: number };
    template: import("@/types/templateV2").TemplateV2;
}) {
    return (
        <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
                data-canvas-page="1"
                style={pageBoxStyle(dims.width, template)}
            >
                <TemplateBody doc={doc} totals={totals} template={template} />
            </div>
        </div>
    );
}

// ── Paged canvas ──────────────────────────────────────────────────────────────

function PagedCanvas({
    doc,
    totals,
    dims,
    pages,
    measureRef,
    template,
}: {
    doc: import("@/types/document").StoredDocument;
    totals: import("@/types/document").TotalsResult;
    dims: { width: number; height: number };
    pages: import("@/context/PageSliceContext").PageSliceValue[];
    measureRef: React.RefObject<HTMLDivElement>;
    template: import("@/types/templateV2").TemplateV2;
}) {
    const { showBounds, fillMode, onUpdateItems } = useFillMode();
    const headerH = template.header.visible ? (template.header.height ?? 120) : 0;
    const footerH = template.footer.visible ? (template.footer.height ?? 60) : 0;

    // Effective page padding — mirrors what useDocumentPagination computes.
    const padTop    = template.pagePadding?.top    ?? 0;
    const padBottom = template.pagePadding?.bottom ?? 0;
    const padLeft   = template.pagePadding?.left   ?? 0;
    const padRight  = template.pagePadding?.right  ?? 0;

    const headerDivider = showBounds
        ? "2px dashed #6366f1"
        : template.header.dividerColor
          ? `1px solid ${template.header.dividerColor}`
          : "1px solid #e2e8f0";
    const footerDivider = showBounds
        ? "2px dashed #6366f1"
        : template.footer.dividerColor
          ? `1px solid ${template.footer.dividerColor}`
          : "1px solid #e2e8f0";

    return (
        <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            {/* Hidden measurement container — renders full item list off-screen */}
            <div
                ref={measureRef}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: -9999,
                    left: 0,
                    width: dims.width,
                    visibility: "hidden",
                    pointerEvents: "none",
                    fontFamily: template.theme?.fontFamily,
                    fontSize: 14,
                }}
            >
                <TemplateBody doc={doc} totals={totals} template={template} />
            </div>

            {/* Rendered pages */}
            {pages.map((slice, idx) => (
                <PageSliceProvider key={idx} value={slice}>
                    <div style={{ position: "relative" }}>
                        {/* Page label */}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            right: -80,
                            fontSize: 11,
                            color: "#94a3b8",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                        }}>
                            Page {slice.currentPage} / {slice.totalPages}
                        </div>

                    <div
                        data-canvas-page={slice.currentPage}
                        style={{
                            ...pageBoxStyle(dims.width, template),
                            height: dims.height,
                            overflow: "hidden",
                            boxSizing: "border-box",
                            paddingTop: padTop,
                            paddingBottom: padBottom,
                            paddingLeft: padLeft,
                            paddingRight: padRight,
                        }}
                    >
                        {/* Header */}
                        {template.header.visible && (
                            <div style={{ height: headerH, flexShrink: 0, borderBottom: headerDivider }}>
                                <EditorGrid
                                    section={template.header}
                                    doc={doc}
                                    totals={totals}
                                    editMode={false}
                                />
                            </div>
                        )}

                        {/* Body — all grids, slice-controlled via PageSliceContext */}
                        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            {template.body.grids.map((grid) => (
                                <EditorGrid
                                    key={grid.id}
                                    section={grid}
                                    doc={doc}
                                    totals={totals}
                                    editMode={false}
                                />
                            ))}
                        </div>

                        {/* Footer */}
                        {template.footer.visible && (
                            <div style={{ height: footerH, flexShrink: 0, borderTop: footerDivider }}>
                                <EditorGrid
                                    section={template.footer}
                                    doc={doc}
                                    totals={totals}
                                    editMode={false}
                                />
                            </div>
                        )}

                        {/* Page watermarks */}
                        {template.pageWatermarks?.background && (
                            <WatermarkElement
                                element={{
                                    id: `wm_bg_${slice.currentPage}`,
                                    type: "watermark",
                                    zIndex: 1,
                                    config: template.pageWatermarks.background as unknown as Record<string, unknown>,
                                }}
                            />
                        )}
                        {template.pageWatermarks?.foreground && (
                            <WatermarkElement
                                element={{
                                    id: `wm_fg_${slice.currentPage}`,
                                    type: "watermark",
                                    zIndex: 200,
                                    config: template.pageWatermarks.foreground as unknown as Record<string, unknown>,
                                }}
                            />
                        )}
                    </div>
                    </div>
                </PageSliceProvider>
            ))}

            {/* Floating Add Row — below the last page box, outside pagination */}
            {fillMode && (
                <button
                    onClick={() => onUpdateItems([...doc.data.items, newLineItem()])}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 4,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6366f1",
                        background: "white",
                        border: "1px dashed #6366f1",
                        borderRadius: 6,
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        marginLeft: 0,
                    }}
                >
                    + Add Row
                </button>
            )}
        </div>
    );
}

// ── Template body (used by both modes) ───────────────────────────────────────

function TemplateBody({
    doc,
    totals,
    template,
}: {
    doc: import("@/types/document").StoredDocument;
    totals: import("@/types/document").TotalsResult;
    template: import("@/types/templateV2").TemplateV2;
}) {
    const { showBounds } = useFillMode();

    return (
        <>
            {/* Accent border top */}
            {template.accentBorders?.top?.enabled && (
                <div style={{ height: template.accentBorders.top.width, background: template.accentBorders.top.color, flexShrink: 0 }} />
            )}

            <div
                style={{
                    paddingTop: template.pagePadding?.top ?? 0,
                    paddingRight: template.pagePadding?.right ?? 0,
                    paddingBottom: template.pagePadding?.bottom ?? 0,
                    paddingLeft: template.pagePadding?.left ?? 0,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header section */}
                {template.header.visible && (
                    <div
                        style={{
                            borderBottom: showBounds
                                ? "2px dashed #6366f1"
                                : template.header.dividerColor
                                  ? `1px solid ${template.header.dividerColor}`
                                  : "1px solid #e2e8f0",
                            flexShrink: 0,
                        }}
                    >
                        <EditorGrid
                            section={template.header}
                            doc={doc}
                            totals={totals}
                            editMode={false}
                        />
                    </div>
                )}

                {/* Body grids */}
                <div data-measure-body style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {template.body.grids.map((grid) => (
                        <EditorGrid
                            key={grid.id}
                            section={grid}
                            doc={doc}
                            totals={totals}
                            editMode={false}
                        />
                    ))}
                </div>

                {/* Footer section */}
                {template.footer.visible && (
                    <div
                        style={{
                            borderTop: showBounds
                                ? "2px dashed #6366f1"
                                : template.footer.dividerColor
                                  ? `1px solid ${template.footer.dividerColor}`
                                  : "1px solid #e2e8f0",
                            flexShrink: 0,
                        }}
                    >
                        <EditorGrid
                            section={template.footer}
                            doc={doc}
                            totals={totals}
                            editMode={false}
                        />
                    </div>
                )}
            </div>

            {/* Accent border bottom */}
            {template.accentBorders?.bottom?.enabled && (
                <div style={{ height: template.accentBorders.bottom.width, background: template.accentBorders.bottom.color, flexShrink: 0 }} />
            )}

            {/* Page watermarks */}
            {template.pageWatermarks?.background && (
                <WatermarkElement
                    element={{
                        id: "wm_bg",
                        type: "watermark",
                        zIndex: 1,
                        config: template.pageWatermarks.background as unknown as Record<string, unknown>,
                    }}
                />
            )}
            {template.pageWatermarks?.foreground && (
                <WatermarkElement
                    element={{
                        id: "wm_fg",
                        type: "watermark",
                        zIndex: 200,
                        config: template.pageWatermarks.foreground as unknown as Record<string, unknown>,
                    }}
                />
            )}
        </>
    );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

function pageBoxStyle(
    width: number,
    template: import("@/types/templateV2").TemplateV2,
): React.CSSProperties {
    return {
        width,
        background: template.pageBackground ?? "white",
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        borderRadius: 4,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: template.theme?.fontFamily,
        color: template.theme?.primaryColor,
        borderLeft: template.accentBorders?.left?.enabled
            ? `${template.accentBorders.left.width}px solid ${template.accentBorders.left.color}`
            : undefined,
        borderRight: template.accentBorders?.right?.enabled
            ? `${template.accentBorders.right.width}px solid ${template.accentBorders.right.color}`
            : undefined,
    };
}

const modeTabStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    background: active ? "white" : "transparent",
    color: active ? "#6366f1" : "#64748b",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.15s",
});

const exportBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#374151",
    cursor: "pointer",
};
