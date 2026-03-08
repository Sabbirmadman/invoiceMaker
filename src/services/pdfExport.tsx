import type { StoredDocument } from "@/types/document";
import { buildInvoiceHtml } from "./htmlExport";

/**
 * Opens the invoice HTML in a hidden iframe and triggers the browser's
 * native print dialog. The user can then save as PDF from there.
 * This avoids html2canvas entirely so modern CSS (oklch, etc.) works perfectly.
 */
export function downloadPdf(doc: StoredDocument): void {
    const html = buildInvoiceHtml(doc);
    if (!html) {
        console.error("No canvas pages found in DOM");
        return;
    }

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;visibility:hidden;";
    iframe.src = url;
    document.body.appendChild(iframe);

    // Wait for all resources (fonts, stylesheets) to load before printing
    iframe.onload = () => {
        iframe.contentWindow!.focus();
        iframe.contentWindow!.print();
        // Remove iframe and revoke URL after print dialog closes
        setTimeout(() => {
            iframe.remove();
            URL.revokeObjectURL(url);
        }, 1000);
    };
}
