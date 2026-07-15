import { useState, useCallback } from "react";
import { Stack, Title, TextInput, Button, Group, Paper, SimpleGrid, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { DataGrid, renderTextEditor } from "react-data-grid";
import type { Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import type { BaleRow, TruckReceptionFormData } from "../types/reception-types";
import type { CreateReceptionPayload } from "../types/reception-types";
import { createReception } from "../api/receptionApi";

function createTempId(): BaleRow["id"] {
    return `temp-${crypto.randomUUID()}`;
}

function emptyBale(materialCode: string, lotCode: string): BaleRow {
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

const COLUMNS: Column<BaleRow>[] = [
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

export default function ReceptionPage() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<TruckReceptionFormData>({
        mode: "uncontrolled",
        initialValues: {
            truckLicensePlate: "",
            carrier: "",
            materialCode: "",
            lotCode: "",
        },
        validate: {
            truckLicensePlate: (value) => (!value ? "La patente es obligatoria" : null),
            carrier: (value) => (!value ? "El transportista es obligatorio" : null),
            materialCode: (value) => (!value ? "El código de material es obligatorio" : null),
            lotCode: (value) => (!value ? "El lote es obligatorio" : null),
        },
    });

    const [rows, setRows] = useState<BaleRow[]>([]);

    const addRow = useCallback(() => {
        const { materialCode, lotCode } = form.getValues();
        setRows((prev) => [...prev, emptyBale(materialCode, lotCode)]);
    }, [form]);

    const handleSubmit = useCallback(async (formValues: TruckReceptionFormData) => {
        const payload: CreateReceptionPayload = {
            truck_license_plate: formValues.truckLicensePlate,
            carrier: formValues.carrier,
            material_code: formValues.materialCode,
            lot_code: formValues.lotCode,
            bales: rows.map((r) => ({
                bale_code: r.baleCode,
                material_code: r.materialCode,
                gross_weight_kg: r.grossWeight,
                tares_kg: r.tares,
                net_weight_kg: r.netWeight,
                lot_code: r.lotCode,
                observations: r.observations || undefined,
            })),
        };

        setSubmitting(true);
        setError(null);
        try {
            const result = await createReception(payload);
            console.log("Reception created:", result);
            // TODO: show success notification, reset form
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setSubmitting(false);
        }
    }, [rows]);

    return (
        <Stack>
            <Title order={2}>Recepción de fardos</Title>

            <form id="reception-form" onSubmit={form.onSubmit(handleSubmit)}>
                <Paper withBorder p="md">
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                        <TextInput
                            label="Patente"
                            placeholder="AA000BB"
                            {...form.getInputProps("truckLicensePlate")}
                        />
                        <TextInput
                            label="Transportista"
                            placeholder="Nombre o razón social"
                            {...form.getInputProps("carrier")}
                        />
                        <TextInput
                            label="Código de material"
                            placeholder="Ej: ALG-PE-01"
                            {...form.getInputProps("materialCode")}
                        />
                        <TextInput
                            label="Lote"
                            placeholder="Ej: LOTE-001"
                            {...form.getInputProps("lotCode")}
                        />
                    </SimpleGrid>
                </Paper>
            </form>

            <Group>
                <Button onClick={addRow}>Agregar fardo</Button>
            </Group>

            <Paper withBorder p="md">
                <DataGrid
                    columns={COLUMNS}
                    rows={rows}
                    onRowsChange={setRows}
                    style={{ minHeight: rows.length === 0 ? 120 : undefined }}
                    defaultColumnOptions={{ resizable: true }}
                />
            </Paper>

            {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="outline">
                    {error}
                </Alert>
            )}

            <Group>
                <Button type="submit" form="reception-form" loading={submitting} disabled={rows.length === 0}>
                    Enviar recepción
                </Button>
            </Group>
        </Stack>
    );
}
