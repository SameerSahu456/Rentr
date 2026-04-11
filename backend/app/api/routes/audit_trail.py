from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import AuditTrail

router = APIRouter(prefix="/audit-trail", tags=["Audit Trail"])


@router.get("/")
def list_audit_entries(
    entity_type: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AuditTrail)
    if entity_type:
        query = query.filter(AuditTrail.entity_type == entity_type)
    if search:
        query = query.filter(
            or_(
                AuditTrail.entity_type.ilike(f"%{search}%"),
                AuditTrail.user_email.ilike(f"%{search}%"),
                AuditTrail.request_id.ilike(f"%{search}%"),
            )
        )
    entries = query.order_by(AuditTrail.timestamp.desc()).all()
    return {
        "items": [
            {
                "id": e.id,
                "entity_type": e.entity_type,
                "entity_id": e.entity_id,
                "action": e.action.value if e.action else None,
                "user_email": e.user_email,
                "changes": e.changes or {},
                "ip_address": e.ip_address,
                "user_agent": e.user_agent,
                "request_id": e.request_id,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            }
            for e in entries
        ]
    }
