// src/server/services/geocoding.service.ts
import { GeocodeCandidate, geocodeCandidateSchema } from "../schemas/geocoding.schema";
import { z } from "zod";

export async function searchAddress(address: string): Promise<GeocodeCandidate[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY não configurada no .env");
    }

    const params = new URLSearchParams({
        address,
        components: "country:BR",
        key: apiKey,
    });

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);

    if (!response.ok) {
        throw new Error(`Erro ao consultar Google Maps Geocoding API: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Maps API error: ${data.status} - ${data.error_message || ''}`);
    }

    const candidates = (data.results || []).slice(0, 5).map((item: any) => ({
        lat: item.geometry.location.lat,
        lng: item.geometry.location.lng,
        displayName: item.formatted_address,
    }));

    return z.array(geocodeCandidateSchema).parse(candidates);
}