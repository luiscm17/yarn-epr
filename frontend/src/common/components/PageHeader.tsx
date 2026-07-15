import { type ReactNode } from "react";
import { Group, Title } from "@mantine/core";

interface PageHeaderProps {
    title: string;
    /** Slot derecho opcional para acciones (botones, filtros, etc.) */
    children?: ReactNode;
}

/**
 * Encabezado de página con título y slot de acciones.
 * El breadcrumb se renderiza globalmente desde AppLayout.
 */
export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <Group justify="space-between" wrap="nowrap" mb="md">
            <Title order={2}>{title}</Title>
            {children && (
                <Group gap="sm" wrap="nowrap">
                    {children}
                </Group>
            )}
        </Group>
    );
}
