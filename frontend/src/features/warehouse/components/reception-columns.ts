import type { Column } from "react-data-grid";
import { renderTextEditor } from "react-data-grid";
import type { BaleRow } from "../types/reception-types";

export function createTempId(): BaleRow["id"] {
    return `temp-${crypto.randomUUID()}`;
}

export function emptyBale(materialCode: string, lotCode: string): BaleRow {
    return {
        id: createTempId(),
        baleCode: "",
        materialCode,
        grossWeight: 0,
        tares: [],
        netWeight: 0,
        lotCode,
        observations: "",
    };
}

export const COLUMNS: Column<BaleRow>[] = [
    {
        key: "baleCode",
        name: "Código fardo",
        minWidth: 140,
        editable: true,
        renderEditCell: renderTextEditor,
    },
    { key: "materialCode", name: "Material", minWidth: 120 },
    {
        key: "grossWeight",
        name: "Peso bruto (kg)",
        minWidth: 130,
        editable: true,
        renderEditCell: renderTextEditor,
    },
    { key: "netWeight", name: "Peso neto (kg)", minWidth: 130 },
    { key: "lotCode", name: "Lote", minWidth: 120 },
    {
        key: "observations",
        name: "Observaciones",
        minWidth: 160,
        editable: true,
        renderEditCell: renderTextEditor,
    },
];
