"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { MapPin, Truck, CheckCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { getEntregasEmAndamentoAction, finalizarRotaAction } from "./actions";

export default function EntregasEmAndamento() {
    const [rotas, setRotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [finalizandoId, setFinalizandoId] = useState<string | null>(null);

    const carregarRotas = async () => {
        setLoading(true);
        try {
            const data = await getEntregasEmAndamentoAction();
            setRotas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarRotas();
    }, []);

    const handleFinalizar = async (rotaId: string) => {
        if (!confirm("Tem certeza que deseja finalizar toda a rota deste veículo? Ele será liberado para novas entregas.")) return;
        
        setFinalizandoId(rotaId);
        try {
            const success = await finalizarRotaAction(rotaId);
            if (success) {
                alert("Rota finalizada com sucesso! Veículo liberado.");
                carregarRotas();
            } else {
                alert("Erro ao finalizar a rota.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao finalizar a rota.");
        } finally {
            setFinalizandoId(null);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-6xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entregas em Andamento</h1>
                    <p className="text-muted-foreground">Monitore os veículos em rota e finalize as entregas.</p>
                </div>
                <Button variant="outline" onClick={carregarRotas} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-primary" />
                        Veículos em Rota
                    </CardTitle>
                    <CardDescription>
                        Lista de todos os veículos que estão atualmente realizando entregas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Carregando rotas...</p>
                        </div>
                    ) : rotas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mb-4 text-green-500/50" />
                            <p>Nenhuma entrega em andamento no momento.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Veículo</TableHead>
                                        <TableHead>Placa</TableHead>
                                        <TableHead>Paradas</TableHead>
                                        <TableHead>Peso Total</TableHead>
                                        <TableHead>Clientes (Resumo)</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rotas.map((rota) => (
                                        <TableRow key={rota.id}>
                                            <TableCell className="font-medium">
                                                {rota.veiculo?.nome || "Desconhecido"}
                                            </TableCell>
                                            <TableCell>{rota.veiculo?.placa || "N/A"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                                                    {rota.qtdEntregas}
                                                </div>
                                            </TableCell>
                                            <TableCell>{rota.pesoTotal} kg</TableCell>
                                            <TableCell className="max-w-[200px] truncate text-xs" title={rota.clientesResumo}>
                                                {rota.clientesResumo || "-"}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {rota.mapsUrl && (
                                                    <Button variant="outline" size="sm" render={<a href={rota.mapsUrl} target="_blank" rel="noopener noreferrer" />}>
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        Maps
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="default" 
                                                    size="sm" 
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={finalizandoId === rota.id}
                                                    onClick={() => handleFinalizar(rota.id)}
                                                >
                                                    {finalizandoId === rota.id ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                    )}
                                                    Finalizar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
