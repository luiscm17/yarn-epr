from collections.abc import Callable
from typing import Annotated

from fastapi import APIRouter, Depends, status

from warehouse.adapters.http.raw_material.bale_reception_mapping import (
    bale_reception_to_input,
    bale_reception_to_response,
)
from warehouse.adapters.http.raw_material.bale_reception_request import (
    BaleReceptionRequest,
)
from warehouse.adapters.http.raw_material.bale_reception_response import (
    BaleReceptionResponse,
)
from warehouse.application.raw_material.register_bale_reception import (
    RegisterBaleReception,
)

UseCaseProvider = Callable[..., RegisterBaleReception]


def create_router(
    use_case_provider: UseCaseProvider,
) -> APIRouter:
    router = APIRouter()

    @router.post(
        "",
        response_model=BaleReceptionResponse,
        status_code=status.HTTP_201_CREATED,
    )
    def register(
        request: BaleReceptionRequest,
        use_case: Annotated[RegisterBaleReception, Depends(use_case_provider)],
    ) -> BaleReceptionResponse:
        reception_input = bale_reception_to_input(request)
        result = use_case.execute(reception_input)
        return bale_reception_to_response(result)

    return router
