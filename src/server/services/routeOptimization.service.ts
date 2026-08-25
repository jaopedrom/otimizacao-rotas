import { RouteOptimizationClient } from '@googlemaps/routeoptimization';

// A inicialização padrão pega as credenciais de GOOGLE_APPLICATION_CREDENTIALS
const routeOptimizationClient = new RouteOptimizationClient();

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
        mapsUrl?: string;
    }>;
}

export async function optimizeRoutes(
    shipments: DeliveryShipment[],
    vehicles: VehicleCapacity[]
): Promise<OptimizationResult> {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (!projectId) {
        throw new Error("GOOGLE_CLOUD_PROJECT_ID não configurado no .env");
    }

    // Montar payload do Fleet Routing API
    const googleShipments = shipments.map((shipment) => ({
        deliveries: [{
            arrivalLocation: {
                latitude: shipment.location.latitude,
                longitude: shipment.location.longitude
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
            latitude: vehicle.startLocation.latitude,
            longitude: vehicle.startLocation.longitude
        },
        endLocation: {
            latitude: vehicle.startLocation.latitude, // Assumimos que retorna ao depósito
            longitude: vehicle.startLocation.longitude
        },
        loadLimits: {
            "weight": {
                maxLoad: vehicle.maxWeight.toString()
            }
        },
        label: vehicle.id
    }));

    const request = {
        parent: `projects/${projectId}`,
        model: {
            shipments: googleShipments,
            vehicles: googleVehicles
        },
        solvingMode: 'DEFAULT_SOLVE',
    };

    const response = await routeOptimizationClient.optimizeTours(request as any);
    const data = response[0];
    
    // Parse the response back into our domain format
    const result: OptimizationResult = { routes: [] };

    if (!data.routes) {
        return result; // Nenhuma rota gerada
    }

    for (const route of data.routes) {
        // Use vehicleLabel, que contém o ID do veículo
        const vehicleId = route.vehicleLabel || vehicles[0].id;
        
        // Localizar o veículo pelo ID
        const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];
        
        const stops = [];
        let sequence = 1;
        
        if (route.visits) {
            for (const visit of route.visits) {
                // Use shipmentLabel que contém o ID da entrega
                const deliveryId = visit.shipmentLabel;
                if (deliveryId) {
                    stops.push({
                        deliveryId,
                        sequence: sequence++
                    });
                }
            }
        }

        let distanceMeters = 0;
        let durationSeconds = 0;
        
        if (route.metrics) {
            distanceMeters = Number(route.metrics.travelDistanceMeters) || 0;
            // No gRPC, duration vem como { seconds: string|number|Long, nanos: number }
            const dur = route.metrics.travelDuration;
            if (dur && dur.seconds != null) {
                durationSeconds = Number(dur.seconds);
            }
        }

        let mapsUrl: string | undefined = undefined;
        if (route.visits && route.visits.length > 0) {
            const startLat = vehicle.startLocation.latitude;
            const startLng = vehicle.startLocation.longitude;
            
            const originStr = `${startLat},${startLng}`;
            
            const visitCoords = route.visits
                .map((visit: any) => shipments.find(s => s.id === visit.shipmentLabel))
                .filter((s: any) => s !== undefined)
                .map((s: any) => `${s.location.latitude},${s.location.longitude}`);

            // O destino final deve ser a última entrega, e o resto fica nos waypoints
            const destinationStr = visitCoords[visitCoords.length - 1];
            const waypointsList = visitCoords.slice(0, -1);
            const waypointsStr = waypointsList.join('%7C'); // %7C é o pipe (|) já encoded

            let url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}`;
            if (waypointsStr) {
                url += `&waypoints=${waypointsStr}`;
            }
            url += `&travelmode=driving&dir_action=navigate`;

            mapsUrl = url;
        }

        result.routes.push({
            vehicleId,
            stops,
            totalDistanceMeters: distanceMeters,
            totalDurationSeconds: durationSeconds,
            mapsUrl
        });
    }

    return result;
}
