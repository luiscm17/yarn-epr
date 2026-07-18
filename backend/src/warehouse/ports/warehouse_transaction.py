from types import TracebackType
from typing import Protocol, Self


class WarehouseTransaction(Protocol):
    def __enter__(self) -> Self: ...

    def __exit__(
        self,
        exception_type: type[BaseException] | None,
        exception: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        """Rollback on error and never suppress exceptions."""
        ...

    def commit(self) -> None: ...
