from types import TracebackType
from typing import Self

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from warehouse.ports.warehouse_transaction import (
    WarehouseTransaction as WarehouseTransactionPort,
)
from warehouse.ports.warehouse_transaction_errors import (
    DuplicateBaleNumberConflict,
    DuplicateShipmentNumberConflict,
)


BALE_NUMBER_UNIQUE_CONSTRAINT = "uq_raw_material_bales_reception_bale_number"
SHIPMENT_NUMBER_UNIQUE_CONSTRAINT = (
    "uq_raw_material_receptions_shipment_number"
)


def violated_constraint(error: IntegrityError) -> str | None:
    diagnostic = getattr(error.orig, "diag", None)
    return getattr(diagnostic, "constraint_name", None)


class WarehouseTransaction(WarehouseTransactionPort):
    def __init__(self, session: Session) -> None:
        self._session = session
        self._rolled_back = False

    def __enter__(self) -> Self:
        self._rolled_back = False
        return self

    def __exit__(
        self,
        exception_type: type[BaseException] | None,
        exception: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        if exception is not None and not self._rolled_back:
            self._rollback()

    def commit(self) -> None:
        try:
            self._session.commit()
        except IntegrityError as error:
            self._rollback()
            constraint = violated_constraint(error)
            if constraint == BALE_NUMBER_UNIQUE_CONSTRAINT:
                raise DuplicateBaleNumberConflict from error
            if constraint == SHIPMENT_NUMBER_UNIQUE_CONSTRAINT:
                raise DuplicateShipmentNumberConflict from error
            raise
        except Exception:
            self._rollback()
            raise

    def _rollback(self) -> None:
        self._session.rollback()
        self._rolled_back = True
