

export function PanelSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: 12,
                marginBottom: 12,
            }}
        >
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                }}
            >
                {title}
            </div>
            {children}
        </div>
    );
}

export function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
            }}
        >
            <label
                style={{
                    fontSize: 11,
                    color: "#6b7280",
                    minWidth: 76,
                    flexShrink: 0,
                }}
            >
                {label}
            </label>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
}

export function NumberInput({
    value,
    onChange,
    min = 0,
    max = 1000,
    step = 1,
}: {
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
                width: "100%",
                padding: "3px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
            }}
        />
    );
}

export function TextInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: "100%",
                padding: "3px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
                boxSizing: "border-box",
            }}
        />
    );
}

export function SelectInput({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: Array<{ label: string; value: string }>;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: "100%",
                padding: "3px 6px",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                fontSize: 12,
                background: "white",
            }}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

export function ColorInput({
    value,
    onChange,
    label,
}: {
    value: string;
    onChange: (v: string) => void;
    label: string;
}) {
    return (
        <Row label={label}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                    type="color"
                    value={value || "#ffffff"}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: 28,
                        height: 28,
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        cursor: "pointer",
                        padding: 2,
                    }}
                />
                <TextInput
                    value={value}
                    onChange={onChange}
                    placeholder="#ffffff"
                />
            </div>
        </Row>
    );
}

export function FourSideInput({
    values,
    onChange,
    title,
}: {
    values: { top: number; right: number; bottom: number; left: number };
    onChange: (v: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }) => void;
    title: string;
}) {
    return (
        <PanelSection title={title}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                }}
            >
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side}>
                        <div
                            style={{
                                fontSize: 10,
                                color: "#94a3b8",
                                marginBottom: 2,
                                textTransform: "capitalize",
                            }}
                        >
                            {side}
                        </div>
                        <NumberInput
                            value={values[side]}
                            onChange={(v) => onChange({ ...values, [side]: v })}
                            min={0}
                            max={200}
                        />
                    </div>
                ))}
            </div>
        </PanelSection>
    );
}

export function ToggleBtn({
    active,
    onClick,
    title,
    children,
}: {
    active: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                padding: "3px 8px",
                border: `1px solid ${active ? "#6366f1" : "#d1d5db"}`,
                borderRadius: 4,
                background: active ? "#ede9fe" : "white",
                cursor: "pointer",
                fontSize: 13,
                color: active ? "#6366f1" : "#374151",
                minWidth: 28,
                textAlign: "center" as const,
            }}
        >
            {children}
        </button>
    );
}

export function TabBtn({
    active,
    onClick,
    label,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: "7px 0",
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? "#6366f1" : "#64748b",
                background: active ? "#f5f3ff" : "transparent",
                border: "none",
                borderBottom: active
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
                cursor: "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                transition: "all 0.1s",
            }}
        >
            {label}
        </button>
    );
}
