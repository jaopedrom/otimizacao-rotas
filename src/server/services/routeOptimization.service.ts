// src/server/services/routeOptimization.service.ts

interface LatLng {
    latitude: number;
    longitude: number;
}

export interface DeliveryShipment {
    id: string;
    location: LatLng;
    weight: number;
}

export interface VehicleCapacity {
    id: string;
    maxWeight: number;
    startLocation: LatLng;
}

export interface OptimizationResult {
    routes: Array<{
        vehicleId: string;
        stops: Array<{
            deliveryId: string;
            sequence: number;
        }>;
        totalDistanceMeters: number;
        totalDurationSeconds: number;
    }>;
}

export async function optimizeRoutes(
    shipments: DeliveryShipment[],
    vehicles: VehicleCapacity[]
): Promise<OptimizationResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY não configurada no .env");
    }

    // A API de Route Optimization (Fleet Routing) espera um Project ID na URL. 
    // Muitas vezes podemos omitir usando "-" se usarmos uma API Key com as devidas permissões, 
    // mas se der erro "Project Not Found", precisamos definir GOOGLE_CLOUD_PROJECT_ID no .env.
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "-";
    const url = `https://routeoptimization.googleapis.com/v1/projects/${projectId}:optimizeTours?key=${apiKey}`;

    // Montar payload do Fleet Routing API
    const googleShipments = shipments.map((shipment, index) => ({
        deliveries: [{
            arrivalLocation: {
                latLng: shipment.location
            }
        }],
        loadDemands: {
            "weight": {
                amount: shipment.weight.toString()
            }
        },
        label: shipment.id // Usamos a label para rastrear o ID da nossa entrega
    }));

    const googleVehicles = vehicles.map(vehicle => ({
        startLocation: {
            latLng: vehicle.startLocation
        },
        endLocation: {
            latLng: vehicle.startLocation // Assumimos que retorna ao depósito
        },
        loadLimits: {
            "weight": {
                maxLoad: vehicle.maxWeight.toString()
            }
        },
        label: vehicle.id
    }));

    const payload = {
        model: {
            shipments: googleShipments,
            vehicles: googleVehicles,
            globalStartTime: new Date().toISOString()
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Google Route Optimization API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    
    // Parse the response back into our domain format
    const result: OptimizationResult = { routes: [] };

    if (!data.routes) {
        return result; // Nenhuma rota gerada
    }

    for (const route of data.routes) {
        // vehicleIndex diz qual veiculo fez a rota (baseado na ordem enviada)
        const vIndex = route.vehicleIndex || 0;
        const vehicleId = vehicles[vIndex].id;
        
        const stops = [];
        let sequence = 1;
        
        if (route.visits) {
            for (const visit of route.visits) {
                const shipmentIndex = visit.shipmentIndex;
                const deliveryId = shipments[shipmentIndex].id;
                stops.push({
                    deliveryId,
                    sequence: sequence++
                });
            }
        }

        let distanceMeters = 0;
        let durationSeconds = 0;
        
        if (route.metrics) {
            distanceMeters = route.metrics.travelDistanceMeters || 0;
            const dur = route.metrics.travelDuration || "0s";
            durationSeconds = parseInt(dur.replace("s", ""), 10) || 0;
        }

        result.routes.push({
            vehicleId,
            stops,
            totalDistanceMeters: distanceMeters,
            totalDurationSeconds: durationSeconds
        });
    }

    return result;
}
