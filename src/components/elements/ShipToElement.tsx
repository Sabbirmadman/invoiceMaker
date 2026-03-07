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

    if (fillMode) {
        return (
            <div
                className="text-sm leading-relaxed"
                style={element.styles as React.CSSProperties}
            >
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
                    Ship To
                </div>
                <InlineField
                    value={client.shippingAddress}
                    onChange={(v) => onUpdateClient({ shippingAddress: v })}
                    placeholder="Enter shipping address"
                    multiline
                />
            </div>
        );
    }

    if (!client.shippingAddress) return null;

    return (
        <div
            className="text-sm leading-relaxed"
            style={element.styles as React.CSSProperties}
        >
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">
                Ship To
            </div>
            <div className="whitespace-pre-line">{client.shippingAddress}</div>
        </div>
    );
}
