import { useRef } from "react";
import type { KeyboardEvent } from "react";

interface InlineFieldProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
}

/**
 * A transparent inline input that looks like rendered text until focused.
 * Used for click-to-edit fields in Fill mode.
 *
 * height: 1lh makes the input exactly one line tall (matching the surrounding
 * text line-height) so fill-mode and preview layouts are pixel-identical.
 * font: inherit prevents browsers from applying a smaller/different font to inputs.
 */
export function InlineField({
    value,
    onChange,
    placeholder = "Click to edit",
    multiline = false,
    className = "",
}: InlineFieldProps) {
    const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

    function handleKeyDown(e: KeyboardEvent) {
        if (!multiline && e.key === "Enter") {
            e.preventDefault();
            ref.current?.blur();
        }
        if (e.key === "Escape") {
            ref.current?.blur();
        }
    }

    if (multiline) {
        return (
            <textarea
                ref={ref as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={3}
                className={`w-full min-w-0 bg-transparent outline-1 outline-transparent hover:outline-blue-300 focus:outline-blue-500 leading-[inherit] resize-none transition-colors overflow-y-auto p-0 m-0 border-0 ${className}`}
                style={{ font: 'inherit' }}
            />
        );
    }

    return (
        <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`block w-full min-w-0 bg-transparent outline-1 outline-transparent hover:outline-blue-300 focus:outline-blue-500 leading-[inherit] transition-colors overflow-hidden text-ellipsis p-0 m-0 border-0 ${className}`}
            style={{ height: '1lh', font: 'inherit' }}
        />
    );
}
