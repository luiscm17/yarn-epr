import { useCallback } from "react";
import { Stack, Button, Group, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";

import type { TruckReceptionFormData } from "../types/reception-types";
import { ReceptionForm } from "../components/ReceptionForm";
import { BaleDataGrid } from "../components/BaleDataGrid";
import { PageHeader } from "@/common/components/PageHeader";
import { useBaleGrid } from "../hooks/useBaleGrid";
import { useReceptionSubmit } from "../hooks/useReceptionSubmit";

export default function ReceptionPage() {
    const { rows, setRows, addRow } = useBaleGrid();
    const { submit, submitting, error } = useReceptionSubmit();

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

    const handleAddRow = useCallback(() => {
        const { materialCode, lotCode } = form.getValues();
        addRow(materialCode, lotCode);
    }, [form, addRow]);

    const handleSubmit = useCallback(
        async (formValues: TruckReceptionFormData) => {
            await submit(formValues, rows);
        },
        [submit, rows],
    );

    return (
        <Stack>
            <PageHeader title="Recepción de fardos" />

            <ReceptionForm form={form} onSubmit={handleSubmit} />

            <Group>
                <Button onClick={handleAddRow}>Agregar fardo</Button>
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
