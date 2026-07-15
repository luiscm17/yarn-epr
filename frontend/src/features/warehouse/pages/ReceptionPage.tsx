import { useState, useCallback } from "react";
import { Stack, Button, Group, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";

import type { BaleRow, TruckReceptionFormData } from "../types/reception-types";
import type { CreateReceptionPayload } from "../types/reception-types";
import { createReception } from "../api/receptionApi";
import { emptyBale } from "../components/reception-columns";
import { ReceptionForm } from "../components/ReceptionForm";
import { BaleDataGrid } from "../components/BaleDataGrid";
import { PageHeader } from "@/common/components/PageHeader";

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
            <PageHeader title="Recepción de fardos" />

            <ReceptionForm form={form} onSubmit={handleSubmit} />

            <Group>
                <Button onClick={addRow}>Agregar fardo</Button>
            </Group>

            <BaleDataGrid rows={rows} onRowsChange={setRows} />

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
