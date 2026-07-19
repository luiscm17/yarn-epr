from decimal import Decimal

from warehouse.application.raw_material_reception_errors import (
    DuplicateBaleNumberInReceptionError,
)
from warehouse.application.raw_material_reception_input import (
    RawMaterialBaleReceptionInput,
    RawMaterialReceptionInput,
)
from warehouse.application.raw_material_reception_result import (
    RawMaterialReceptionResult,
)
from warehouse.domain.models.raw_material_bale import RawMaterialBale
from warehouse.domain.models.raw_material_reception import (
    RawMaterialReception,
)
from warehouse.domain.value_objects.bale_number import BaleNumber
from warehouse.domain.value_objects.bale_weight import BaleWeight
from warehouse.domain.value_objects.dtex import Dtex
from warehouse.domain.value_objects.material_type import MaterialType
from warehouse.domain.value_objects.raw_material_bale_id import (
    RawMaterialBaleId,
)
from warehouse.domain.value_objects.raw_material_reception_id import (
    RawMaterialReceptionId,
)
from warehouse.domain.value_objects.reception_datetime import (
    ReceptionDateTime,
)
from warehouse.domain.value_objects.shipment_number import ShipmentNumber
from warehouse.ports.identity_generator import IdentityGenerator
from warehouse.ports.raw_material_bale_repository import (
    RawMaterialBaleRepository,
)
from warehouse.ports.raw_material_reception_repository import (
    RawMaterialReceptionRepository,
)
from warehouse.ports.warehouse_transaction import WarehouseTransaction


class RegisterRawMaterialReception:
    def __init__(
        self,
        reception_repository: RawMaterialReceptionRepository,
        bale_repository: RawMaterialBaleRepository,
        warehouse_transaction: WarehouseTransaction,
        identity_generator: IdentityGenerator,
    ) -> None:
        self._reception_repository = reception_repository
        self._bale_repository = bale_repository
        self._warehouse_transaction = warehouse_transaction
        self._identity_generator = identity_generator

    def execute(
        self,
        reception_input: RawMaterialReceptionInput,
    ) -> RawMaterialReceptionResult:
        self._ensure_unique_bale_numbers(reception_input.bales)

        reception_id = RawMaterialReceptionId(self._identity_generator.next_id())

        bales = self._create_raw_material_bales(
            reception_id=reception_id,
            bale_inputs=reception_input.bales,
        )
        reception = RawMaterialReception(
            id=reception_id,
            received_at=ReceptionDateTime(reception_input.received_at),
            shipment_number=ShipmentNumber(reception_input.shipment_number),
            provider_name=reception_input.provider_name,
            bale_ids=tuple(bale.id for bale in bales),
        )

        with self._warehouse_transaction:
            self._reception_repository.add(reception)
            self._bale_repository.add_all(bales)
            self._warehouse_transaction.commit()

        return RawMaterialReceptionResult(
            reception_id=reception.id.value,
            bale_ids=tuple(bale.id.value for bale in bales),
            bale_count=reception.bale_count,
            total_net_weight_kg=self._calculate_total_net_weight(bales=bales),
        )

    def _create_raw_material_bales(
        self,
        reception_id: RawMaterialReceptionId,
        bale_inputs: tuple[RawMaterialBaleReceptionInput, ...],
    ) -> tuple[RawMaterialBale, ...]:
        return tuple(
            self._create_raw_material_bale(
                reception_id=reception_id, bale_input=bale_input
            )
            for bale_input in bale_inputs
        )

    def _create_raw_material_bale(
        self,
        reception_id: RawMaterialReceptionId,
        bale_input: RawMaterialBaleReceptionInput,
    ) -> RawMaterialBale:
        return RawMaterialBale(
            id=RawMaterialBaleId(self._identity_generator.next_id()),
            reception_id=reception_id,
            bale_number=BaleNumber(bale_input.bale_number),
            material=MaterialType(bale_input.material_type),
            dtex=Dtex(bale_input.dtex),
            weight=BaleWeight(
                gross_kg=bale_input.gross_weight_kg,
                container_kg=bale_input.container_weight_kg,
            ),
        )

    @staticmethod
    def _ensure_unique_bale_numbers(
        bale_inputs: tuple[
            RawMaterialBaleReceptionInput,
            ...,
        ],
    ) -> None:
        bale_numbers = tuple(
            BaleNumber(bale_input.bale_number) for bale_input in bale_inputs
        )

        if len(bale_numbers) != len(set(bale_numbers)):
            raise DuplicateBaleNumberInReceptionError(
                "Raw material reception cannot contain duplicate bale numbers."
            )

    @staticmethod
    def _calculate_total_net_weight(
        bales: tuple[RawMaterialBale, ...],
    ) -> Decimal:
        return sum(
            (bale.weight.net_kg for bale in bales),
            start=Decimal("0"),
        )
