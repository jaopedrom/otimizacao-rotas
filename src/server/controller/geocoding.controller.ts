// src/server/controller/geocoding.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { searchAddress } from "../services/geocoding.service";
import { GeocodeQuery } from "../schemas/geocoding.schema";

export async function searchAddressController(
    request: FastifyRequest<{ Querystring: GeocodeQuery }>,
    reply: FastifyReply
) {
    const { address } = request.query;

    const candidates = await searchAddress(address);

    if (candidates.length === 0) {
        return reply.status(404).send({ message: "Nenhum endereço encontrado" });
    }

    return reply.status(200).send(candidates);
}