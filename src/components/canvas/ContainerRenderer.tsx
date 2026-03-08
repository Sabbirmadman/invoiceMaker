/**
 * NodeRenderer
 *
 * Renders any TemplateNode (currently only widgets).
 */
import type { TemplateNode } from "@/types/templateV2";
import type { StoredDocument, TotalsResult } from "@/types/document";
import { WidgetRenderer } from "./WidgetRenderer";

/** Renders any TemplateNode */
export function NodeRenderer({
    node,
    doc,
    totals,
    currentPage,
    totalPages,
    editMode,
}: {
    node: TemplateNode;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage?: number;
    totalPages?: number;
    editMode?: boolean;
}) {
    return (
        <WidgetRenderer
            widget={node}
            doc={doc}
            totals={totals}
            currentPage={currentPage}
            totalPages={totalPages}
            editMode={editMode}
        />
    );
}
