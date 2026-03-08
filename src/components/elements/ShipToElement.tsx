import type { TemplateElement } from "@/types/template";
import type { ClientData } from "@/types/document";
import { InlineField } from "@/components/fill-mode/InlineField";
import { useFillMode } from "@/components/fill-mode/FillModeContext";

interface Props {
    element: TemplateElement;
    client: ClientData;
}

export function ShipToElement({ element, client }: Props) {
    const { fillMode, onUpdateClient } = useFillMode();

    const f = (field: string) => {
        const fields = element.config?.fields as string[] | undefined;
        return !fields || fields.includes(field);
    };
    const layout = (element.config?.layout as string | undefined) ?? "vertical";
    const justify = (element.config?.justify as string | undefined) ?? "stretch";
    const outerStyle: React.CSSProperties =
        layout === "horizontal"
            ? { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px 20px", alignItems: "baseline", justifyContent: justify === "stretch" ? "flex-start" : justify }
            : {};

    if (fillMode) {
        return (
            <div
                className="text-sm leading-relaxed"
                style={element.styles as React.CSSProperties}
            >
                {f("label") && (
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
                        Ship To
                    </div>
                )}
                <div style={outerStyle}>
                    {f("address") && (
                        <InlineField
                            value={client.shippingAddress}
                            onChange={(v) => onUpdateClient({ shippingAddress: v })}
                            placeholder="Enter shipping address"
                            multiline
                        />
                    )}
                </div>
            </div>
        );
    }

    if (!client.shippingAddress) return null;

    return (
        <div
            className="text-sm leading-relaxed"
            style={element.styles as React.CSSProperties}
        >
            {f("label") && (
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
                    Ship To
                </div>
            )}
            <div style={outerStyle}>
                {f("address") && <div className="whitespace-pre-line">{client.shippingAddress}</div>}
            </div>
        </div>
    );
}
