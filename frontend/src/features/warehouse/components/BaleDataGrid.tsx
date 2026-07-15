import { Paper } from "@mantine/core";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import type { BaleRow } from "../types/reception-types";
import { COLUMNS } from "./reception-columns";

interface BaleDataGridProps {
    rows: BaleRow[];
    onRowsChange: (rows: BaleRow[]) => void;
}

export function BaleDataGrid({ rows, onRowsChange }: BaleDataGridProps) {
    return (
        <Paper withBorder p="md">
            <DataGrid
                columns={COLUMNS}
                rows={rows}
                onRowsChange={onRowsChange}
                defaultColumnOptions={{ resizable: true }}
            />
        </Paper>
    );
}
