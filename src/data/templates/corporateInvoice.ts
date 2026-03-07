import type { Template } from "@/types/template";

export const corporateInvoice: Template = {
    id: "tmpl_corporate_invoice",
    name: "Corporate Invoice",
    documentType: "invoice",
    pageSize: "A4",
    orientation: "portrait",
    theme: {
        fontFamily: "system-ui, sans-serif",
        primaryColor: "#1e40af",
        accentColor: "#3b82f6",
    },
    header: {
        height: 140,
        visible: true,
        grid: {
            columns: [
                { id: "col_left", width: "55%" },
                { id: "col_right", width: "45%" },
            ],
            rows: [{ id: "row_1", height: "auto" }],
        },
        elements: [
            {
                id: "el_header_bg",
                type: "background",
                zIndex: 1,
                styles: { backgroundColor: "#ffffff" },
            },
            {
                id: "el_company",
                type: "companyDetails",
                zIndex: 3,
                gridArea: { col: "col_left", row: "row_1" },
                bindings: {
                    name: "{{company.name}}",
                    address: "{{company.address}}",
                    phone: "{{company.phone}}",
                    email: "{{company.email}}",
                    website: "{{company.website}}",
                    taxId: "{{company.taxId}}",
                },
            },
            {
                id: "el_title",
                type: "textLabel",
                zIndex: 3,
                gridArea: { col: "col_right", row: "row_1" },
                config: { text: "INVOICE" },
                styles: {
                    fontSize: "32px",
                    fontWeight: "bold",
                    textAlign: "right",
                    color: "#1e40af",
                    letterSpacing: "3px",
                },
            },
        ],
    },
    body: {
        elements: [
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
                id: "el_items",
                type: "itemList",
                placement: "all-pages",
                zIndex: 3,
                config: {
                    columns: [
                        "name",
                        "description",
                        "qty",
                        "rate",
                        "tax",
                        "amount",
                    ],
                    columnHeaderRepeat: true,
                },
                styles: {
                    headerBackground: "#1e40af",
                    headerColor: "#ffffff",
                    alternateRowColor: "#eff6ff",
                },
            },
            {
                id: "el_totals",
                type: "totalsBlock",
                placement: "last-page",
                zIndex: 3,
                config: {
                    show: ["subTotal", "tax1", "tax2", "total", "balanceDue"],
                },
            },
        ],
    },
    footer: {
        height: 80,
        visible: true,
        grid: {
            columns: [
                { id: "col_left", width: "60%" },
                { id: "col_right", width: "40%" },
            ],
            rows: [{ id: "row_1", height: "auto" }],
        },
        elements: [
            {
                id: "el_footer_bg",
                type: "background",
                zIndex: 1,
                styles: {
                    backgroundColor: "#f8faff",
                    borderTop: "2px solid #1e40af",
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
                styles: { textAlign: "right", color: "#1e40af" },
            },
        ],
    },
};
