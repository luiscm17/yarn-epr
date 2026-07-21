from collections.abc import Sequence

from warehouse.adapters.persistence.raw_material_reception_record import RawMaterialReceptionRecord
from warehouse.domain.models.raw_material_reception import RawMaterialReception
from warehouse.domain.value_objects.raw_material_bale_id import RawMaterialBaleId
from warehouse.domain.value_objects.raw_material_reception_id import RawMaterialReceptionId
from warehouse.domain.value_objects.reception_datetime import ReceptionDateTime
from warehouse.domain.value_objects.shipment_number import ShipmentNumber


class RawMaterialReceptionMapper:
    @staticmethod
    def to_record(
        reception: RawMaterialReception,
    ) -> RawMaterialReceptionRecord:
        return RawMaterialReceptionRecord(
            id=reception.id.value,
            received_at=reception.received_at.value,
            shipment_number=reception.shipment_number.value,
            provider_name=reception.provider_name,
        )

    @staticmethod
    def to_domain(
        record: RawMaterialReceptionRecord,
        bale_ids: Sequence[RawMaterialBaleId],
    ) -> RawMaterialReception:
        return RawMaterialReception(
            id=RawMaterialReceptionId(record.id),
            received_at=ReceptionDateTime(record.received_at),
            shipment_number=ShipmentNumber(record.shipment_number),
            provider_name=record.provider_name,
            bale_ids=tuple(bale_ids),
        )
