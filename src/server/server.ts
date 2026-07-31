// Import the framework and instantiate it
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import { geocodingRoutes } from "./routes/geocoding.route";
import { usuariosRoutes } from "./routes/usuarios.routes";
import { entregasRoutes } from "./routes/entregas.routes";
import { rotasRoutes } from "./routes/rotas.route";
import { veiculosRoutes } from "./routes/veiculos.routes";

const fastify = Fastify({
    logger: true
})

// Adiciona validação e serialização do Zod
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

import cors from '@fastify/cors'
fastify.register(cors, {
    origin: true // permite qualquer origem (útil para desenvolvimento local)
});

// Declare a route
fastify.get('/', async function handler(request, reply) {
    return { hello: 'world' }
})

// Registra a nossa rota de geocoding e outras
fastify.register(geocodingRoutes);
fastify.register(usuariosRoutes);
fastify.register(entregasRoutes);
fastify.register(rotasRoutes);
fastify.register(veiculosRoutes);

// Run the server!
; (async () => {
    try {
        await fastify.listen({ port: 3001 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()