import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // 10-12 é o padrão recomendado hoje; 12 é mais seguro, ligeiramente mais lento

export async function hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
}