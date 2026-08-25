"use server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function criarDepositoAction(data: any) {
    const res = await fetch(`${BACKEND_URL}/depositos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { success: false, message: err.message || "Erro desconhecido" };
    }

    return await res.json();
}

export async function searchEnderecoAction(address: string): Promise<any[]> {
    const res = await fetch(`${BACKEND_URL}/geocoding/search?address=${encodeURIComponent(address)}`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Erro na busca de endereço", await res.text());
        return [];
    }
    return res.json();
}
