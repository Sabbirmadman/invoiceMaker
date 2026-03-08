import type { StoredDocument } from "@/types/document";

/**
 * Builds a complete self-contained HTML string from the rendered canvas pages.
 * Strips the preview zoom transform and inlines all stylesheets from the current page.
 */
export function buildInvoiceHtml(doc: StoredDocument): string | null {
    const pageEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-canvas-page]"),
    );

    if (pageEls.length === 0) return null;

    const pagesHtml = pageEls
        .map((el) => {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.style.transform = "none";
            clone.style.marginBottom = "0";
            return clone.outerHTML;
        })
        .join("\n");

    // Grab all <style> and <link rel="stylesheet"> from the live page head
    const headStyles = Array.from(document.head.children)
        .filter(
            (el) =>
                el.tagName === "STYLE" ||
                (el.tagName === "LINK" &&
                    el.getAttribute("rel") === "stylesheet"),
        )
        .map((el) => el.outerHTML)
        .join("\n");

    const title = doc.data.meta.number || doc.documentType;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${headStyles}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      background: #e5e7eb;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 0;
      gap: 24px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
        gap: 0;
      }
      [data-canvas-page] {
        box-shadow: none !important;
        page-break-after: always;
      }
      [data-canvas-page]:last-child {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

/** Downloads the invoice as a .html file. */
export function downloadHtml(doc: StoredDocument): void {
    const html = buildInvoiceHtml(doc);
    if (!html) {
        console.error("No canvas pages found in DOM");
        return;
    }

    const filename = `${doc.data.meta.number || doc.documentType}-${doc.id.slice(0, 6)}.html`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
