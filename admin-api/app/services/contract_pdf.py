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
    Image as RLImage,
)


TERMS_SECTIONS = [
    (
        "1. Agreement Overview",
        "These Rental Terms & Conditions constitute a legally binding agreement between "
        'the renter ("You") and Rentr ("We", "Us", "Our"). By placing a rental order on '
        "our platform, you acknowledge that you have read, understood, and agree to be "
        "bound by these terms. These terms govern the rental of all IT equipment and "
        "related services offered through the Rentr platform.",
    ),
    (
        "2. Rental Tenure & Pricing",
        "Rental plans are available for tenures ranging from 3 months to 36 months. "
        "Monthly rental charges are determined based on the product category, "
        "configuration, and chosen tenure. Longer tenures offer lower monthly rates. "
        "Rental charges are billed on a monthly basis and are due on the billing date "
        "specified in your rental agreement. Late payments may attract a penalty of up "
        "to 2% per month on the outstanding amount.",
    ),
    (
        "3. Security Deposit",
        "Rentr operates on a zero security deposit model for approved customers. "
        "Approval is subject to successful KYC verification and creditworthiness "
        "assessment. In certain cases, a refundable security deposit may be required "
        "based on the order value or customer profile. Any security deposit collected "
        "will be refunded within 15 business days of the successful return of rented "
        "equipment at the end of the tenure.",
    ),
    (
        "4. Equipment Usage & Care",
        "All rented equipment remains the property of Rentr throughout the rental "
        "tenure. You are responsible for the proper care and maintenance of the "
        "equipment during the rental period. The equipment must be used only for its "
        "intended purpose and in accordance with the manufacturer guidelines. Any "
        "damage caused by misuse, negligence, or unauthorised modifications will be "
        "charged to the renter.",
    ),
    (
        "5. Equipment Return",
        "At the end of the rental tenure, you must return the equipment in the same "
        "condition as received, subject to normal wear and tear. Our logistics team "
        "will coordinate the pickup of equipment from your registered address. Failure "
        "to return the equipment within 7 days of tenure expiry may result in "
        "additional rental charges and penalties. All original accessories, cables, and "
        "packaging must be returned along with the equipment.",
    ),
    (
        "6. Early Termination",
        "You may terminate your rental agreement before the committed tenure by "
        "providing 30 days written notice. Early termination will attract a closure "
        "fee equivalent to the remaining rental for a specified period as outlined in "
        "your rental agreement. The early closure fee varies based on the product, "
        "tenure, and the time elapsed since the start of the rental. Contact our "
        "support team for specific early closure calculations.",
    ),
    (
        "7. Damage & Loss",
        "In the event of equipment damage beyond normal wear and tear, repair or "
        "replacement costs will be borne by the renter. In case of theft or total loss "
        "of equipment, the renter is liable to pay the current market value of the "
        "equipment or the amount specified in the rental agreement, whichever is lower. "
        "We strongly recommend obtaining appropriate insurance coverage for all rented "
        "equipment.",
    ),
    (
        "8. Dispute Resolution",
        "Any disputes arising out of or in connection with this rental agreement shall "
        "be resolved through mutual discussion and negotiation. If a resolution cannot "
        "be reached amicably, the dispute shall be referred to arbitration in "
        "accordance with the Arbitration and Conciliation Act, 1996. The arbitration "
        "shall be conducted in Mumbai, and the decision of the arbitrator shall be "
        "final and binding on both parties.",
    ),
]


def _fmt_inr(amount):
    """Format number as Indian Rupee string."""
    return f"\u20b9{amount:,.2f}"


def _get_address_str(address):
    """Format address dict into a readable string."""
    if not address:
        return "N/A"
    parts = []
    name = " ".join(
        filter(None, [address.get("firstName", ""), address.get("lastName", "")])
    )
    if name.strip():
        parts.append(name.strip())
    for key in [
        "address1",
        "streetAddress1",
        "address2",
        "streetAddress2",
    ]:
        val = address.get(key)
        if val:
            parts.append(val)
            break
    city_state = ", ".join(
        filter(
            None,
            [
                address.get("townCity") or address.get("city", ""),
                address.get("state") or address.get("countryArea", ""),
            ],
        )
    )
    if city_state:
        parts.append(city_state)
    pin = address.get("pinCode") or address.get("postalCode", "")
    if pin:
        parts.append(str(pin))
    return ", ".join(parts) if parts else "N/A"


def generate_contract_pdf(contract, order, media_root: str = "media") -> str:
    """Generate a rental agreement PDF and return the relative URL path."""

    contracts_dir = os.path.join(media_root, "contracts")
    os.makedirs(contracts_dir, exist_ok=True)

    filename = f"{contract.contract_number}.pdf"
    filepath = os.path.join(contracts_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            "DocTitle",
            parent=styles["Title"],
            fontSize=18,
            spaceAfter=4,
            textColor=colors.HexColor("#1a1a2e"),
        )
    )
    styles.add(
        ParagraphStyle(
            "SectionHead",
            parent=styles["Heading2"],
            fontSize=11,
            spaceBefore=14,
            spaceAfter=4,
            textColor=colors.HexColor("#1a1a2e"),
        )
    )
    styles.add(
        ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            "SmallGray",
            parent=styles["Normal"],
            fontSize=8,
            textColor=colors.gray,
        )
    )

    elements = []

    # ── Header ──────────────────────────────────────────────────────────
    elements.append(Paragraph("RENTR RENTAL AGREEMENT", styles["DocTitle"]))
    elements.append(
        Paragraph(
            f"Contract No: <b>{contract.contract_number}</b>",
            styles["SmallGray"],
        )
    )
    elements.append(
        Paragraph(
            f"Date: {datetime.utcnow().strftime('%d %B %Y')}",
            styles["SmallGray"],
        )
    )
    elements.append(Spacer(1, 6))
    elements.append(
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e0e0e0"))
    )
    elements.append(Spacer(1, 10))

    # ── Parties ─────────────────────────────────────────────────────────
    elements.append(Paragraph("PARTIES", styles["SectionHead"]))
    elements.append(
        Paragraph(
            "<b>Lessor:</b> Rentr (IT Equipment Rental Platform)",
            styles["Body"],
        )
    )
    elements.append(
        Paragraph(
            f"<b>Lessee:</b> {order.customer_name} ({order.customer_email})",
            styles["Body"],
        )
    )
    shipping_str = _get_address_str(order.shipping_address)
    elements.append(
        Paragraph(f"<b>Address:</b> {shipping_str}", styles["Body"])
    )
    elements.append(Spacer(1, 6))

    # ── Rental Details ──────────────────────────────────────────────────
    elements.append(Paragraph("RENTAL DETAILS", styles["SectionHead"]))

    detail_data = [
        ["Order Number", order.order_number],
        ["Rental Tenure", f"{order.rental_months} months"],
        [
            "Start Date",
            contract.start_date.strftime("%d %B %Y") if contract.start_date else "-",
        ],
        [
            "End Date",
            contract.end_date.strftime("%d %B %Y") if contract.end_date else "-",
        ],
        ["Monthly Rent", _fmt_inr(order.total_monthly)],
        [
            "Total Contract Value",
            _fmt_inr(order.total_monthly * order.rental_months),
        ],
    ]
    detail_table = Table(detail_data, colWidths=[140, 300])
    detail_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.gray),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    elements.append(detail_table)
    elements.append(Spacer(1, 8))

    # ── Equipment Table ─────────────────────────────────────────────────
    elements.append(Paragraph("EQUIPMENT", styles["SectionHead"]))

    items = order.items or []
    table_data = [["#", "Product", "Qty", "Price/mo", "Subtotal/mo"]]
    for i, item in enumerate(items, 1):
        name = item.get("product_name") or item.get("description", "Product")
        qty = item.get("quantity", 1)
        price = item.get("price_per_month") or item.get("unit_price", 0)
        table_data.append(
            [str(i), name, str(qty), _fmt_inr(price), _fmt_inr(price * qty)]
        )
    table_data.append(["", "", "", "Total", _fmt_inr(order.total_monthly)])

    eq_table = Table(table_data, colWidths=[30, 220, 40, 80, 80])
    eq_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f5f5f5")),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.gray),
                ("LINEABOVE", (0, -1), (-1, -1), 0.5, colors.gray),
                ("FONTNAME", (3, -1), (-1, -1), "Helvetica-Bold"),
                ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    elements.append(eq_table)
    elements.append(Spacer(1, 10))

    # ── Terms & Conditions ──────────────────────────────────────────────
    elements.append(Paragraph("TERMS & CONDITIONS", styles["SectionHead"]))
    elements.append(
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e0e0e0"))
    )
    elements.append(Spacer(1, 4))

    # Use custom terms if set as JSON, otherwise fall back to defaults
    import json
    terms_to_use = TERMS_SECTIONS
    if contract.terms:
        try:
            parsed = json.loads(contract.terms)
            if isinstance(parsed, list) and len(parsed) > 0:
                terms_to_use = [(s["title"], s["content"]) for s in parsed]
        except (json.JSONDecodeError, KeyError, TypeError):
            pass  # fall back to defaults

    for title, content in terms_to_use:
        elements.append(Paragraph(f"<b>{title}</b>", styles["Body"]))
        elements.append(Paragraph(content, styles["Body"]))

    elements.append(Spacer(1, 14))

    # ── Auto-Signature ──────────────────────────────────────────────────
    elements.append(
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1a1a2e"))
    )
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("AGREEMENT ACCEPTANCE", styles["SectionHead"]))

    # Resolve signature image if available
    sig_image_path = None
    if getattr(contract, "signature_url", None):
        resolved = os.path.join(media_root, contract.signature_url.lstrip("/media/"))
        if os.path.exists(resolved):
            sig_image_path = resolved

    if sig_image_path and contract.signed_at:
        signed_at_str = contract.signed_at.strftime("%d %B %Y at %I:%M %p")
        elements.append(
            Paragraph(
                f"This agreement has been digitally signed by "
                f"<b>{order.customer_name}</b> on <b>{signed_at_str}</b>.",
                styles["Body"],
            )
        )
    else:
        elements.append(
            Paragraph(
                "This agreement is pending signature by the lessee. "
                "By signing, the lessee confirms acceptance of all terms "
                "and conditions outlined in this agreement.",
                styles["Body"],
            )
        )
    elements.append(Spacer(1, 20))

    # Signature lines
    if sig_image_path:
        sig_img = RLImage(sig_image_path, width=150, height=60)
        sig_data = [
            ["For Rentr", "For the Lessee"],
            ["", sig_img],
            ["________________________", ""],
            ["Authorised Signatory", order.customer_name],
        ]
    else:
        sig_data = [
            ["For Rentr", "For the Lessee"],
            ["", ""],
            ["________________________", "________________________"],
            ["Authorised Signatory", order.customer_name],
        ]
    sig_table = Table(sig_data, colWidths=[220, 220])
    sig_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ]
        )
    )
    elements.append(sig_table)

    # ── Footer ──────────────────────────────────────────────────────────
    elements.append(Spacer(1, 16))
    elements.append(
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e0e0e0"))
    )
    elements.append(
        Paragraph(
            f"Generated on {datetime.utcnow().strftime('%d %B %Y')} | "
            f"{contract.contract_number} | Rentr IT Equipment Rentals",
            styles["SmallGray"],
        )
    )

    doc.build(elements)
    return f"/media/contracts/{filename}"
