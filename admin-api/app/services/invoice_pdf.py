import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


def generate_invoice_pdf(invoice, media_root=None):
    """Generate a PDF invoice and return the relative URL."""
    if not media_root:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        media_root = os.path.join(base_dir, "media")

    inv_dir = os.path.join(media_root, "invoices")
    os.makedirs(inv_dir, exist_ok=True)

    filename = f"{invoice.invoice_number}.pdf"
    filepath = os.path.join(inv_dir, filename)

    doc = SimpleDocTemplate(filepath, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = []

    # Header
    header_style = ParagraphStyle("Header", parent=styles["Heading1"], fontSize=24, textColor=colors.HexColor("#6d5ed6"))
    elements.append(Paragraph("RENTR", header_style))
    elements.append(Paragraph("Tech Rentals Simplified", styles["Italic"]))
    elements.append(Spacer(1, 10 * mm))

    # Invoice info
    elements.append(Paragraph(f"<b>Invoice:</b> {invoice.invoice_number}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Date:</b> {invoice.created_at.strftime('%d %b %Y') if invoice.created_at else '-'}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Due Date:</b> {invoice.due_date.strftime('%d %b %Y') if invoice.due_date else '-'}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Status:</b> {(invoice.status or '').upper()}", styles["Normal"]))
    elements.append(Spacer(1, 5 * mm))

    # Customer info
    elements.append(Paragraph(f"<b>Bill To:</b>", styles["Heading3"]))
    elements.append(Paragraph(f"{invoice.customer_name}", styles["Normal"]))
    elements.append(Paragraph(f"{invoice.customer_email}", styles["Normal"]))
    elements.append(Spacer(1, 8 * mm))

    # Line items table
    items = invoice.items or []
    if items:
        table_data = [["#", "Description", "Qty", "Unit Price", "Amount"]]
        for i, item in enumerate(items, 1):
            qty = item.get("quantity", item.get("qty", 1))
            unit_price = item.get("unit_price", item.get("rate", 0))
            amount = float(qty) * float(unit_price)
            table_data.append([
                str(i),
                item.get("description", item.get("product_name", "-")),
                str(qty),
                f"Rs.{float(unit_price):,.2f}",
                f"Rs.{amount:,.2f}",
            ])

        t = Table(table_data, colWidths=[30, 220, 50, 80, 80])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6d5ed6")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f8f8")]),
        ]))
        elements.append(t)
    elements.append(Spacer(1, 8 * mm))

    # Totals
    subtotal = float(invoice.subtotal or 0)
    tax = float(invoice.tax or 0)
    discount = float(invoice.discount or 0)
    total = float(invoice.total or 0)

    totals_data = []
    if subtotal:
        totals_data.append(["Subtotal", f"Rs.{subtotal:,.2f}"])
    if tax:
        totals_data.append(["Tax (GST)", f"Rs.{tax:,.2f}"])
    if discount:
        totals_data.append(["Discount", f"-Rs.{discount:,.2f}"])
    totals_data.append(["TOTAL", f"Rs.{total:,.2f}"])

    if totals_data:
        tt = Table(totals_data, colWidths=[380, 80])
        tt.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
            ("FONTNAME", (-2, -1), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (-2, -1), (-1, -1), 12),
            ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#6d5ed6")),
            ("TOPPADDING", (0, -1), (-1, -1), 6),
        ]))
        elements.append(tt)

    elements.append(Spacer(1, 10 * mm))

    # Notes
    if invoice.notes:
        elements.append(Paragraph(f"<b>Notes:</b> {invoice.notes}", styles["Normal"]))
        elements.append(Spacer(1, 5 * mm))

    # Footer
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#dddddd")))
    elements.append(Spacer(1, 3 * mm))
    footer_style = ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.grey)
    elements.append(Paragraph("Rentr - Tech Rentals Simplified | rentr.in | support@rentr.in", footer_style))

    doc.build(elements)
    return f"/media/invoices/{filename}"
