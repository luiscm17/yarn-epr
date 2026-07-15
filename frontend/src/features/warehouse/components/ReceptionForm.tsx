import { Paper, SimpleGrid, TextInput } from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";
import type { TruckReceptionFormData } from "../types/reception-types";

interface ReceptionFormProps {
    form: UseFormReturnType<TruckReceptionFormData>;
    onSubmit: (values: TruckReceptionFormData) => Promise<void>;
}

export function ReceptionForm({ form, onSubmit }: ReceptionFormProps) {
    return (
        <form id="reception-form" onSubmit={form.onSubmit(onSubmit)}>
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
    );
}
