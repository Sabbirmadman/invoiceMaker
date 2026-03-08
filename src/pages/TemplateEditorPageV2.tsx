/**
 * TemplateEditorPageV2
 *
 * New 3-panel drag-and-drop template editor built on TemplateV2.
 * Replaces the old wizard-based TemplateEditorPage for V2 templates.
 *
 * Layout:
 *   [Widget Palette] | [Canvas: header + body + footer] | [Properties Panel]
 */
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Undo2, Redo2, Eye, Save, Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { TemplateV2 } from "@/types/templateV2";
import type { ElementType } from "@/types/template";

import { useAppSelector, useAppDispatch } from "@/hooks/useAppDispatch";
import { saveTemplateV2 } from "@/store/slices/templatesSlice";
import { useTemplateEditor } from "@/hooks/useTemplateEditor";
import type { SectionTarget } from "@/hooks/useTemplateEditor";
import { ensureV2, createBlankTemplateV2 } from "@/utils/migrateTemplate";

import { EditorSelectionProvider, useEditorSelection } from "@/components/editor/EditorSelectionContext";
import { DragProvider, useDrag } from "@/components/editor/DragContext";
import { WidgetPalette } from "@/components/editor/WidgetPalette";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorGrid } from "@/components/canvas/EditorGrid";
import { FillModeProvider } from "@/components/fill-mode/FillModeContext";

import { calculateTotals } from "@/services/calculations";
import { PAGE_DIMENSIONS } from "@/types/common";

// ── Preview document (dummy data for editor canvas) ───────────────────────────

import type { StoredDocument } from "@/types/document";

function makeDummyDoc(template: TemplateV2): StoredDocument {
    // Build a V1-shaped templateSnapshot for element components that expect it.
    // The editor canvas renders WidgetRenderer which uses existing element components.
    return {
        id: "preview",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documentType: template.documentType,
        templateSnapshot: {
            id: template.id,
            name: template.name,
            documentType: template.documentType,
            pageSize: template.pageSize,
            orientation: template.orientation,
            theme: template.theme,
            header: { height: template.header.height ?? 120, visible: template.header.visible, grid: { columns: [], rows: [] }, elements: [] },
            body: { elements: [] },
            footer: { height: template.footer.height ?? 60, visible: template.footer.visible, grid: { columns: [], rows: [] }, elements: [] },
        } as import("@/types/template").Template,
        data: {
            company: {
                name: "Your Company",
                address: "123 Main Street",
                city: "New York",
                state: "NY",
                zip: "10001",
                country: "USA",
                phone: "+1 (555) 000-0000",
                email: "hello@company.com",
                website: "www.company.com",
                taxId: "XX-XXXXXXX",
                logoUrl: undefined,
            },
            client: {
                name: "Client Name",
                company: "Client Company",
                address: "456 Client Ave",
                city: "Los Angeles",
                state: "CA",
                zip: "90001",
                country: "USA",
                phone: "+1 (555) 111-1111",
                email: "client@example.com",
                shippingAddress: "456 Client Ave\nLos Angeles, CA 90001",
                taxId: "",
            },
            meta: {
                type: template.documentType as "invoice",
                number: "INV-001",
                date: new Date().toISOString().slice(0, 10),
                dueDate: new Date().toISOString().slice(0, 10),
                terms: "",
                poNumber: "",
                projectName: "",
                reference: "",
                placeOfSupply: "",
            },
            items: [
                { id: "1", name: "Sample Item", description: "", qty: 1, unit: "", rate: 100, discount: 0, discountType: "percent" as const, taxRate: 0, amount: 100 },
            ],
            totalsConfig: {
                currency: "USD",
                overallDiscount: 0,
                overallDiscountType: "percent" as const,
                tax1: { label: "Tax", rate: 0, enabled: false },
                tax2: { label: "Tax 2", rate: 0, enabled: false },
                shipping: 0,
                adjustment: 0,
                amountPaid: 0,
            },
            notes: "",
            terms: "",
        },
    };
}

// ── Inner editor (has access to DragContext + SelectionContext) ────────────────

function EditorInner({
    templateId,
}: {
    templateId: string | undefined;
}) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { selectedId, selectedType, clearSelection } = useEditorSelection();
    const { draggingWidgetType, draggingNodeId, endDrag } = useDrag();

    // Load existing template or create blank
    const existingTemplate = useAppSelector((s) =>
        s.templates.customTemplates.find((t) => t.id === templateId),
    );

    const initialTemplate = useMemo<TemplateV2>(() => {
        if (existingTemplate) return ensureV2(existingTemplate as import("@/types/template").Template);
        return createBlankTemplateV2(`tpl_${Date.now()}`, "New Template");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId]);

    const editor = useTemplateEditor(initialTemplate);
    const { template, canUndo, canRedo, undo, redo } = editor;

    const [templateName, setTemplateName] = useState(template.name);
    const [previewMode, setPreviewMode] = useState(false);
    // focusedSection: "header" | "footer" | a body grid id
    const [focusedSection, setFocusedSection] = useState<string>(
        template.body.grids[0]?.id ?? "body"
    );

    const dummyDoc = useMemo(() => makeDummyDoc(template), [template]);
    const totals = useMemo(() => calculateTotals(dummyDoc.data.items, dummyDoc.data.totalsConfig), [dummyDoc]);
    const dims = PAGE_DIMENSIONS[template.pageSize];

    // ── Drop handler — resolves drag payload and calls editor ──────────────

    function resolveSection(cellId: string): SectionTarget {
        if (cellId.startsWith("empty_header") || cellId.startsWith("header")) return "header";
        if (cellId.startsWith("empty_footer") || cellId.startsWith("footer")) return "footer";
        // Check if cellId matches a body grid id prefix
        for (const grid of template.body.grids) {
            if (cellId.startsWith(`empty_${grid.id}`) || cellId.startsWith(grid.id)) {
                return { bodyGridId: grid.id };
            }
        }
        // Fallback: if focusedSection is a body grid id
        if (focusedSection !== "header" && focusedSection !== "footer") {
            return { bodyGridId: focusedSection };
        }
        return focusedSection as "header" | "footer";
    }

    function handleDropIntoCell(cellId: string, dropIndex: number) {
        if (draggingWidgetType) {
            editor.addWidget(resolveSection(cellId), cellId, draggingWidgetType, dropIndex);
        } else if (draggingNodeId) {
            editor.moveNode(draggingNodeId, cellId, dropIndex);
        }
        endDrag();
    }

    function handleSave() {
        const toSave = { ...template, name: templateName };
        dispatch(saveTemplateV2(toSave));
        navigate(-1);
    }

    function handleCanvasClick() {
        clearSelection();
        // Don't clear section focus
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const canvasWidth = dims.width;

    return (
        <FillModeProvider value={{
            fillMode: false,
            showBounds: false,
            docId: "preview",
            onUpdateCompany: () => {},
            onUpdateClient: () => {},
            onUpdateInvoiceMeta: () => {},
            onUpdateEstimateMeta: () => {},
            onUpdateReceiptMeta: () => {},
            onUpdateItems: () => {},
            onUpdateTotalsConfig: () => {},
            onUpdateNotes: () => {},
            onUpdateTerms: () => {},
            onUpdateData: () => {},
        }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f8fafc" }}>

                {/* ── Toolbar ── */}
                <header style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 16px",
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    flexShrink: 0,
                    zIndex: 100,
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b", padding: 4 }}
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            border: "none",
                            background: "transparent",
                            color: "#111827",
                            outline: "none",
                            minWidth: 160,
                        }}
                        onBlur={() => {/* could auto-save name */}}
                    />

                    <div style={{ flex: 1 }} />

                    <button onClick={undo} disabled={!canUndo} title="Undo" style={{ background: "none", border: "none", cursor: canUndo ? "pointer" : "default", color: canUndo ? "#374151" : "#d1d5db", padding: 4 }}>
                        <Undo2 size={16} />
                    </button>
                    <button onClick={redo} disabled={!canRedo} title="Redo" style={{ background: "none", border: "none", cursor: canRedo ? "pointer" : "default", color: canRedo ? "#374151" : "#d1d5db", padding: 4 }}>
                        <Redo2 size={16} />
                    </button>

                    <Button
                        variant={previewMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreviewMode((v) => !v)}
                    >
                        <Eye className="size-3.5 mr-1" /> {previewMode ? "Edit" : "Preview"}
                    </Button>

                    <Button size="sm" onClick={handleSave}>
                        <Save className="size-3.5 mr-1" /> Save
                    </Button>
                </header>

                {/* ── Main 3-panel layout ── */}
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                    {/* Left: Widget Palette — hidden in preview mode */}
                    {!previewMode && (
                        <WidgetPalette
                            onAddBodyGrid={() => {
                                const newId = editor.addBodyGrid();
                                setFocusedSection(newId);
                            }}
                        />
                    )}

                    {/* Center: Canvas */}
                    <div
                        style={{ flex: 1, overflow: "auto", padding: "24px 0", background: "#e5e7eb", display: "flex", justifyContent: "center" }}
                        onClick={handleCanvasClick}
                    >
                        <div
                            style={{
                                width: canvasWidth,
                                background: "white",
                                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                                borderRadius: 4,
                                overflow: "hidden",
                                fontFamily: template.theme.fontFamily,
                                color: template.theme.primaryColor,
                            }}
                        >
                            {/* Header */}
                            {template.header.visible && (
                                <div
                                    style={{ borderBottom: "1px solid #e2e8f0", cursor: previewMode ? "default" : "pointer" }}
                                    onClick={(e) => { if (!previewMode) { e.stopPropagation(); setFocusedSection("header"); } }}
                                >
                                    <EditorGrid
                                        section={template.header}
                                        sectionLabel={previewMode ? undefined : "Header"}
                                        doc={dummyDoc}
                                        totals={totals}
                                        editMode={!previewMode}
                                        onDropIntoCell={handleDropIntoCell}

                                        onSettingsClick={() => setFocusedSection("header")}
                                    />
                                </div>
                            )}

                            {/* Body — multiple grids */}
                            <div style={{ minHeight: 200 }}>
                                {template.body.grids.map((grid, idx) => (
                                    <div
                                        key={grid.id}
                                        style={{
                                            cursor: previewMode ? "default" : "pointer",
                                            borderTop: !previewMode && idx > 0 ? "2px dashed #cbd5e1" : undefined,
                                            position: "relative",
                                        }}
                                        onClick={(e) => { if (!previewMode) { e.stopPropagation(); setFocusedSection(grid.id); } }}
                                    >
                                        {/* Per-grid controls — editor only */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                                display: previewMode ? "none" : "flex",
                                                gap: 2,
                                                zIndex: 20,
                                                opacity: focusedSection === grid.id ? 1 : 0,
                                                transition: "opacity 0.15s",
                                            }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                title="Move grid up"
                                                disabled={idx === 0}
                                                onClick={() => editor.moveBodyGrid(grid.id, "up")}
                                                style={iconBtnStyle(idx === 0)}
                                            >
                                                <ChevronUp size={12} />
                                            </button>
                                            <button
                                                title="Move grid down"
                                                disabled={idx === template.body.grids.length - 1}
                                                onClick={() => editor.moveBodyGrid(grid.id, "down")}
                                                style={iconBtnStyle(idx === template.body.grids.length - 1)}
                                            >
                                                <ChevronDown size={12} />
                                            </button>
                                            <button
                                                title="Delete grid"
                                                disabled={template.body.grids.length <= 1}
                                                onClick={() => {
                                                    editor.removeBodyGrid(grid.id);
                                                    // Move focus away if this grid was focused
                                                    if (focusedSection === grid.id) {
                                                        const next = template.body.grids.find(g => g.id !== grid.id);
                                                        setFocusedSection(next?.id ?? "body");
                                                    }
                                                }}
                                                style={iconBtnStyle(template.body.grids.length <= 1, true)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        <EditorGrid
                                            section={grid}
                                            doc={dummyDoc}
                                            totals={totals}
                                            editMode={!previewMode}
                                            onDropIntoCell={handleDropIntoCell}
    
                                            onSettingsClick={() => setFocusedSection(grid.id)}
                                        />
                                    </div>
                                ))}

                                {/* Add Grid button — editor only */}
                                {!previewMode && (
                                    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newGridId = editor.addBodyGrid();
                                                setFocusedSection(newGridId);
                                            }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                fontSize: 12,
                                                color: "#6366f1",
                                                background: "none",
                                                border: "1px dashed #6366f1",
                                                borderRadius: 6,
                                                padding: "4px 12px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Plus size={12} /> Add Body Grid
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {template.footer.visible && (
                                <div
                                    style={{ borderTop: "1px solid #e2e8f0", cursor: previewMode ? "default" : "pointer" }}
                                    onClick={(e) => { if (!previewMode) { e.stopPropagation(); setFocusedSection("footer"); } }}
                                >
                                    <EditorGrid
                                        section={template.footer}
                                        sectionLabel={previewMode ? undefined : "Footer"}
                                        doc={dummyDoc}
                                        totals={totals}
                                        editMode={!previewMode}
                                        onDropIntoCell={handleDropIntoCell}

                                        onSettingsClick={() => setFocusedSection("footer")}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Properties Panel — editor only */}
                    {!previewMode && (
                        <PropertiesPanel
                            template={template}
                            selectedId={selectedId}
                            selectedType={selectedType}
                            focusedSectionId={
                                focusedSection === "header" ? "header"
                                : focusedSection === "footer" ? "footer"
                                : focusedSection  // body grid id
                            }
                            onUpdateGridConfig={editor.updateGridConfig}
                            onUpdateSectionHeight={editor.updateSectionHeight}
                            onUpdateSectionBg={editor.updateSectionBackground}
                            onUpdateWidgetPlacement={(nodeId, p) =>
                                editor.updateWidgetConfig(nodeId, { placement: p })
                            }
                            onDeleteNode={editor.deleteNode}
                            onAddWidget={editor.addWidget}
                        />
                    )}
                </div>
            </div>
        </FillModeProvider>
    );
}

// ── Utility styles ────────────────────────────────────────────────────────────

function iconBtnStyle(disabled: boolean, danger = false): React.CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        padding: 0,
        border: "1px solid",
        borderColor: disabled ? "#e2e8f0" : danger ? "#fca5a5" : "#cbd5e1",
        borderRadius: 4,
        background: disabled ? "#f8fafc" : danger ? "#fef2f2" : "white",
        color: disabled ? "#cbd5e1" : danger ? "#ef4444" : "#374151",
        cursor: disabled ? "default" : "pointer",
    };
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function TemplateEditorPageV2() {
    const { id } = useParams<{ id: string }>();

    return (
        <EditorSelectionProvider>
            <DragProvider>
                <EditorInner templateId={id} />
            </DragProvider>
        </EditorSelectionProvider>
    );
}
