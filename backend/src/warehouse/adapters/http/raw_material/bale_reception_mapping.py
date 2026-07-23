from typing import Literal

from warehouse.adapters.http.raw_material.bale_reception_request import (
    BaleReceptionRequest,
)
from warehouse.adapters.http.raw_material.bale_reception_response import (
    BaleReceptionResponse,
    RegisteredBaleResponse,
)
from warehouse.application.raw_material.bale_reception_result import (
    BaleReceptionResult,
)
from warehouse.application.raw_material.register_bale_reception_input import (
    ReceivedBaleInput,
    RegisterBaleReceptionInput,
)


def _bale_status(status: str) -> Literal["in_warehouse"]:
    if status != "in_warehouse":
        raise ValueError(f"Unexpected registered bale status: {status!r}.")
    return status


def bale_reception_to_input(
    request: BaleReceptionRequest,
) -> RegisterBaleReceptionInput:
    return RegisterBaleReceptionInput(
        received_at=request.received_at,
        shipment_number=request.shipment_number,
        provider_name=request.provider_name,
        bales=tuple(
            ReceivedBaleInput(
                bale_number=bale.bale_number,
                material_type=bale.material_type,
                dtex=bale.dtex,
                gross_weight_kg=bale.gross_weight_kg,
                container_weight_kg=bale.container_weight_kg,
            )
            for bale in request.bales
        ),
    )


def bale_reception_to_response(
    result: BaleReceptionResult,
) -> BaleReceptionResponse:
    return BaleReceptionResponse(
        reception_id=result.reception_id,
        shipment_number=result.shipment_number,
        received_at=result.received_at,
        provider_name=result.provider_name,
        bale_count=result.bale_count,
        bales=tuple(
            RegisteredBaleResponse(
                id=bale.id,
                bale_number=bale.bale_number,
                material_type=bale.material_type,
                dtex=bale.dtex,
                gross_weight_kg=bale.gross_weight_kg,
                container_weight_kg=bale.container_weight_kg,
                status=_bale_status(bale.status),
            )
            for bale in result.bales
        ),
    )
