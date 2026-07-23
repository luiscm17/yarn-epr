from warehouse.adapters.persistence.raw_material.bale_record import BaleRecord
from warehouse.domain.raw_material.bale import Bale
from warehouse.domain.raw_material.bale_id import BaleId
from warehouse.domain.raw_material.bale_number import BaleNumber
from warehouse.domain.raw_material.bale_reception_id import BaleReceptionId
from warehouse.domain.raw_material.bale_status import BaleStatus
from warehouse.domain.raw_material.bale_weight import BaleWeight
from warehouse.domain.raw_material.dtex import Dtex
from warehouse.domain.raw_material.material_type import MaterialType


class BaleMapper:
    @staticmethod
    def to_record(bale: Bale) -> BaleRecord:
        return BaleRecord(
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
    def to_domain(record: BaleRecord) -> Bale:
        return Bale(
            id=BaleId(record.id),
            reception_id=BaleReceptionId(record.reception_id),
            bale_number=BaleNumber(record.bale_number),
            material=MaterialType(record.material_type),
            dtex=Dtex(record.dtex),
            weight=BaleWeight(
                gross_kg=record.gross_weight_kg,
                container_kg=record.container_weight_kg,
            ),
            status=BaleStatus(record.status),
        )
