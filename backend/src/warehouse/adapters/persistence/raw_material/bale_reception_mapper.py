from collections.abc import Sequence

from warehouse.adapters.persistence.raw_material.bale_reception_record import (
    BaleReceptionRecord,
)
from warehouse.domain.raw_material.bale_id import BaleId
from warehouse.domain.raw_material.bale_reception import BaleReception
from warehouse.domain.raw_material.bale_reception_id import BaleReceptionId
from warehouse.domain.raw_material.reception_datetime import ReceptionDateTime
from warehouse.domain.raw_material.shipment_number import ShipmentNumber


class BaleReceptionMapper:
    @staticmethod
    def to_record(reception: BaleReception) -> BaleReceptionRecord:
        return BaleReceptionRecord(
            id=reception.id.value,
            received_at=reception.received_at.value,
            shipment_number=reception.shipment_number.value,
            provider_name=reception.provider_name,
        )

    @staticmethod
    def to_domain(
        record: BaleReceptionRecord,
        bale_ids: Sequence[BaleId],
    ) -> BaleReception:
        return BaleReception(
            id=BaleReceptionId(record.id),
            received_at=ReceptionDateTime(record.received_at),
            shipment_number=ShipmentNumber(record.shipment_number),
            provider_name=record.provider_name,
            bale_ids=tuple(bale_ids),
        )
