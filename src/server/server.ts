// Import the framework and instantiate it
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import { geocodingRoutes } from "./routes/geocoding.route";
import { usuariosRoutes } from "./routes/usuarios.routes";
import { entregasRoutes } from "./routes/entregas.routes";
import { rotasRoutes } from "./routes/rotas.route";
import { veiculosRoutes } from "./routes/veiculos.routes";
import { depositosRoutes } from "./routes/depositos.routes";
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import { loginRoutes } from "@/src/server/routes/login.route";

const fastify = Fastify({
    logger: true
})

// Adiciona validação e serialização do Zod
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

import cors from '@fastify/cors'
import {authRoutes} from "@/src/server/routes/auth.route";
import {empresaRoutes} from "@/src/server/routes/empresa.route";
import authPlugin from "@/src/server/plugins/auth.plugin";
import {meRoutes} from "@/src/server/routes/me.routes";

fastify.register(cors, {
    origin: true // permite qualquer origem (útil para desenvolvimento local)
});
fastify.register(cookie);
fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,
    cookie: {
        cookieName: "session_token",
        signed: false,
    },
});
fastify.register(authPlugin);

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
fastify.register(depositosRoutes);
fastify.register(authRoutes);
fastify.register(empresaRoutes);
fastify.register(loginRoutes);
fastify.register(meRoutes);

// Run the server!
; (async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()