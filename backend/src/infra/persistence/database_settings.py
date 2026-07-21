import os
from collections.abc import Mapping
from dataclasses import dataclass

DATABASE_URL = "DATABASE_URL"


@dataclass(frozen=True, slots=True)
class DatabaseSettings:
    database_url: str

    @classmethod
    def from_env(
        cls,
        environment: Mapping[str, str] = os.environ,
    ) -> "DatabaseSettings":
        database_url = environment.get(
            DATABASE_URL,
            "",
        ).strip()

        if not database_url:
            message = (
                f"{DATABASE_URL} must be defined with a non-empty database URL"
            )
            raise RuntimeError(message)

        return cls(database_url=database_url)
