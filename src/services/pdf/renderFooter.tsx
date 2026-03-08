import { Text } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { TemplateElement } from "@/types/template";
import type { StoredDocument } from "@/types/document";

export function renderFooterEl(
    el: TemplateElement,
    doc: StoredDocument,
): ReactNode {
    switch (el.type) {
        case "notes":
            return doc.data.notes ? (
                <Text style={{ fontSize: 8, color: "#666" }}>
                    {doc.data.notes}
                </Text>
            ) : null;
        case "termsConditions":
            return doc.data.terms ? (
                <Text style={{ fontSize: 8, color: "#666" }}>
                    {doc.data.terms}
                </Text>
            ) : null;
        case "pageNumber": {
            const align = (el.styles?.textAlign ?? "right") as
                | "left"
                | "center"
                | "right";
            return (
                <Text
                    style={{
                        fontSize: 8,
                        color: "#aaa",
                        textAlign: align,
                        width: "100%",
                    }}
                    render={({ pageNumber, totalPages }) =>
                        `Page ${pageNumber} of ${totalPages}`
                    }
                />
            );
        }
        case "companyDetails":
            return (
                <Text style={{ fontSize: 8, color: "#666" }}>
                    {doc.data.company.name}
                </Text>
            );
        case "textLabel": {
            const text = (el.config?.text as string) ?? "";
            return <Text style={{ fontSize: 8, color: "#666" }}>{text}</Text>;
        }
        default:
            return null;
    }
}
