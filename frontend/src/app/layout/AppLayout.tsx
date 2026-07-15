import { useRef, useState } from "react";
import {
    AppShell,
    Splitter,
    Group,
    Text,
    ActionIcon,
    useMantineColorScheme,
    useComputedColorScheme,
    Indicator,
    Avatar,
    Menu,
    rem,
} from "@mantine/core";
import type { UseSplitterReturnValue } from "@mantine/hooks";
import { IconSun, IconMoon, IconChevronDown, IconMenu2 } from "@tabler/icons-react";
import { Outlet, useNavigate } from "react-router-dom";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../features/auth/context/auth-context";
import { ErrorBoundary } from "../../common/components/ErrorBoundary";
import { AppBreadcrumbs } from "../../common/components/AppBreadcrumbs";
import { usePageTitle } from "../../common/hooks/usePageTitle";

export function AppLayout() {
    usePageTitle();
    const navigate = useNavigate();
    const splitterRef = useRef<UseSplitterReturnValue>(null);
    const [sizes, setSizes] = useState<(number | string)[]>(() => {
        const saved = localStorage.getItem("sidebarWidth");
        return saved ? [saved, 100] : ["260px", 100];
    });

    const { setColorScheme } = useMantineColorScheme();
    const computedScheme = useComputedColorScheme("light");
    const isDark = computedScheme === "dark";
    const { user, logout, isResourceAllowed } = useAuth();

    const handleNavClick = () => {
        if (window.matchMedia("(max-width: 48em)").matches) {
            splitterRef.current?.toggleCollapse(0);
        }
    };

    const handleToggleSidebar = () => {
        splitterRef.current?.toggleCollapse(0);
    };

    const handleSizeChange = (newSizes: (number | string)[]) => {
        setSizes(newSizes);
        const width = newSizes[0];
        if (typeof width === "string" && width.endsWith("px")) {
            localStorage.setItem("sidebarWidth", width);
        }
    };

    return (
        <AppShell header={{ height: 56 }}>
            <AppShell.Header>
                <TopBar
                    left={
                        <>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={handleToggleSidebar}
                                aria-label="Toggle sidebar"
                            >
                                <IconMenu2 style={{ width: rem(18) }} />
                            </ActionIcon>

                            <Text size="lg" fw={700} c="brand-cyan.3">
                                Yarn EPR
                            </Text>
                        </>
                    }
                    right={
                        <Group gap="sm" wrap="nowrap">
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={() => setColorScheme(isDark ? "light" : "dark")}
                                aria-label="Toggle color scheme"
                            >
                                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                            </ActionIcon>

                            <Menu shadow="md" width={180}>
                                <Menu.Target>
                                    <Group gap={6} style={{ cursor: "pointer" }} wrap="nowrap">
                                        <Indicator size={8} offset={2} color="green" withBorder>
                                            <Avatar size={28} color="brand-cyan" radius="xl">
                                                {user?.initials ?? "?"}
                                            </Avatar>
                                        </Indicator>
                                        <Text size="sm" visibleFrom="sm">
                                            {user?.name ?? "Usuario"}
                                        </Text>
                                        <IconChevronDown
                                            size={14}
                                            style={{ color: "var(--mantine-color-dimmed)" }}
                                        />
                                    </Group>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Label>Usuario</Menu.Label>
                                    <Menu.Item onClick={() => navigate("/profile")}>
                                        Perfil
                                    </Menu.Item>
                                    <Menu.Item
                                        color="red"
                                        onClick={() => {
                                            logout();
                                            navigate("/login", { replace: true });
                                        }}
                                    >
                                        Cerrar sesión
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    }
                />
            </AppShell.Header>

            <Splitter
                splitterRef={splitterRef}
                sizes={sizes}
                onSizeChange={handleSizeChange}
                style={{ height: "calc(100vh - 56px)" }}
            >
                <Splitter.Pane
                    defaultSize="260px"
                    min={200}
                    max={400}
                    collapsible
                    bg={isDark ? "dark.7" : "gray.0"}
                >
                    <Sidebar isResourceAllowed={isResourceAllowed} onNavigate={handleNavClick} />
                </Splitter.Pane>
                <Splitter.Pane defaultSize={100} p="md" style={{ overflow: "auto" }}>
                    <ErrorBoundary>
                        <div className="page-enter">
                            <AppBreadcrumbs />
                            <Outlet />
                        </div>
                    </ErrorBoundary>
                </Splitter.Pane>
            </Splitter>
        </AppShell>
    );
}
