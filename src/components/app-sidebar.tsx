"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/src/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronRight, Truck, PlusCircle, PackageCheck, Calendar, Building, UserPlus } from "lucide-react"

const entregaItems = [
  { title: "Nova Entrega", url: "/operador/entrega/nova-entrega", icon: PlusCircle },
  { title: "Entregas em Andamento", url: "/operador/entrega/em-andamento", icon: Truck },
  { title: "Entregas Finalizadas", url: "/operador/entrega/finalizadas", icon: PackageCheck },
  { title: "Entregas Agendadas", url: "/operador/entrega/agendamentos", icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(pathname.startsWith("/operador"))

  useEffect(() => {
    if (pathname.startsWith("/operador")) {
      setIsOpen(true)
    }
  }, [pathname])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 text-xl font-bold">Rotas Otimizadas</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Entregas</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/operador"}
                  render={<Link href="/operador" />}
                >
                  <Truck />
                  <span>Entregas</span>
                </SidebarMenuButton>

                <CollapsibleTrigger
                  render={
                    <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform" />
                  }
                >
                  <ChevronRight />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {entregaItems.map((item) => (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton
                          isActive={pathname === item.url}
                          render={<Link href={item.url} />}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/cliente")}
                  render={<Link href="/operador/cliente" />}
                >
                  <UserPlus />
                  <span>Clientes</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/deposito")}
                  render={<Link href="/deposito" />}
                >
                  <Building />
                  <span>Depósitos</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}