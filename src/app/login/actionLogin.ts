export type LoginResult =
    | { success: true; usuario: { usr_cargo: "OPERADOR" | "CLIENTE" | "MOTORISTA"; [key: string]: any } }
    | { success: false; message: string };

export async function loginAction(email: string, password: string): Promise<LoginResult> {
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { success: false, message: data?.message || "Erro ao autenticar" };
        }

        return data;
    } catch (error) {
        console.error("Erro de conexão ao fazer login:", error);
        return { success: false, message: "Não foi possível conectar ao servidor" };
    }
}