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
        width: 140,
        editable: true,
        renderEditCell: renderTextEditor,
    },
    { key: "materialCode", name: "Material", width: 120 },
    {
        key: "grossWeight",
        name: "Peso bruto (kg)",
        width: 130,
        editable: true,
        renderEditCell: renderTextEditor,
    },
    { key: "netWeight", name: "Peso neto (kg)", width: 110 },
    { key: "lotCode", name: "Lote", width: 120 },
    {
        key: "observations",
        name: "Observaciones",
        width: 200,
        editable: true,
        renderEditCell: renderTextEditor,
    },
];
