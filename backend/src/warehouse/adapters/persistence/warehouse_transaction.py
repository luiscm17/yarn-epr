from types import TracebackType
from typing import Self

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from warehouse.ports.warehouse_transaction import (
    WarehouseTransaction as WarehouseTransactionPort,
)
from warehouse.ports.warehouse_transaction_errors import (
    DuplicateBaleNumberConflict,
)


BALE_NUMBER_UNIQUE_CONSTRAINT = "uq_raw_material_bales_bale_number"


def is_bale_number_unique_violation(error: IntegrityError) -> bool:
    diagnostic = getattr(error.orig, "diag", None)
    return (
        getattr(diagnostic, "constraint_name", None)
        == BALE_NUMBER_UNIQUE_CONSTRAINT
    )


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
            if is_bale_number_unique_violation(error):
                raise DuplicateBaleNumberConflict from error
            raise
        except Exception:
            self._rollback()
            raise

    def _rollback(self) -> None:
        self._session.rollback()
        self._rolled_back = True
