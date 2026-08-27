// src/app/cadastro/actionCadastro.ts
"use server";

import { Signup } from "@/src/server/schemas/auth.schema";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function signupAction(data: Signup) {
    try {
        const res = await fetch(`${BACKEND_URL}/signup`, { // era /api/auth/signup
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
        console.error("Erro de conexão ao cadastrar empresa:", error);
        return { success: false, message: "Não foi possível conectar ao servidor" };
    }
}