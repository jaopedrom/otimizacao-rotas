import { prisma } from './src/lib/prisma';

async function main() {
    const rotas = await prisma.tb_rota.findMany({
        include: {
            tb_parada: true
        }
    });
    console.log(JSON.stringify(rotas, null, 2));
}

main().finally(() => prisma.$disconnect());
