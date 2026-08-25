"use server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function getEntregasEmAndamentoAction(): Promise<any[]> {
    const res = await fetch(`${BACKEND_URL}/entregas/em-andamento`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Erro ao buscar entregas em andamento", await res.text());
        return [];
    }
    return res.json();
}

export async function finalizarRotaAction(rotaId: string): Promise<boolean> {
    const res = await fetch(`${BACKEND_URL}/entregas/${rotaId}/finalizar`, {
        method: "PATCH",
    });

    if (!res.ok) {
        console.error("Erro ao finalizar rota", await res.text());
        return false;
    }
    return true;
}
