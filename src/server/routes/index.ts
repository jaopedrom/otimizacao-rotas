// src/server/routes/index.ts
import { FastifyInstance } from "fastify";
import { geocodingRoutes } from "./geocoding.route";
import { usuariosRoutes } from "./usuarios.routes";
import { entregasRoutes } from "./entregas.routes";
import { veiculosRoutes } from "./veiculos.routes";
import {authRoutes} from "@/src/server/routes/auth.route";
import {empresaRoutes} from "@/src/server/routes/empresa.route";
import authPlugin from "@/src/server/plugins/auth.plugin";
import {meRoutes} from "@/src/server/routes/me.routes";

export async function registerRoutes(fastify: FastifyInstance) {
    fastify.register(geocodingRoutes);
    fastify.register(usuariosRoutes);
    fastify.register(entregasRoutes);
    fastify.register(veiculosRoutes);
    fastify.register(authRoutes);
    fastify.register(empresaRoutes);
    fastify.register(authPlugin);
    fastify.register(meRoutes);

}