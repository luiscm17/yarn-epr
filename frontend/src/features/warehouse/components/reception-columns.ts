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
    { key: "baleCode", name: "Código fardo", editable: true, renderEditCell: renderTextEditor },
    { key: "materialCode", name: "Material" },
    {
        key: "grossWeight",
        name: "Peso bruto (kg)",
        editable: true,
        renderEditCell: renderTextEditor,
    },
    { key: "netWeight", name: "Peso neto (kg)" },
    { key: "lotCode", name: "Lote" },
    {
        key: "observations",
        name: "Observaciones",
        editable: true,
        renderEditCell: renderTextEditor,
    },
];
