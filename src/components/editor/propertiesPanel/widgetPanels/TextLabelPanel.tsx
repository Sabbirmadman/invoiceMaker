import type { TemplateWidget } from "@/types/templateV2";
import { PanelSection, Row, TextInput, ColorInput, ToggleBtn } from "../shared";

export function TextLabelPanel({
    widget,
    onUpdateConfig,
}: {
    widget: TemplateWidget;
    onUpdateConfig: (
        patch: Partial<Pick<TemplateWidget, "config" | "styles">>,
    ) => void;
}) {
    const styles = (widget.styles ?? {}) as Record<string, string>;
    const config = widget.config ?? {};
    const text = (config.text as string) ?? "";

    function setStyle(key: string, value: string) {
        onUpdateConfig({ styles: { ...styles, [key]: value } });
    }

    const isBold = styles.fontWeight === "bold" || styles.fontWeight === "700";
    const isItalic = styles.fontStyle === "italic";
    const isUnderline = (styles.textDecoration ?? "").includes("underline");
    const align = styles.textAlign ?? "left";

    return (
        <>
            <PanelSection title="Text Content">
                <textarea
                    value={text}
                    onChange={(e) =>
                        onUpdateConfig({
                            config: { ...config, text: e.target.value },
                        })
                    }
                    rows={5}
                    style={{
                        width: "100%",
                        padding: "5px 6px",
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        fontSize: 12,
                        resize: "vertical",
                        fontFamily: "inherit",
                        boxSizing: "border-box" as const,
                        lineHeight: 1.5,
                    }}
                    placeholder="Enter text…"
                />
            </PanelSection>

            <PanelSection title="Format">
                <div
                    style={{
                        display: "flex",
                        gap: 3,
                        marginBottom: 10,
                        flexWrap: "wrap" as const,
                    }}
                >
                    <ToggleBtn
                        active={isBold}
                        onClick={() =>
                            setStyle("fontWeight", isBold ? "normal" : "bold")
                        }
                        title="Bold"
                    >
                        <strong>B</strong>
                    </ToggleBtn>
                    <ToggleBtn
                        active={isItalic}
                        onClick={() =>
                            setStyle(
                                "fontStyle",
                                isItalic ? "normal" : "italic",
                            )
                        }
                        title="Italic"
                    >
                        <em>I</em>
                    </ToggleBtn>
                    <ToggleBtn
                        active={isUnderline}
                        onClick={() =>
                            setStyle(
                                "textDecoration",
                                isUnderline ? "none" : "underline",
                            )
                        }
                        title="Underline"
                    >
                        <span style={{ textDecoration: "underline" }}>U</span>
                    </ToggleBtn>
                    <div
                        style={{
                            width: 1,
                            background: "#e5e7eb",
                            margin: "0 2px",
                        }}
                    />
                    {(["left", "center", "right"] as const).map((a) => (
                        <ToggleBtn
                            key={a}
                            active={align === a}
                            onClick={() => setStyle("textAlign", a)}
                            title={`Align ${a}`}
                        >
                            {a === "left"
                                ? "≡ L"
                                : a === "center"
                                  ? "≡ C"
                                  : "≡ R"}
                        </ToggleBtn>
                    ))}
                </div>

                <Row label="Font Size">
                    <TextInput
                        value={styles.fontSize ?? "14px"}
                        onChange={(v) => setStyle("fontSize", v)}
                        placeholder="14px"
                    />
                </Row>
                <Row label="Font Family">
                    <TextInput
                        value={styles.fontFamily ?? ""}
                        onChange={(v) => setStyle("fontFamily", v)}
                        placeholder="inherit"
                    />
                </Row>
                <Row label="Line Height">
                    <TextInput
                        value={styles.lineHeight ?? "1.5"}
                        onChange={(v) => setStyle("lineHeight", v)}
                        placeholder="1.5"
                    />
                </Row>
                <Row label="Letter Spacing">
                    <TextInput
                        value={styles.letterSpacing ?? "0"}
                        onChange={(v) => setStyle("letterSpacing", v)}
                        placeholder="0px"
                    />
                </Row>
            </PanelSection>

            <PanelSection title="Colors">
                <ColorInput
                    label="Text Color"
                    value={styles.color ?? "#111827"}
                    onChange={(v) => setStyle("color", v)}
                />
                <ColorInput
                    label="Background"
                    value={styles.backgroundColor ?? ""}
                    onChange={(v) => setStyle("backgroundColor", v)}
                />
            </PanelSection>

            <PanelSection title="Spacing">
                <Row label="Padding">
                    <TextInput
                        value={styles.padding ?? "0"}
                        onChange={(v) => setStyle("padding", v)}
                        placeholder="8px or 4px 8px"
                    />
                </Row>
            </PanelSection>
        </>
    );
}
