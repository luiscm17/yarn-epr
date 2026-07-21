from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from infra.persistence.database_settings import DatabaseSettings


def create_db_engine(
        settings: DatabaseSettings
) -> Engine:
    return create_engine(settings.database_url)