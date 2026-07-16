import type { Column, RenderEditCellProps } from "react-data-grid";
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

// Column for displaying row numbers (visual only, not in payload)
export const ROW_NUMBER_COL: Column<BaleRow> = {
    key: "rowNumber",
    name: "#",
    width: 48,
    frozen: true,
    renderCell: ({ rowIdx }) => rowIdx + 1,
};

// Editable text cell — wraps renderTextEditor for consistency
function textEditor(props: RenderEditCellProps<BaleRow>) {
    return renderTextEditor(props);
}

export const COLUMNS: Column<BaleRow>[] = [
    ROW_NUMBER_COL,
    {
        key: "baleCode",
        name: "Código fardo",
        width: 140,
        editable: true,
        renderEditCell: textEditor,
    },
    {
        key: "materialCode",
        name: "Material",
        width: 120,
        editable: true,
        renderEditCell: textEditor,
    },
    {
        key: "grossWeight",
        name: "Peso bruto (kg)",
        width: 130,
        editable: true,
        renderEditCell: textEditor,
    },
    {
        key: "netWeight",
        name: "Peso neto (kg)",
        width: 110,
        editable: true,
        renderEditCell: textEditor,
    },
    {
        key: "lotCode",
        name: "Lote",
        width: 120,
        editable: true,
        renderEditCell: textEditor,
    },
    {
        key: "observations",
        name: "Observaciones",
        width: 200,
        editable: true,
        renderEditCell: textEditor,
    },
];
