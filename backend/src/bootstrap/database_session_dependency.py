from collections.abc import Callable, Generator

from sqlalchemy.orm import Session

SessionFactory = Callable[[], Session]
SessionProvider = Callable[[], Generator[Session, None, None]]


def session_dependency(
    session_factory: SessionFactory,
) -> SessionProvider:
    def database_session() -> Generator[Session, None, None]:
        with session_factory() as session:
            yield session

    return database_session
