import { useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Collapse,
  Group,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { type NavItem } from '../navigation-data'
import classes from '../../styles/components/SidebarLinksGroup.module.css'

interface LinksGroupProps {
  icon?: ReactNode
  label: string
  links?: NavItem[]
}

export function SidebarLinksGroup({ icon, label, links }: LinksGroupProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasLinks = Array.isArray(links) && links.length > 0

  // Auto-open if any child matches the current route
  const initiallyOpened =
    hasLinks && links!.some((child) => child.path === location.pathname)

  const [opened, setOpened] = useState(initiallyOpened)

  const items = (hasLinks ? links! : []).map((child) => {
    const isActive = location.pathname === child.path
    return (
      <UnstyledButton
        key={child.path}
        className={classes.link}
        data-active={isActive || undefined}
        onClick={() => child.path && navigate(child.path)}
      >
        {child.label}
      </UnstyledButton>
    )
  })

  return (
    <Box>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify="space-between" gap={0}>
          <div className={classes.iconWrapper}>
            {icon && <span className={classes.icon}>{icon}</span>}
            <span>{label}</span>
          </div>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={14}
              style={{ transform: opened ? 'rotate(90deg)' : 'none' }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks && <Collapse expanded={opened}>{items}</Collapse>}
    </Box>
  )
}
