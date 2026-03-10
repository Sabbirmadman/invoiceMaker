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
    editMode,
}: {
    node: TemplateNode;
    doc: StoredDocument;
    totals: TotalsResult;
    editMode?: boolean;
}) {
    return (
        <WidgetRenderer
            widget={node}
            doc={doc}
            totals={totals}
            editMode={editMode}
        />
    );
}
