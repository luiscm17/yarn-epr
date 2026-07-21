from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infra.persistence.record_registry import RecordRegistry


class RawMaterialReceptionRecord(RecordRegistry):
    __tablename__ = "raw_material_receptions"

    id: Mapped[UUID] = mapped_column(
        primary_key=True
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    shipment_number: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    provider_name: Mapped[str] = mapped_column(
        Text(),
        nullable=False,
    )
