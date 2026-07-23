from warehouse.application.raw_material.bale_reception_errors import (
    DuplicateBaleNumberError,
    DuplicateShipmentNumberError,
)
from warehouse.application.raw_material.bale_reception_result import (
    BaleReceptionResult,
    RegisteredBaleResult,
)
from warehouse.application.raw_material.register_bale_reception_input import (
    ReceivedBaleInput,
    RegisterBaleReceptionInput,
)
from warehouse.domain.raw_material.bale import Bale
from warehouse.domain.raw_material.bale_id import BaleId
from warehouse.domain.raw_material.bale_number import BaleNumber
from warehouse.domain.raw_material.bale_reception import BaleReception
from warehouse.domain.raw_material.bale_reception_id import BaleReceptionId
from warehouse.domain.raw_material.bale_weight import BaleWeight
from warehouse.domain.raw_material.dtex import Dtex
from warehouse.domain.raw_material.material_type import MaterialType
from warehouse.domain.raw_material.reception_datetime import ReceptionDateTime
from warehouse.domain.raw_material.shipment_number import ShipmentNumber
from warehouse.ports.identity_generator import IdentityGenerator
from warehouse.ports.raw_material.bale_reception_repository import (
    BaleReceptionRepository,
)
from warehouse.ports.raw_material.bale_repository import BaleRepository
from warehouse.ports.warehouse_transaction import WarehouseTransaction
from warehouse.ports.warehouse_transaction_errors import (
    DuplicateBaleNumberConflict,
    DuplicateShipmentNumberConflict,
)


class RegisterBaleReception:
    def __init__(
        self,
        reception_repository: BaleReceptionRepository,
        bale_repository: BaleRepository,
        warehouse_transaction: WarehouseTransaction,
        identity_generator: IdentityGenerator,
    ) -> None:
        self._reception_repository = reception_repository
        self._bale_repository = bale_repository
        self._warehouse_transaction = warehouse_transaction
        self._identity_generator = identity_generator

    def execute(
        self,
        reception_input: RegisterBaleReceptionInput,
    ) -> BaleReceptionResult:
        bale_numbers = self._canonical_bale_numbers(reception_input.bales)
        self._ensure_unique_bale_numbers(bale_numbers)

        reception_id = BaleReceptionId(self._identity_generator.next_id())
        bales = self._create_bales(
            reception_id=reception_id,
            bale_inputs=reception_input.bales,
            bale_numbers=bale_numbers,
        )
        reception = BaleReception(
            id=reception_id,
            received_at=ReceptionDateTime(reception_input.received_at),
            shipment_number=ShipmentNumber(reception_input.shipment_number),
            provider_name=reception_input.provider_name,
            bale_ids=tuple(bale.id for bale in bales),
        )

        try:
            with self._warehouse_transaction:
                self._reception_repository.add(reception)
                self._bale_repository.add_all(bales)
                self._warehouse_transaction.commit()
        except DuplicateBaleNumberConflict as error:
            raise DuplicateBaleNumberError(
                "Raw material reception cannot contain duplicate bale numbers."
            ) from error
        except DuplicateShipmentNumberConflict as error:
            raise DuplicateShipmentNumberError(
                "Shipment number is already registered."
            ) from error

        return BaleReceptionResult(
            reception_id=reception.id.value,
            shipment_number=reception.shipment_number.value,
            received_at=reception.received_at.value,
            provider_name=reception.provider_name,
            bale_count=reception.bale_count,
            bales=tuple(
                RegisteredBaleResult(
                    id=bale.id.value,
                    bale_number=bale.bale_number.value,
                    material_type=bale.material.value,
                    dtex=bale.dtex.value,
                    gross_weight_kg=bale.weight.gross_kg,
                    container_weight_kg=bale.weight.container_kg,
                    status=bale.status.value,
                )
                for bale in bales
            ),
        )

    def _create_bales(
        self,
        reception_id: BaleReceptionId,
        bale_inputs: tuple[ReceivedBaleInput, ...],
        bale_numbers: tuple[BaleNumber, ...],
    ) -> tuple[Bale, ...]:
        return tuple(
            self._create_bale(
                reception_id=reception_id,
                bale_input=bale_input,
                bale_number=bale_number,
            )
            for bale_input, bale_number in zip(bale_inputs, bale_numbers, strict=True)
        )

    def _create_bale(
        self,
        reception_id: BaleReceptionId,
        bale_input: ReceivedBaleInput,
        bale_number: BaleNumber,
    ) -> Bale:
        return Bale(
            id=BaleId(self._identity_generator.next_id()),
            reception_id=reception_id,
            bale_number=bale_number,
            material=MaterialType(bale_input.material_type),
            dtex=Dtex(bale_input.dtex),
            weight=BaleWeight(
                gross_kg=bale_input.gross_weight_kg,
                container_kg=bale_input.container_weight_kg,
            ),
        )

    @staticmethod
    def _canonical_bale_numbers(
        bale_inputs: tuple[ReceivedBaleInput, ...],
    ) -> tuple[BaleNumber, ...]:
        return tuple(BaleNumber(item.bale_number) for item in bale_inputs)

    @staticmethod
    def _ensure_unique_bale_numbers(
        bale_numbers: tuple[BaleNumber, ...],
    ) -> None:
        if len(bale_numbers) != len(set(bale_numbers)):
            raise DuplicateBaleNumberError(
                "Raw material reception cannot contain duplicate bale numbers."
            )
        
