import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Pencil, Plus, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/hooks/useAppDispatch";
import { createDocument } from "@/store/slices/documentsSlice";
import { deleteCustomTemplate } from "@/store/slices/templatesSlice";
import { selectAllTemplates } from "@/store";
import type { DocumentType } from "@/types/common";

export default function NewDocumentPage() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const allTemplates = useAppSelector(selectAllTemplates);

    const docType = type as DocumentType;
    const templates = allTemplates.filter((t) => t.documentType === docType);

    function handlePick(templateId: string) {
        const template = allTemplates.find((t) => t.id === templateId);
        if (!template) return;
        const newId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        dispatch(createDocument({ template, type: docType, id: newId }));
        navigate(`/document/${newId}`);
    }

    function handleDelete(e: React.MouseEvent, templateId: string) {
        e.stopPropagation();
        dispatch(deleteCustomTemplate(templateId));
    }

    function handleEdit(e: React.MouseEvent, templateId: string) {
        e.stopPropagation();
        navigate(`/template-editor/${templateId}`);
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <span className="text-sm font-semibold capitalize">New {docType}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/template-editor`)}>
                        <Plus className="size-4 mr-1.5" />
                        New Template
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-6">
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <LayoutTemplate className="size-10 text-muted-foreground/30 mb-4" />
                        <p className="text-sm font-medium mb-1">No templates yet</p>
                        <p className="text-sm text-muted-foreground mb-5">
                            Create a template to start making {docType}s.
                        </p>
                        <Button size="sm" onClick={() => navigate(`/template-editor`)}>
                            <Plus className="size-4 mr-1.5" />
                            Create Template
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {templates.map((t) => (
                            <div
                                key={t.id}
                                className="border bg-card cursor-pointer hover:border-foreground/30 transition-colors overflow-hidden relative group rounded-md"
                                onClick={() => handlePick(t.id)}
                            >
                                {/* Template action buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="size-7"
                                        onClick={(e) => handleEdit(e, t.id)}
                                    >
                                        <Pencil className="size-3" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="size-7"
                                        onClick={(e) => handleDelete(e, t.id)}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>

                                {/* Mini template preview */}
                                <div
                                    className="aspect-3/4 flex flex-col overflow-hidden"
                                    style={{ backgroundColor: t.theme.primaryColor }}
                                >
                                    <div className="px-3 pt-3 pb-2 flex justify-between items-start shrink-0">
                                        <div className="space-y-1">
                                            <div className="h-2 w-10" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
                                            <div className="h-1.5 w-6" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                                        </div>
                                        <div className="space-y-1 items-end flex flex-col">
                                            <div className="h-3 w-12" style={{ backgroundColor: t.theme.accentColor }} />
                                            <div className="h-1.5 w-8" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                                            <div className="h-1.5 w-6" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white mx-1.5 px-2 pt-2 space-y-1.5">
                                        <div className="space-y-1 mb-2">
                                            <div className="h-1 w-8 bg-gray-200" />
                                            <div className="h-1.5 w-14 bg-gray-300" />
                                            <div className="h-1 w-10 bg-gray-200" />
                                        </div>
                                        <div className="h-3" style={{ backgroundColor: t.theme.primaryColor, opacity: 0.9 }} />
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-1 items-center" style={{ opacity: 1 - i * 0.15 }}>
                                                <div className="h-1.5 flex-1 bg-gray-200" />
                                                <div className="h-1.5 w-6 bg-gray-200" />
                                                <div className="h-1.5 w-8" style={{ backgroundColor: t.theme.accentColor, opacity: 0.4 }} />
                                            </div>
                                        ))}
                                        <div className="flex justify-end mt-1">
                                            <div className="h-2 w-12" style={{ backgroundColor: t.theme.accentColor, opacity: 0.7 }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-3 pt-2.5 pb-3">
                                    <div className="font-medium text-sm">{t.name}</div>
                                    <div className="text-xs text-muted-foreground capitalize mt-0.5">{t.documentType}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
