import { Paper } from "@mantine/core";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import type { BaleRow } from "../types/reception-types";
import { COLUMNS } from "./reception-columns";
import classes from "@/styles/components/BaleDataGrid.module.css";

interface BaleDataGridProps {
    rows: BaleRow[];
    onRowsChange: (rows: BaleRow[]) => void;
}

const GRID_STYLES = {
    "--rdg-color": "light-dark(var(--mantine-color-text), var(--mantine-color-text))",
    "--rdg-border-color": "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
    "--rdg-background-color": "light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))",
    "--rdg-header-background-color":
        "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))",
    "--rdg-row-hover-background-color":
        "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))",
    "--rdg-row-selected-background-color":
        "light-dark(var(--mantine-color-brand-cyan-0), var(--mantine-color-brand-cyan-9))",
    "--rdg-row-selected-hover-background-color":
        "light-dark(var(--mantine-color-brand-cyan-1), color-mix(in srgb, var(--mantine-color-brand-cyan-9) 60%, transparent))",
    "--rdg-selection-color": "var(--mantine-color-brand-cyan-6)",
    "--rdg-checkbox-focus-color": "var(--mantine-color-brand-cyan-5)",
    "--rdg-font-size": "var(--mantine-font-size-sm)",
} as React.CSSProperties;

export function BaleDataGrid({ rows, onRowsChange }: BaleDataGridProps) {
    return (
        <Paper withBorder p="md">
            <DataGrid
                className={classes.grid}
                style={GRID_STYLES}
                columns={COLUMNS}
                rows={rows}
                onRowsChange={onRowsChange}
                defaultColumnOptions={{ resizable: true }}
            />
        </Paper>
    );
}
