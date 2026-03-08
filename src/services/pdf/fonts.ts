import { Font } from "@react-pdf/renderer";

const SYSTEM_FONT_FALLBACK = "Helvetica";
const SYSTEM_BOLD_FALLBACK = "Helvetica-Bold";

const GOOGLE_FONT_MAP: Record<string, string> = {
    inter: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
    roboto: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff",
    lato: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff",
    poppins: "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrFJA.woff",
    "open sans":
        "https://fonts.gstatic.com/s/opensans/v35/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiH0C4n.woff",
};

const registeredFonts = new Set<string>();

export function resolvePdfFont(fontFamily: string): string {
    const lower = fontFamily
        .toLowerCase()
        .split(",")[0]
        .trim()
        .replace(/['"]/g, "");
    if (["system-ui", "sans-serif", "arial", "helvetica"].includes(lower)) {
        return SYSTEM_FONT_FALLBACK;
    }
    if (GOOGLE_FONT_MAP[lower]) {
        if (!registeredFonts.has(lower)) {
            Font.register({ family: lower, src: GOOGLE_FONT_MAP[lower] });
            registeredFonts.add(lower);
        }
        return lower;
    }
    return SYSTEM_FONT_FALLBACK;
}

export function boldFont(base: string): string {
    return base === SYSTEM_FONT_FALLBACK ? SYSTEM_BOLD_FALLBACK : base;
}
