// src/server/routes/index.ts
import { FastifyInstance } from "fastify";
import { geocodingRoutes } from "./geocoding.route";
import { usuariosRoutes } from "./usuarios.routes";
import { entregasRoutes } from "./entregas.routes";
import { veiculosRoutes } from "./veiculos.routes";

export async function registerRoutes(fastify: FastifyInstance) {
    fastify.register(geocodingRoutes);
    fastify.register(usuariosRoutes);
    fastify.register(entregasRoutes);
    fastify.register(veiculosRoutes);
}