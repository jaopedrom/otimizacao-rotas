// src/services/telefone.service.ts
import { Prisma } from "@prisma/client/extension";

export async function criarTelefoneService(telefoneApenasString: string | undefined | null, tx: Prisma.TransactionClient) {
    // Se não veio telefone, já retorna null direto
    if (!telefoneApenasString) return null;

    // Limpa tudo que não for número (tira parênteses, traços, espaços)
    const telSoNumeros = telefoneApenasString.replace(/\D/g, '');

    // Verifica se tem o tamanho mínimo (DDD + 8 ou 9 dígitos)
    if (telSoNumeros.length < 10) return null;

    const ddd = parseInt(telSoNumeros.substring(0, 2));
    const numero = telSoNumeros.substring(2);

    // BÔNUS: Verifica se esse telefone já existe no banco para não duplicar!
    let telefoneRecord = await tx.tb_telefone.findFirst({
        where: {
            tel_ddd: ddd,
            tel_numero: numero
        }
    });

    // Se não existir, cria um novo
    if (!telefoneRecord) {
        telefoneRecord = await tx.tb_telefone.create({
            data: {
                tel_ddd: ddd,
                tel_numero: numero
            }
        });
    }

    return telefoneRecord;
}