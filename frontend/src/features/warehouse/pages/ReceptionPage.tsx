import { useCallback } from "react";
import { Stack, Button, Group, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";

import type { BaleRow, TruckReceptionFormData } from "../types/reception-types";
import { ReceptionForm } from "../components/ReceptionForm";
import { BaleDataGrid } from "../components/BaleDataGrid";
import { PageHeader } from "@/common/components/PageHeader";
import { useBaleGrid } from "../hooks/useBaleGrid";
import { useReceptionSubmit } from "../hooks/useReceptionSubmit";

export default function ReceptionPage() {
    const { rows, handleRowsChange, updateFormValues, resetGrid } = useBaleGrid();
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

    const onRowsChange = useCallback(
        (newRows: BaleRow[]) => {
            const { materialCode, lotCode } = form.getValues();
            updateFormValues(materialCode ?? "", lotCode ?? "");
            handleRowsChange(newRows);
        },
        [form, updateFormValues, handleRowsChange],
    );

    const handleSubmit = useCallback(
        async (formValues: TruckReceptionFormData) => {
            await submit(formValues, rows, resetGrid);
        },
        [submit, rows, resetGrid],
    );

    const hasData = rows.some((r) => r.baleCode || r.grossWeight > 0);

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                <PageHeader title="Recepción de fardos" />

                <ReceptionForm form={form} />

                <BaleDataGrid rows={rows} onRowsChange={onRowsChange} />

                {error && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" variant="outline">
                        {error}
                    </Alert>
                )}

                <Group>
                    <Button type="submit" loading={submitting} disabled={!hasData}>
                        Enviar recepción
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
