import type { Template } from "@/types/template";

export const proformaInvoice: Template = {
    id: "tmpl_proforma_invoice",
    name: "Proforma Invoice",
    documentType: "invoice",
    pageSize: "A4",
    orientation: "portrait",
    theme: {
        fontFamily: "system-ui, sans-serif",
        primaryColor: "#c2410c",
        accentColor: "#f97316",
    },
    header: {
        height: 200,
        visible: true,
        grid: {
            columns: [
                { id: "col_left", width: "40%" },
                { id: "col_right", width: "60%" },
            ],
            rows: [
                { id: "row_1", height: "auto" },
                { id: "row_2", height: "auto" },
            ],
        },
        elements: [
            {
                id: "el_header_bg",
                type: "background",
                zIndex: 1,
                styles: { backgroundColor: "#ffffff" },
            },
            {
                id: "el_logo",
                type: "logo",
                zIndex: 5,
                gridArea: { col: "col_left", row: "row_1" },
                styles: { maxHeight: "80px" },
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
                styles: { marginTop: "90px" },
            },
            {
                id: "el_invoice_details",
                type: "invoiceDetails",
                zIndex: 3,
                gridArea: { col: "col_right", row: "row_1" },
                bindings: {
                    number: "{{invoice.number}}",
                    date: "{{invoice.date}}",
                    dueDate: "{{invoice.dueDate}}",
                    terms: "{{invoice.terms}}",
                    poNumber: "{{invoice.poNumber}}",
                },
                styles: { textAlign: "right" },
            },
            {
                id: "el_title",
                type: "textLabel",
                zIndex: 3,
                gridArea: { col: "col_left", row: "row_2", colSpan: 2 },
                config: { text: "PROFORMA INVOICE" },
                styles: {
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#c2410c",
                    paddingTop: "12px",
                    paddingBottom: "4px",
                    letterSpacing: "1px",
                },
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
                id: "el_items",
                type: "itemList",
                placement: "all-pages",
                zIndex: 3,
                config: {
                    columns: ["name", "description", "qty", "rate", "amount"],
                    columnHeaderRepeat: true,
                },
                styles: {
                    headerBackground: "#c2410c",
                    headerColor: "#ffffff",
                    alternateRowColor: "#fff7ed",
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
        height: 80,
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
                    backgroundColor: "#ffffff",
                    borderTop: "1px solid #fed7aa",
                },
            },
            {
                id: "el_notes",
                type: "notes",
                zIndex: 2,
                gridArea: { col: "col_left", row: "row_1" },
                bindings: { text: "{{document.notes}}" },
            },
            {
                id: "el_terms",
                type: "termsConditions",
                zIndex: 2,
                gridArea: { col: "col_right", row: "row_1" },
                bindings: { text: "{{document.terms}}" },
            },
        ],
    },
};
