"use server";

import { createVeiculo } from "@/src/server/schemas/veiculos.schema";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function criarVeiculosAction(data: createVeiculo) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/veiculos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            return { success: false, message: err?.message || "Erro desconhecido" };
        }

        return await res.json();
    } catch (error) {
        console.error("Erro de conexão ao criar veiculo:", error);
        return { success: false, message: "Não foi possível conectar ao servidor" };
    }
}