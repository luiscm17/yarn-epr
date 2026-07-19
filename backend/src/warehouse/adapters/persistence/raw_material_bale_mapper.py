from warehouse.adapters.persistence.raw_material_bale_record import RawMaterialBaleRecord

from warehouse.domain.enums.bale_status import BaleStatus
from warehouse.domain.models.raw_material_bale import RawMaterialBale
from warehouse.domain.value_objects.bale_number import BaleNumber
from warehouse.domain.value_objects.bale_weight import BaleWeight
from warehouse.domain.value_objects.dtex import Dtex
from warehouse.domain.value_objects.material_type import MaterialType
from warehouse.domain.value_objects.raw_material_bale_id import RawMaterialBaleId
from warehouse.domain.value_objects.raw_material_reception_id import RawMaterialReceptionId


class RawMaterialBaleMapper:
    @staticmethod
    def to_record(
        bale:RawMaterialBale,
    ) -> RawMaterialBaleRecord:
        return RawMaterialBaleRecord(
            id=bale.id.value,
            reception_id=bale.reception_id.value,
            bale_number=bale.bale_number.value,
            material_type=bale.material.value,
            dtex=bale.dtex.value,
            gross_weight_kg=bale.weight.gross_kg,
            container_weight_kg=bale.weight.container_kg,
            status=bale.status.value,
        )

    @staticmethod
    def to_domain(
        record: RawMaterialBaleRecord,
    ) -> RawMaterialBale:
        return RawMaterialBale(
            id=RawMaterialBaleId(record.id),
            reception_id=RawMaterialReceptionId(
                record.reception_id
            ),
            bale_number=BaleNumber(record.bale_number),
            material=MaterialType(
                record.material_type
            ),
            dtex=Dtex(record.dtex),
            weight=BaleWeight(
                gross_kg=record.gross_weight_kg,
                container_kg=record.container_weight_kg
            ),
            status=BaleStatus(record.status),
        )
