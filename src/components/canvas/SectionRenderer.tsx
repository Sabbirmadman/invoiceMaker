import { useRef } from "react";
import type { Section, BodySection, TemplateElement } from "@/types/template";
import type { StoredDocument, TotalsResult, LineItem } from "@/types/document";
import { GridLayout, GridCell } from "./GridLayout";
import { ElementBoundingBox } from "./ElementBoundingBox";
import { useFillMode } from "@/components/fill-mode/FillModeContext";
import { LogoElement } from "@/components/elements/LogoElement";
import { CompanyDetailsElement } from "@/components/elements/CompanyDetailsElement";
import { BillToElement } from "@/components/elements/BillToElement";
import { ShipToElement } from "@/components/elements/ShipToElement";
import { InvoiceDetailsElement } from "@/components/elements/InvoiceDetailsElement";
import { EstimateDetailsElement } from "@/components/elements/EstimateDetailsElement";
import { ReceiptDetailsElement } from "@/components/elements/ReceiptDetailsElement";
import { ItemListElement } from "@/components/elements/ItemListElement";
import { TotalsBlockElement } from "@/components/elements/TotalsBlockElement";
import { NotesElement } from "@/components/elements/NotesElement";
import { TermsElement } from "@/components/elements/TermsElement";
import { PageNumberElement } from "@/components/elements/PageNumberElement";
import { WatermarkElement } from "@/components/elements/WatermarkElement";
import { DividerElement } from "@/components/elements/DividerElement";
import { TextLabelElement } from "@/components/elements/TextLabelElement";

// Colors per section type
const SECTION_COLORS = {
    header: "#3b82f6", // blue
    body: "#22c55e", // green
    footer: "#f97316", // orange
} as const;

type SectionType = keyof typeof SECTION_COLORS;

// Wrapper that attaches a ref and renders the bounding box overlay
function BoundedCell({
    children,
    sectionType,
    showBounds,
    className,
    style,
}: {
    children: React.ReactNode;
    sectionType: SectionType;
    showBounds: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div ref={ref} className={className} style={style}>
            {children}
            {showBounds && (
                <ElementBoundingBox
                    elementRef={ref}
                    color={SECTION_COLORS[sectionType]}
                />
            )}
        </div>
    );
}

interface SectionRendererProps {
    section: Section;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
    sectionType?: SectionType;
}

export function SectionRenderer({
    section,
    doc,
    totals,
    currentPage,
    totalPages,
    sectionType = "header",
}: SectionRendererProps) {
    const { showBounds } = useFillMode();
    const sorted = [...section.elements].sort((a, b) => a.zIndex - b.zIndex);

    return (
        <div
            className="relative"
            style={{ height: section.height, width: "100%" }}
        >
            <GridLayout grid={section.grid}>
                {sorted.map((el) => {
                    if (el.type === "background") {
                        return (
                            <div
                                key={el.id}
                                className="absolute inset-0"
                                style={
                                    {
                                        ...el.styles,
                                        zIndex: el.zIndex,
                                    } as React.CSSProperties
                                }
                            />
                        );
                    }

                    if (el.type === "watermark") {
                        return <WatermarkElement key={el.id} element={el} />;
                    }

                    if (!el.gridArea) return null;

                    return (
                        <GridCell
                            key={el.id}
                            gridArea={el.gridArea}
                            grid={section.grid}
                        >
                            <BoundedCell
                                sectionType={sectionType}
                                showBounds={showBounds}
                                className={`p-3 ${el.type === "logo" ? "" : "h-full"}`}
                                style={
                                    {
                                        zIndex: el.zIndex,
                                        position: "relative",
                                        ...(el.styles?.textAlign
                                            ? {
                                                  textAlign: el.styles
                                                      .textAlign as React.CSSProperties["textAlign"],
                                              }
                                            : {}),
                                    } as React.CSSProperties
                                }
                            >
                                {renderElement(
                                    el,
                                    doc,
                                    totals,
                                    currentPage,
                                    totalPages,
                                )}
                            </BoundedCell>
                        </GridCell>
                    );
                })}
            </GridLayout>
        </div>
    );
}

interface BodySectionRendererProps {
    section: BodySection;
    doc: StoredDocument;
    totals: TotalsResult;
    currentPage: number;
    totalPages: number;
    showTotals?: boolean;
    showColumnHeader?: boolean;
    isFirstPage?: boolean;
    itemOffset?: number;
    isLastPage?: boolean;
    allItems?: LineItem[];
    postTableStartIndex?: number; // first post-table element to render on this page
    postTableEndIndex?: number; // exclusive end; undefined = render all
}

// Placement helpers — use the element's explicit placement field.
// Fallback to 'last-page' for elements without placement (safe default).
function isPreTable(el: TemplateElement): boolean {
    const p = el.placement ?? "last-page";
    return p === "first-page" || p === "all-pages";
}

export function BodySectionRenderer({
    section,
    doc,
    totals,
    currentPage,
    totalPages,
    showTotals = true,
    showColumnHeader = true,
    isFirstPage = true,
    itemOffset = 0,
    isLastPage = true,
    allItems,
    postTableStartIndex = 0,
    postTableEndIndex,
}: BodySectionRendererProps) {
    const { showBounds } = useFillMode();
    const sorted = [...section.elements].sort((a, b) => a.zIndex - b.zIndex);

    // Build the ordered list of post-table elements (last-page placement)
    const postTableElements = sorted.filter(
        (el) => el.type !== "watermark" && !isPreTable(el),
    );
    // Slice to only the elements assigned to this page
    const visiblePostElements =
        postTableEndIndex !== undefined
            ? postTableElements.slice(postTableStartIndex, postTableEndIndex)
            : postTableElements.slice(postTableStartIndex);

    return (
        <div className="relative flex flex-col p-4 overflow-hidden">
            {/* Watermarks — absolute-positioned, render on every page */}
            {sorted
                .filter((el) => el.type === "watermark")
                .map((el) => (
                    <WatermarkElement key={el.id} element={el} />
                ))}

            {/* Pre-table group: first-page and all-pages elements */}
            <div className="flex flex-col gap-4">
                {sorted.map((el) => {
                    if (el.type === "watermark") return null;
                    if (!isPreTable(el)) return null;
                    // first-page elements only on page 1; all-pages (itemList) allowed through
                    if (
                        (el.placement ?? "last-page") === "first-page" &&
                        !isFirstPage
                    )
                        return null;
                    if (
                        el.placement === "all-pages" &&
                        doc.data.items.length === 0 &&
                        !isFirstPage
                    )
                        return null;
                    return (
                        <BoundedCell
                            key={el.id}
                            sectionType="body"
                            showBounds={showBounds}
                            style={{ zIndex: el.zIndex, position: "relative" }}
                        >
                            {renderElement(
                                el,
                                doc,
                                totals,
                                currentPage,
                                totalPages,
                                showColumnHeader,
                                itemOffset,
                                isLastPage,
                                allItems,
                            )}
                        </BoundedCell>
                    );
                })}
            </div>

            {/* Post-table group: only the elements assigned to this page slice */}
            {showTotals && visiblePostElements.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                    {visiblePostElements.map((el) => (
                        <BoundedCell
                            key={el.id}
                            sectionType="body"
                            showBounds={showBounds}
                            style={{ zIndex: el.zIndex, position: "relative" }}
                        >
                            {renderElement(
                                el,
                                doc,
                                totals,
                                currentPage,
                                totalPages,
                                showColumnHeader,
                                itemOffset,
                                isLastPage,
                                allItems,
                            )}
                        </BoundedCell>
                    ))}
                </div>
            )}
        </div>
    );
}

function renderElement(
    el: TemplateElement,
    doc: StoredDocument,
    totals: TotalsResult,
    currentPage: number,
    totalPages: number,
    showColumnHeader = true,
    itemOffset = 0,
    isLastPage = true,
    allItems?: LineItem[],
): React.ReactNode {
    const { data } = doc;
    const meta = data.meta;

    switch (el.type) {
        case "logo":
            return <LogoElement element={el} company={data.company} />;

        case "companyDetails":
            return (
                <CompanyDetailsElement element={el} company={data.company} />
            );

        case "billTo":
            return <BillToElement element={el} client={data.client} />;

        case "shipTo":
            return <ShipToElement element={el} client={data.client} />;

        case "invoiceDetails":
            if (meta.type !== "invoice") return null;
            return <InvoiceDetailsElement element={el} meta={meta} />;

        case "estimateDetails":
            if (meta.type !== "estimate") return null;
            return <EstimateDetailsElement element={el} meta={meta} />;

        case "receiptDetails":
            if (meta.type !== "receipt") return null;
            return <ReceiptDetailsElement element={el} meta={meta} />;

        case "itemList":
            return (
                <ItemListElement
                    element={el}
                    items={data.items}
                    allItems={allItems}
                    currency={data.totalsConfig.currency}
                    showHeader={showColumnHeader}
                    itemOffset={itemOffset}
                    isLastPage={isLastPage}
                />
            );

        case "totalsBlock":
            return (
                <TotalsBlockElement
                    element={el}
                    totals={totals}
                    config={data.totalsConfig}
                />
            );

        case "notes":
            return <NotesElement element={el} notes={data.notes} />;

        case "termsConditions":
            return <TermsElement element={el} terms={data.terms} />;

        case "pageNumber":
            return (
                <PageNumberElement
                    element={el}
                    current={currentPage}
                    total={totalPages}
                />
            );

        case "divider":
            return <DividerElement element={el} />;

        case "textLabel":
            return <TextLabelElement element={el} />;

        default:
            return null;
    }
}
