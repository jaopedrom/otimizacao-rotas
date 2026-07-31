"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/src/components/ui/command";
import { RadioButton } from "@/src/components/radio-button";
import { Plus, Trash2, Check, ChevronsUpDown, MapPin, Loader2, Save } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useDebounce } from "use-debounce";

import { getVeiculosAction, getClientesAction, searchEnderecoAction, salvarLoteAction } from "./actions";
import { Cliente } from "@/src/server/schemas/usuarios.schema";
import { Veiculo } from "@/src/server/schemas/veiculos.schema";
import { EntregaItem, ProdutoItem, novaEntregaFormSchema as formSchema, NovaEntregaFormValues as FormValues } from "@/src/server/schemas/entregas.schema";

export default function NovaEntrega() {
    const [entregas, setEntregas] = useState<EntregaItem[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [openCliente, setOpenCliente] = useState(false);
    const [loadingClientes, setLoadingClientes] = useState(false);

    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [openVeiculo, setOpenVeiculo] = useState(false);
    const [loadingVeiculos, setLoadingVeiculos] = useState(false);

    const [enderecoQuery, setEnderecoQuery] = useState("");
    const [debouncedEnderecoQuery] = useDebounce(enderecoQuery, 500);
    const [enderecoResultados, setEnderecoResultados] = useState<any[]>([]);
    const [openEndereco, setOpenEndereco] = useState(false);
    const [loadingEndereco, setLoadingEndereco] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo_entrega: "multi-entrega",
            veiculoId: "",
            clienteId: "",
            enderecoDigitado: "",
            produtos: [{ quantidade: 1, peso_unitario: 50, descricao: "" }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "produtos",
    });

    const watchVeiculoId = watch("veiculoId");
    const watchClienteId = watch("clienteId");
    const watchEndereco = watch("enderecoDigitado");
    const watchTipoEntrega = watch("tipo_entrega");

    useEffect(() => {
        setLoadingVeiculos(true);
        getVeiculosAction()
            .then(data => {
                if (Array.isArray(data)) setVeiculos(data);
            })
            .catch(err => console.error("Erro ao carregar veículos", err))
            .finally(() => setLoadingVeiculos(false));

        setLoadingClientes(true);
        getClientesAction()
            .then(data => {
                if (Array.isArray(data)) setClientes(data);
            })
            .catch(err => console.error("Erro ao carregar clientes", err))
            .finally(() => setLoadingClientes(false));
    }, []);

    useEffect(() => {
        // Buscar endereços
        if (debouncedEnderecoQuery && debouncedEnderecoQuery.length > 3) {
            setLoadingEndereco(true);
            searchEnderecoAction(debouncedEnderecoQuery)
                .then(data => {
                    setEnderecoResultados(data);
                    setOpenEndereco(true);
                })
                .catch(err => console.error("Erro na busca de endereço", err))
                .finally(() => setLoadingEndereco(false));
        } else {
            setEnderecoResultados([]);
            setOpenEndereco(false);
        }
    }, [debouncedEnderecoQuery]);

    function onSubmit(data: FormValues) {
        const clienteSelecionado = clientes.find(c => c.usr_id === data.clienteId);
        const veiculoSelecionado = veiculos.find(v => v.veiculo_id === data.veiculoId);

        const novaEntrega: EntregaItem = {
            id: crypto.randomUUID(),
            veiculoId: data.veiculoId,
            veiculoNome: veiculoSelecionado?.veiculo_nome,
            clienteId: data.clienteId,
            clienteNome: clienteSelecionado?.usr_nome || "Cliente Desconhecido",
            enderecoDigitado: data.enderecoDigitado,
            lat: data.lat,
            lng: data.lng,
            produtos: data.produtos,
        };

        setEntregas([...entregas, novaEntrega]);

        // Limpar form para a próxima (mantém cliente e veículo se quiser)
        reset({
            tipo_entrega: data.tipo_entrega,
            veiculoId: data.veiculoId,
            clienteId: data.clienteId,
            enderecoDigitado: "",
            produtos: [{ quantidade: 1, peso_unitario: 50, descricao: "" }]
        });
        setEnderecoQuery("");
    }

    function removerEntrega(id: string) {
        setEntregas(entregas.filter(e => e.id !== id));
    }

    async function salvarLote() {
        if (entregas.length === 0) return;
        setSalvando(true);

        try {
            const success = await salvarLoteAction(entregas);

            if (success) {
                alert("Entregas salvas com sucesso!");
                setEntregas([]); // limpar lista
            } else {
                alert("Erro: Falha ao salvar entregas");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao salvar entregas.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novas Entregas</h1>
                <p className="text-muted-foreground">Adicione entregas à lista para otimização em lote.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* FORMULÁRIO */}
                <Card>
                    <CardHeader>
                        <CardTitle>Adicionar Entrega</CardTitle>
                        <CardDescription>Preencha os dados e adicione à lista ao lado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label>Escolha o tipo de entrega</Label>
                        <br />
                        <RadioButton
                            options={[
                                { value: "multi-entrega", label: "Multi-Entrega" },
                                { value: "unica-entrega", label: "Única Entrega" },
                            ]}
                            value={watchTipoEntrega}
                            onValueChange={(value) => setValue("tipo_entrega", value as "multi-entrega" | "unica-entrega")}
                        />

                    </CardContent>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {watchTipoEntrega === "unica-entrega" && (
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="veiculoId">Selecione o veiculo</Label>
                                    <Popover open={openVeiculo} onOpenChange={setOpenVeiculo}>
                                        <PopoverTrigger render={
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openVeiculo}
                                                className={cn("justify-between", !watchVeiculoId && "text-muted-foreground")}
                                                disabled={loadingVeiculos}
                                            />
                                        }>
                                            {watchVeiculoId
                                                ? veiculos.find(v => v.veiculo_id === watchVeiculoId)?.veiculo_nome
                                                : loadingVeiculos ? "Carregando..." : "Selecione um veiculo..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar veiculo..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum veiculo encontrado.</CommandEmpty>
                                                    {veiculos.map((veiculo) => (
                                                        <CommandItem
                                                            key={veiculo.veiculo_id}
                                                            value={veiculo.veiculo_nome}
                                                            onSelect={() => {
                                                                setValue("veiculoId", veiculo.veiculo_id)
                                                                setOpenVeiculo(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    watchVeiculoId === veiculo.veiculo_id
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {veiculo.veiculo_nome}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}

                            {/* CLIENTE (Combobox) */}
                            <div className="flex flex-col space-y-2">

                                <Label htmlFor="clienteId">Cliente</Label>
                                <Popover open={openCliente} onOpenChange={setOpenCliente}>
                                    <PopoverTrigger render={
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCliente}
                                            className={cn("justify-between", !watchClienteId && "text-muted-foreground")}
                                            disabled={loadingClientes}
                                        />
                                    }>
                                        {watchClienteId
                                            ? clientes.find(c => c.usr_id === watchClienteId)?.usr_nome
                                            : loadingClientes ? "Carregando..." : "Selecione um cliente..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar cliente..." />
                                            <CommandList>
                                                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    {clientes.map((cliente) => (
                                                        <CommandItem
                                                            key={cliente.usr_id}
                                                            value={cliente.usr_nome}
                                                            onSelect={() => {
                                                                setValue("clienteId", cliente.usr_id);
                                                                setOpenCliente(false);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", cliente.usr_id === watchClienteId ? "opacity-100" : "opacity-0")} />
                                                            {cliente.usr_nome}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.clienteId && <p className="text-sm font-medium text-destructive">{errors.clienteId.message}</p>}
                            </div>

                            {/* PRODUTOS / SACAS */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base">Produtos da Entrega</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ quantidade: 1, peso_unitario: 50, descricao: "" })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Saca
                                    </Button>
                                </div>
                                {errors.produtos?.root && <p className="text-sm font-medium text-destructive">{errors.produtos.root.message}</p>}

                                {fields.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md bg-muted/20 relative">
                                        <div className="col-span-3">
                                            <Label className="text-xs">Qtd</Label>
                                            <Input type="number" min={1} {...register(`produtos.${index}.quantidade`, { valueAsNumber: true })} />
                                            {errors.produtos?.[index]?.quantidade && <p className="text-[10px] text-destructive">{errors.produtos[index]?.quantidade?.message}</p>}
                                        </div>
                                        <div className="col-span-4">
                                            <Label className="text-xs">Peso Un. (kg)</Label>
                                            <Input type="number" step="0.01" min={0.1} {...register(`produtos.${index}.peso_unitario`, { valueAsNumber: true })} />
                                            {errors.produtos?.[index]?.peso_unitario && <p className="text-[10px] text-destructive">{errors.produtos[index]?.peso_unitario?.message}</p>}
                                        </div>
                                        <div className="col-span-4">
                                            <Label className="text-xs">Descrição</Label>
                                            <Input placeholder="Ex: Milho" {...register(`produtos.${index}.descricao`)} />
                                        </div>
                                        <div className="col-span-1 flex items-end justify-center pb-1">
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {/* ENDEREÇO (Autocomplete Nominatim) */}
                            <div className="flex flex-col space-y-2 relative">
                                <Label htmlFor="enderecoDigitado">Endereço de Destino</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="enderecoDigitado"
                                        placeholder="Digite para buscar endereço..."
                                        className="pl-9"
                                        value={enderecoQuery || watchEndereco || ""}
                                        onChange={(e) => {
                                            setEnderecoQuery(e.target.value);
                                            setValue("enderecoDigitado", ""); // limpa o real value até selecionar
                                        }}
                                    />
                                    {loadingEndereco && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                                </div>

                                {/* Dropdown de Resultados do Nominatim */}
                                {openEndereco && enderecoResultados.length > 0 && (
                                    <div className="absolute top-[70px] left-0 right-0 z-50 bg-popover border border-border rounded-md shadow-md max-h-[250px] overflow-auto">
                                        {enderecoResultados.map((res, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-muted cursor-pointer text-sm"
                                                onClick={() => {
                                                    setValue("enderecoDigitado", res.displayName);
                                                    setValue("lat", res.lat);
                                                    setValue("lng", res.lng);
                                                    setEnderecoQuery(res.displayName);
                                                    setOpenEndereco(false);
                                                }}
                                            >
                                                {res.displayName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.enderecoDigitado && <p className="text-sm font-medium text-destructive">{errors.enderecoDigitado.message}</p>}
                            </div>

                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar à Lista
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* LISTA EM LOTE */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Entregas na Lista</CardTitle>
                        <CardDescription>
                            {entregas.length} {entregas.length === 1 ? 'entrega pendente' : 'entregas pendentes'}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        {entregas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12 text-center">
                                <MapPin className="h-12 w-12 mb-4 opacity-20" />
                                <p>Nenhuma entrega adicionada.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Destino</TableHead>
                                        <TableHead>Peso Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entregas.map((entrega) => {
                                        const pesoTotal = entrega.produtos.reduce((acc, p) => acc + (p.quantidade * p.peso_unitario), 0);
                                        return (
                                            <TableRow key={entrega.id}>
                                                <TableCell className="font-medium max-w-[100px] truncate" title={entrega.clienteNome}>
                                                    {entrega.clienteNome}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate text-xs" title={entrega.enderecoDigitado}>
                                                    {entrega.enderecoDigitado}
                                                </TableCell>
                                                <TableCell>
                                                    {pesoTotal} kg
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removerEntrega(entrega.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={entregas.length === 0 || salvando}
                            onClick={salvarLote}
                        >
                            {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Lote de Entregas
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
