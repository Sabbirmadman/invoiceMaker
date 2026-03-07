import type { Template } from "@/types/template";

export const boldHeaderInvoice: Template = {
    id: "tmpl_bold_header_invoice",
    name: "Bold Header Invoice",
    documentType: "invoice",
    pageSize: "A4",
    orientation: "portrait",
    theme: {
        fontFamily: "system-ui, sans-serif",
        primaryColor: "#1a2b5f",
        accentColor: "#3b5bdb",
    },
    header: {
        height: 160,
        visible: true,
        grid: {
            columns: [
                { id: "col_left", width: "50%" },
                { id: "col_right", width: "50%" },
            ],
            rows: [{ id: "row_1", height: "auto" }],
        },
        elements: [
            {
                id: "el_header_bg",
                type: "background",
                zIndex: 1,
                styles: { backgroundColor: "#1a2b5f" },
            },
            {
                id: "el_title",
                type: "textLabel",
                zIndex: 3,
                gridArea: { col: "col_left", row: "row_1" },
                config: { text: "INVOICE" },
                styles: {
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#ffffff",
                    letterSpacing: "3px",
                },
            },
            {
                id: "el_company",
                type: "companyDetails",
                zIndex: 3,
                gridArea: { col: "col_right", row: "row_1" },
                bindings: {
                    name: "{{company.name}}",
                    address: "{{company.address}}",
                    phone: "{{company.phone}}",
                    email: "{{company.email}}",
                    website: "{{company.website}}",
                    taxId: "{{company.taxId}}",
                },
                styles: { color: "#ffffff", textAlign: "right" },
            },
        ],
    },
    body: {
        elements: [
            {
                id: "el_bill_to",
                type: "billTo",
                placement: "first-page",
                zIndex: 3,
                bindings: {
                    name: "{{client.name}}",
                    company: "{{client.company}}",
                    address: "{{client.address}}",
                    city: "{{client.city}}",
                    state: "{{client.state}}",
                    zip: "{{client.zip}}",
                    country: "{{client.country}}",
                    phone: "{{client.phone}}",
                    email: "{{client.email}}",
                },
            },
            {
                id: "el_ship_to",
                type: "shipTo",
                placement: "first-page",
                zIndex: 3,
                bindings: { shippingAddress: "{{client.shippingAddress}}" },
            },
            {
                id: "el_invoice_details",
                type: "invoiceDetails",
                placement: "first-page",
                zIndex: 3,
                bindings: {
                    number: "{{invoice.number}}",
                    date: "{{invoice.date}}",
                    dueDate: "{{invoice.dueDate}}",
                    terms: "{{invoice.terms}}",
                    poNumber: "{{invoice.poNumber}}",
                },
            },
            {
                id: "el_items",
                type: "itemList",
                placement: "all-pages",
                zIndex: 3,
                config: {
                    columns: ["name", "description", "qty", "rate", "amount"],
                    columnHeaderRepeat: true,
                },
                styles: {
                    headerBackground: "#1a2b5f",
                    headerColor: "#ffffff",
                    alternateRowColor: "#f0f4ff",
                },
            },
            {
                id: "el_totals",
                type: "totalsBlock",
                placement: "last-page",
                zIndex: 3,
                config: {
                    show: ["subTotal", "tax1", "total", "balanceDue"],
                },
            },
        ],
    },
    footer: {
        height: 60,
        visible: true,
        grid: {
            columns: [
                { id: "col_left", width: "70%" },
                { id: "col_right", width: "30%" },
            ],
            rows: [{ id: "row_1", height: "auto" }],
        },
        elements: [
            {
                id: "el_footer_bg",
                type: "background",
                zIndex: 1,
                styles: {
                    backgroundColor: "#f0f4ff",
                    borderTop: "3px solid #1a2b5f",
                },
            },
            {
                id: "el_terms",
                type: "termsConditions",
                zIndex: 2,
                gridArea: { col: "col_left", row: "row_1" },
                bindings: { text: "{{document.terms}}" },
            },
            {
                id: "el_page_num",
                type: "pageNumber",
                zIndex: 2,
                gridArea: { col: "col_right", row: "row_1" },
                config: { format: "Page {{page.current}} of {{page.total}}" },
                styles: { textAlign: "right", color: "#1a2b5f" },
            },
        ],
    },
};
