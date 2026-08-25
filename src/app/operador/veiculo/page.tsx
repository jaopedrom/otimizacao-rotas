"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { createVeiculo, createVeiculoSchema, createVeiculoInput } from "@/src/server/schemas/veiculos.schema";
import { SwitchDemo } from "@/src/components/ui/switch-button";
import { criarVeiculosAction } from "@/src/app/operador/veiculo/actions";

export default function CadastroVeiculoPage() {
    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } =
        useForm<createVeiculoInput, any, createVeiculo>({
        resolver: zodResolver(createVeiculoSchema),
        defaultValues: {
            veiculo_nome: "",
            veiculo_placa: "",
            veiculo_capacidade: "" as unknown as number,
            veiculo_ativo: true,
        },
    });

    const veiculoAtivo = watch("veiculo_ativo");

    async function onSubmit(data: createVeiculo) {
        try {
            const result = await criarVeiculosAction(data);
            if (result.success !== false) {
                alert("Veiculo criado com sucesso");
                reset();
            } else {
                alert(`Erro: ${result.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar veiculo");
        }
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Veiculos</h1>
            <p className="text-gray-600 mb-6">
                pagina de cadastro de veiculo
            </p>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Cadastro de Veiculo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="veiculo_nome">Nome Fantasia</Label>
                                <Input id="veiculo_nome" placeholder="Ex: Caminhao Vermelho" {...register("veiculo_nome")} />
                                {errors.veiculo_nome && <p className="text-sm text-destructive">{errors.veiculo_nome.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="veiculo_placa">Placa</Label>
                                <Input id="veiculo_placa" placeholder="GJR0220" {...register("veiculo_placa")} />
                                {errors.veiculo_placa && <p className="text-sm text-destructive">{errors.veiculo_placa.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="veiculo_capacidade">Capacidade em Kg</Label>
                                <Input id="veiculo_capacidade" placeholder="10.000" {...register("veiculo_capacidade")} />
                                {errors.veiculo_capacidade && <p className="text-sm text-destructive">{errors.veiculo_capacidade.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="veiculo_ativo">Status</Label>
                                <SwitchDemo
                                    text="Ativar veiculo"
                                    checked={veiculoAtivo}
                                    onCheckedChange={(checked: boolean) => setValue("veiculo_ativo", checked)}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-6 border-t flex justify-end">
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : <Save className="mr-2 h-4 w-4" />}
                            Salvar Veiculo
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}