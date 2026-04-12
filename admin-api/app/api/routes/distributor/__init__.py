from fastapi import APIRouter

router = APIRouter(prefix="/distributor", tags=["distributor"])

from app.api.routes.distributor import (
    auth, customers, orders, contracts, invoices, payments, kyc, dashboard,
)

router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(customers.router)
router.include_router(orders.router)
router.include_router(contracts.router)
router.include_router(invoices.router)
router.include_router(payments.router)
router.include_router(kyc.router)
