import { useEffect, useRef, useState } from "react";
import {
    Box,
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
import { useMediaQuery, type SplitterPaneSize, type UseSplitterReturnValue } from "@mantine/hooks";
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
    const isMobile = useMediaQuery("(max-width: 48em)");
    const wasMobile = useRef<boolean | undefined>(undefined);
    const [sizes, setSizes] = useState<SplitterPaneSize[]>(() => {
        const saved = localStorage.getItem("sidebarSizes");
        return saved ? (JSON.parse(saved) as SplitterPaneSize[]) : [20, 80];
    });

    const { setColorScheme } = useMantineColorScheme();
    const computedScheme = useComputedColorScheme("light");
    const isDark = computedScheme === "dark";
    const { user, logout, isResourceAllowed } = useAuth();

    // Auto-collapse sidebar on mobile, expand on desktop
    // Tracks breakpoint transitions without fighting user toggles.
    // Ignores the undefined → false/true transition on mount (hydration).
    useEffect(() => {
        if (isMobile === undefined) return;
        if (wasMobile.current === undefined) {
            wasMobile.current = isMobile;
            return;
        }
        if (wasMobile.current === isMobile) return;
        wasMobile.current = isMobile;
        splitterRef.current?.toggleCollapse(0);
    }, [isMobile]);

    const handleNavClick = () => {
        if (isMobile) {
            splitterRef.current?.toggleCollapse(0);
        }
    };

    const handleToggleSidebar = () => {
        splitterRef.current?.toggleCollapse(0);
    };

    const handleSizeChange = (newSizes: SplitterPaneSize[]) => {
        setSizes(newSizes);
        localStorage.setItem("sidebarSizes", JSON.stringify(newSizes));
    };

    return (
        <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box style={{ height: 56, flexShrink: 0 }}>
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
            </Box>

            <Splitter
                splitterRef={splitterRef}
                sizes={sizes}
                onSizeChange={handleSizeChange}
                style={{ flex: 1 }}
            >
                <Splitter.Pane
                    defaultSize={20}
                    min={15}
                    max={25}
                    collapsible
                    collapseThreshold={1}
                    bg={isDark ? "dark.7" : "gray.0"}
                >
                    <Sidebar isResourceAllowed={isResourceAllowed} onNavigate={handleNavClick} />
                </Splitter.Pane>
                <Splitter.Pane defaultSize={80} p="md" style={{ overflow: "auto" }}>
                    <ErrorBoundary>
                        <div className="page-enter">
                            <AppBreadcrumbs />
                            <Outlet />
                        </div>
                    </ErrorBoundary>
                </Splitter.Pane>
            </Splitter>
        </Box>
    );
}
