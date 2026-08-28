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
import { ChevronRight, Truck, PlusCircle, PackageCheck, Calendar, Building, UserPlus, Layers, LayersPlusIcon } from "lucide-react"
import {NavUser} from "@/src/components/nav-user";

const entregaItems = [
  { title: "Nova Entrega", url: "/operador/entrega/nova-entrega", icon: PlusCircle },
  { title: "Entregas em Andamento", url: "/operador/entrega/em-andamento", icon: Truck },
  { title: "Entregas Finalizadas", url: "/operador/entrega/finalizadas", icon: PackageCheck },
  { title: "Entregas Agendadas", url: "/operador/entrega/agendamentos", icon: Calendar },
]

const cadastroItems = [
  { title: "Clientes", url: "/operador/cliente", icon: UserPlus },
  { title: "Depósitos", url: "/deposito", icon: Building },
  { title: "Empresas", url: "/operador/empresa", icon: Building },
  { title: "Veículos", url: "/operador/veiculo", icon: Truck },
]

export function AppSidebar() {

  const usuarioSimulado = {
    name: "João Silva",
    email: "joao@empresa.com",
    avatar: "https://github.com/shadcn.png", // Link de uma imagem ou string vazia ""
  };

  const pathname = usePathname()

  // states independentes: um para o grupo Entregas, outro para Cadastros
  const [isEntregasOpen, setIsEntregasOpen] = useState(
    pathname.startsWith("/operador/entrega")
  )
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(
    cadastroItems.some((item) => pathname.startsWith(item.url))
  )

  useEffect(() => {
    if (pathname.startsWith("/operador/entrega")) {
      setIsEntregasOpen(true)
    }
    if (cadastroItems.some((item) => pathname.startsWith(item.url))) {
      setIsCadastrosOpen(true)
    }
  }, [pathname])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 text-xl font-bold">Rotas Otimizadas</div>
      </SidebarHeader>
      <SidebarContent>
        {/* grupo de Entregas */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Entregas</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible
              open={isEntregasOpen}
              onOpenChange={setIsEntregasOpen}
              className="group/collapsible"
            >
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

        {/* grupo de Cadastros */}
        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible
              open={isCadastrosOpen}
              onOpenChange={setIsCadastrosOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <CollapsibleTrigger />
                  }
                >
                  <LayersPlusIcon />
                  <span>Cadastros</span>
                  <ChevronRight className="ml-auto data-[state=open]:rotate-90 transition-transform" />
                </SidebarMenuButton>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {cadastroItems.map((item) => (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton
                          isActive={pathname.startsWith(item.url)}
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={usuarioSimulado} />
      </SidebarFooter>
    </Sidebar>
  )
}