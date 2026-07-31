"use server";

import { Veiculo } from "@/src/server/schemas/veiculos.schema";
import { EntregaItem } from "@/src/server/schemas/entregas.schema";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getVeiculosAction(): Promise<Veiculo[]> {
    const res = await fetch(`${BACKEND_URL}/veiculos`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Erro ao buscar veículos", await res.text());
        return [];
    }
    return res.json();
}

export async function getClientesAction(): Promise<any[]> {
    const res = await fetch(`${BACKEND_URL}/clientes`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Erro ao buscar clientes", await res.text());
        return [];
    }
    return res.json();
}

export async function searchEnderecoAction(address: string): Promise<any[]> {
    const res = await fetch(`${BACKEND_URL}/geocoding/search?address=${encodeURIComponent(address)}`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Erro na busca de endereço", await res.text());
        return [];
    }
    return res.json();
}

export async function salvarLoteAction(entregas: EntregaItem[]): Promise<boolean> {
    const res = await fetch(`${BACKEND_URL}/entregas/lote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entregas }),
    });

    if (!res.ok) {
        console.error("Erro ao salvar lote de entregas", await res.text());
        return false;
    }
    return true;
}
