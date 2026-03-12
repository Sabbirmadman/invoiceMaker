import type { TemplateWidget } from "@/types/templateV2";
import { PanelSection, Row, NumberInput, TextInput, SelectInput, ColorInput } from "../shared";

export function LogoWidgetPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (
        patch: Partial<Pick<TemplateWidget, "config" | "styles">>,
    ) => void;
}) {
    const styles = (widget.styles ?? {}) as Record<string, string>;

    function setStyle(key: string, value: string) {
        onUpdateConfig({ styles: { ...styles, [key]: value } });
    }

    const borderWidthNum = parseInt(styles.borderWidth ?? "0") || 0;
    const borderRadiusNum = parseInt(styles.borderRadius ?? "0") || 0;

    return (
        <>
            <PanelSection title="Image Size">
                <Row label="Width">
                    <TextInput
                        value={styles.width ?? "auto"}
                        onChange={(v) => setStyle("width", v)}
                        placeholder="auto / 80px / 100%"
                    />
                </Row>
                <Row label="Max Height">
                    <TextInput
                        value={styles.maxHeight ?? "80px"}
                        onChange={(v) => setStyle("maxHeight", v)}
                        placeholder="80px"
                    />
                </Row>
                <Row label="Object Fit">
                    <SelectInput
                        value={styles.objectFit ?? "contain"}
                        onChange={(v) => setStyle("objectFit", v)}
                        options={[
                            { label: "Contain", value: "contain" },
                            { label: "Cover", value: "cover" },
                            { label: "Fill", value: "fill" },
                        ]}
                    />
                </Row>
            </PanelSection>

            <PanelSection title="Border">
                <Row label="Width (px)">
                    <NumberInput
                        value={borderWidthNum}
                        onChange={(v) => setStyle("borderWidth", `${v}px`)}
                        min={0}
                        max={20}
                    />
                </Row>
                {borderWidthNum > 0 && (
                    <>
                        <ColorInput
                            label="Color"
                            value={styles.borderColor ?? "#e2e8f0"}
                            onChange={(v) => setStyle("borderColor", v)}
                        />
                        <Row label="Style">
                            <SelectInput
                                value={styles.borderStyle ?? "solid"}
                                onChange={(v) => setStyle("borderStyle", v)}
                                options={[
                                    { label: "Solid", value: "solid" },
                                    { label: "Dashed", value: "dashed" },
                                    { label: "Dotted", value: "dotted" },
                                ]}
                            />
                        </Row>
                    </>
                )}
                <Row label="Radius (px)">
                    <NumberInput
                        value={borderRadiusNum}
                        onChange={(v) => setStyle("borderRadius", `${v}px`)}
                        min={0}
                        max={200}
                    />
                </Row>
            </PanelSection>
        </>
    );
}
