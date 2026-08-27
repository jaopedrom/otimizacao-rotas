import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import {criarUsuarioController, listarClientesController} from "../controller/usuarios.controller";
import { clienteResponseSchema } from "../schemas/usuarios.schema";
import {createUsuarioSchema} from "@/src/server/schemas/usuario.schema";

export async function usuariosRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().get(
        "/clientes",
        {
            schema: {
                response: {
                    200: clienteResponseSchema,
                },
            },
        },
        listarClientesController
    );

    fastify.withTypeProvider<ZodTypeProvider>().post(
        "/usuarios",
        {
            schema: {
                // Aqui é a mágica: O Fastify valida o body automaticamente usando o seu Zod!
                body: createUsuarioSchema,

                // Opcional: Se você tiver um schema para formatar a resposta do usuário sem a senha
                // response: {
                //     201: usuarioResponseSchema
                // }
            },
        },
        criarUsuarioController
    );
}
