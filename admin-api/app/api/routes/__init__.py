from fastapi import APIRouter

router = APIRouter()

from app.api.routes import (
    auth, orders, invoices, payments, contracts, customers, support, dashboard,
    assets, returns, kyc, partners, customer_auth, customer_support,
    advance_replacements, proforma_invoices, delivery_challans, shipments,
    replacements, security_deposits, credit_notes, insurance,
)

router.include_router(auth.router)
router.include_router(orders.router)
router.include_router(invoices.router)
router.include_router(payments.router)
router.include_router(contracts.router)
router.include_router(customers.router)
router.include_router(support.router)
router.include_router(dashboard.router)
router.include_router(assets.router)
router.include_router(returns.router)
router.include_router(kyc.router)
router.include_router(partners.router)
router.include_router(customer_auth.router)
router.include_router(customer_support.router)
router.include_router(advance_replacements.router)
router.include_router(proforma_invoices.router)
router.include_router(delivery_challans.router)
router.include_router(shipments.router)
router.include_router(replacements.router)
router.include_router(security_deposits.router)
router.include_router(credit_notes.router)
router.include_router(insurance.router)
