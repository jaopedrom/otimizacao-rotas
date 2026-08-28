"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Loader2, Save, Search, MapPin } from "lucide-react";
import { createUsuarioSchema, CreateUsuarioType } from "@/src/server/schemas/usuario.schema";
import { criarClienteAction, searchEnderecoAction } from "./actions";

export default function ClientePage() {
    const [salvando, setSalvando] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [buscandoGeo, setBuscandoGeo] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<CreateUsuarioType>({
        resolver: zodResolver(createUsuarioSchema),
        defaultValues: {
            nome: "",
            email: "",
            telefone: "",
            cep: "",
            logradouro: "",
            bairro: "",
            cidade: "",
            estado: "",
            numero: "",
            complemento: "",
        },
    });

    const watchCep = watch("cep");
    const watchLogradouro = watch("logradouro");
    const watchCidade = watch("cidade");
    const watchEstado = watch("estado");
    const watchNumero = watch("numero");
    const watchLat = watch("lat");

    async function buscarCep() {
        const cepLimpo = watchCep?.replace(/\D/g, '');
        if (cepLimpo?.length !== 8) {
            alert("CEP inválido");
            return;
        }

        setBuscandoCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            
            if (data.erro) {
                alert("CEP não encontrado");
                return;
            }

            setValue("logradouro", data.logradouro);
            setValue("bairro", data.bairro);
            setValue("cidade", data.localidade);
            setValue("estado", data.uf);
            
            buscarGeolocalizacao(`${data.logradouro}, ${data.localidade} - ${data.uf}`);
        } catch (error) {
            console.error(error);
            alert("Erro ao buscar CEP");
        } finally {
            setBuscandoCep(false);
        }
    }

    async function buscarGeolocalizacao(enderecoBase: string) {
        setBuscandoGeo(true);
        try {
            const resultados = await searchEnderecoAction(enderecoBase);
            if (resultados && resultados.length > 0) {
                setValue("lat", Number(resultados[0].lat));
                setValue("lng", Number(resultados[0].lng));
            }
        } catch (error) {
            console.error("Erro na geolocalização", error);
        } finally {
            setBuscandoGeo(false);
        }
    }

    async function onBlurNumero() {
        if (watchLogradouro && watchCidade && watchNumero) {
            buscarGeolocalizacao(`${watchLogradouro}, ${watchNumero} - ${watchCidade} - ${watchEstado}`);
        }
    }

    async function onSubmit(data: CreateUsuarioType) {
        if (!data.lat || !data.lng) {
            alert("Não foi possível obter a Latitude/Longitude. Verifique o endereço e número.");
            return;
        }

        setSalvando(true);
        try {
            const result = await criarClienteAction(data);
            if (result.success) {
                alert("Cliente cadastrado com sucesso!");
                reset();
            } else {
                alert(`Erro: ${result.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar cliente");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cadastro de Cliente</h1>
                <p className="text-muted-foreground">Registre um novo cliente e suas coordenadas de entrega.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input id="nome" placeholder="Ex: João da Silva" {...register("nome")} />
                                {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail (Opcional)</Label>
                                <Input id="email" type="email" placeholder="joao@email.com" {...register("email")} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone (Opcional)</Label>
                                <Input id="telefone" placeholder="(11) 99999-9999" {...register("telefone")} />
                                {errors.telefone && <p className="text-sm text-destructive">{errors.telefone.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <h3 className="text-lg font-medium">Endereço de Entrega</h3>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input id="cep" placeholder="Apenas números (Ex: 01001000)" {...register("cep")} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="button" variant="secondary" onClick={buscarCep} disabled={buscandoCep}>
                                        {buscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                        Buscar CEP
                                    </Button>
                                </div>
                            </div>
                            {errors.cep && <p className="text-sm text-destructive">{errors.cep.message}</p>}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="logradouro">Logradouro (Rua)</Label>
                                <Input id="logradouro" {...register("logradouro")} readOnly className="bg-muted" />
                            </div>
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input id="numero" {...register("numero")} onBlur={onBlurNumero} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" {...register("bairro")} readOnly className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" {...register("cidade")} readOnly className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado (UF)</Label>
                                <Input id="estado" {...register("estado")} readOnly className="bg-muted" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="complemento">Complemento (Opcional)</Label>
                            <Input id="complemento" placeholder="Apto, Bloco..." {...register("complemento")} />
                        </div>

                        {watchLat && (
                            <div className="bg-blue-50/50 p-3 rounded-md flex items-center text-sm text-blue-700 mt-4 border border-blue-100">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>Coordenadas identificadas: Latitude {watchLat.toFixed(4)}, Longitude {watch("lng")?.toFixed(4)}</span>
                            </div>
                        )}
                        {buscandoGeo && <div className="text-sm text-muted-foreground flex items-center mt-4"><Loader2 className="h-3 w-3 animate-spin mr-2" /> Ajustando coordenadas via GPS...</div>}

                    </CardContent>
                    <CardFooter className="pt-6 border-t flex justify-end">
                        <Button type="submit" disabled={salvando || buscandoCep || !watchLat} className="w-full sm:w-auto">
                            {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Cliente
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
