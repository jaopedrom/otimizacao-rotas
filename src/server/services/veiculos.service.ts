import { prisma } from "../../lib/prisma";
import { Veiculo } from "../schemas/veiculos.schema";

export async function listarVeiculosService(): Promise<Veiculo[]> {
    const veiculosDb = await prisma.tb_veiculo.findMany({
        where: { vei_ativo: true },
        select: {
            vei_id: true,
            vei_nome: true,
            vei_placa: true,
            vei_capacidade: true,
        },
        orderBy: { vei_nome: 'asc' }
    });

    return veiculosDb.map(v => ({
        veiculo_id: v.vei_id,
        veiculo_nome: v.vei_nome,
        veiculo_placa: v.vei_placa,
        veiculo_capacidade: v.vei_capacidade,
    }));
}
