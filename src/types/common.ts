export type DocumentType = "invoice" | "estimate" | "receipt";
export type PageSize = "A4" | "A5" | "Letter";
export type Orientation = "portrait" | "landscape";

export const PAGE_DIMENSIONS = {
    A4: { width: 794, height: 1123 }, // px at 96dpi
    A5: { width: 559, height: 794 }, // px at 96dpi
    Letter: { width: 816, height: 1056 },
} as const;
