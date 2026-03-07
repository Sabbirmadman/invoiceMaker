import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Pencil, Plus, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
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
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold capitalize">New {docType}</h1>
                            <p className="text-sm text-muted-foreground">Choose a template to get started</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/template-editor`)}>
                        <Plus className="size-4 mr-2" />
                        New Template
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <LayoutTemplate className="size-12 text-muted-foreground/40 mb-4" />
                        <h2 className="text-lg font-semibold mb-1">No templates yet</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Create your first template to start making {docType}s.
                        </p>
                        <Button onClick={() => navigate(`/template-editor`)}>
                            <Plus className="size-4 mr-2" />
                            Create Template
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((t) => (
                            <Card
                                key={t.id}
                                className="cursor-pointer hover:ring-2 hover:ring-primary transition-shadow overflow-hidden relative group"
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
                                <CardHeader className="p-0">
                                    {/* Mini template preview using actual theme colors */}
                                    <div
                                        className="aspect-3/4 flex flex-col overflow-hidden"
                                        style={{ backgroundColor: t.theme.primaryColor }}
                                    >
                                        {/* Header band */}
                                        <div className="px-3 pt-3 pb-2 flex justify-between items-start shrink-0">
                                            <div className="space-y-1">
                                                <div className="h-2 rounded w-10" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
                                                <div className="h-1.5 rounded w-6" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                                            </div>
                                            <div className="space-y-1 items-end flex flex-col">
                                                <div className="h-3 rounded w-12 font-bold" style={{ backgroundColor: t.theme.accentColor }} />
                                                <div className="h-1.5 rounded w-8" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                                                <div className="h-1.5 rounded w-6" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                                            </div>
                                        </div>
                                        {/* Body */}
                                        <div className="flex-1 bg-white mx-1.5 rounded-t px-2 pt-2 space-y-1.5">
                                            <div className="flex gap-4 mb-2">
                                                <div className="space-y-1">
                                                    <div className="h-1 rounded w-8 bg-gray-200" />
                                                    <div className="h-1.5 rounded w-14 bg-gray-300" />
                                                    <div className="h-1 rounded w-10 bg-gray-200" />
                                                </div>
                                            </div>
                                            {/* Table header */}
                                            <div className="h-3 rounded" style={{ backgroundColor: t.theme.primaryColor, opacity: 0.9 }} />
                                            {/* Table rows */}
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-1 items-center" style={{ opacity: 1 - i * 0.15 }}>
                                                    <div className="h-1.5 rounded flex-1 bg-gray-200" />
                                                    <div className="h-1.5 rounded w-6 bg-gray-200" />
                                                    <div className="h-1.5 rounded w-8" style={{ backgroundColor: t.theme.accentColor, opacity: 0.4 }} />
                                                </div>
                                            ))}
                                            {/* Totals */}
                                            <div className="flex justify-end gap-2 mt-1">
                                                <div className="h-2 rounded w-12" style={{ backgroundColor: t.theme.accentColor, opacity: 0.7 }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 pt-3 pb-3">
                                        <div className="font-semibold text-sm">{t.name}</div>
                                        <div className="text-xs text-muted-foreground capitalize mt-0.5">{t.documentType}</div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
