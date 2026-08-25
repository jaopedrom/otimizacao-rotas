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
import { Progress } from "@/src/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Plus, Trash2, Check, ChevronsUpDown, MapPin, Loader2, Save, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useDebounce } from "use-debounce";

import { getVeiculosAction, getClientesAction, salvarLoteAction, getDepositosAction } from "./actions";
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
    const [openVeiculosMulti, setOpenVeiculosMulti] = useState(false);
    const [loadingVeiculos, setLoadingVeiculos] = useState(false);

    const [depositos, setDepositos] = useState<any[]>([]);
    const [openDeposito, setOpenDeposito] = useState(false);
    const [depositoIdSelecionado, setDepositoIdSelecionado] = useState<string>("");

    const [salvando, setSalvando] = useState(false);

    const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo_entrega: "multi-entrega",
            veiculoId: "",
            veiculosIds: [],
            clienteId: "",
            produtos: [{ quantidade: 1, peso_unitario: 50, descricao: "" }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "produtos",
    });

    const watchVeiculoId = watch("veiculoId");
    const watchVeiculosIds = watch("veiculosIds") || [];
    const watchClienteId = watch("clienteId");
    const watchTipoEntrega = watch("tipo_entrega");
    const watchProdutos = watch("produtos");

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
            
        getDepositosAction()
            .then(data => {
                if (Array.isArray(data)) setDepositos(data);
            })
            .catch(err => console.error("Erro ao carregar depositos", err));
    }, []);

    function onSubmit(data: FormValues) {
        const clienteSelecionado = clientes.find(c => c.usr_id === data.clienteId);
        
        let veiculoNome;
        if (data.tipo_entrega === "unica-entrega") {
            veiculoNome = veiculos.find(v => v.veiculo_id === data.veiculoId)?.veiculo_nome;
        } else {
            veiculoNome = "Múltiplos Veículos"; // Simplificacao para display
        }

        if (!clienteSelecionado || !clienteSelecionado.lat || !clienteSelecionado.lng) {
            alert("O cliente selecionado não possui um endereço válido ou geocodificado no cadastro.");
            return;
        }

        const novaEntrega: EntregaItem = {
            id: crypto.randomUUID(),
            veiculoId: data.tipo_entrega === "unica-entrega" ? data.veiculoId : undefined,
            veiculosIds: data.tipo_entrega === "multi-entrega" ? data.veiculosIds : undefined,
            veiculoNome: veiculoNome,
            clienteId: data.clienteId,
            clienteNome: clienteSelecionado.usr_nome,
            enderecoDigitado: clienteSelecionado.endereco_digitado || "Endereço Desconhecido",
            lat: clienteSelecionado.lat,
            lng: clienteSelecionado.lng,
            produtos: data.produtos,
        };

        setEntregas([...entregas, novaEntrega]);

        // Limpar form para a próxima (mantém veículo se quiser)
        reset({
            tipo_entrega: data.tipo_entrega,
            veiculoId: data.veiculoId,
            veiculosIds: data.veiculosIds,
            clienteId: "",
            produtos: [{ quantidade: 1, peso_unitario: 50, descricao: "" }]
        });
    }

    function removerEntrega(id: string) {
        setEntregas(entregas.filter(e => e.id !== id));
    }

    async function salvarLote() {
        if (entregas.length === 0 || !depositoIdSelecionado) return;
        setSalvando(true);

        try {
            // Coletar todos os veículos selecionados em todas as entregas do lote
            const allVeiculosIdsSet = new Set<string>();
            entregas.forEach(e => {
                if (e.veiculoId) allVeiculosIdsSet.add(e.veiculoId);
                if (e.veiculosIds) e.veiculosIds.forEach(id => allVeiculosIdsSet.add(id));
            });
            const allVeiculosIds = Array.from(allVeiculosIdsSet);

            const success = await salvarLoteAction(entregas, allVeiculosIds, depositoIdSelecionado);

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

    // Cálculos de capacidade e carga
    const veiculosDisponiveis = veiculos.filter(v => v.disponivel);

    let capacidadeTotal = 0;
    let cargaBackend = 0;

    if (watchTipoEntrega === "unica-entrega" && watchVeiculoId) {
        const v = veiculosDisponiveis.find(v => v.veiculo_id === watchVeiculoId);
        if (v) {
            capacidadeTotal = v.veiculo_capacidade || 0;
            cargaBackend = v.carga_atual || 0;
        }
    } else if (watchTipoEntrega === "multi-entrega" && watchVeiculosIds.length > 0) {
        watchVeiculosIds.forEach(id => {
            const v = veiculosDisponiveis.find(v => v.veiculo_id === id);
            if (v) {
                capacidadeTotal += (v.veiculo_capacidade || 0);
                cargaBackend += (v.carga_atual || 0);
            }
        });
    }

    const cargaFormulario = watchProdutos?.reduce((acc, p) => acc + (Number(p.quantidade || 0) * Number(p.peso_unitario || 0)), 0) || 0;

    const cargaLote = entregas.reduce((acc, entrega) => {
        let match = false;
        if (watchTipoEntrega === "unica-entrega" && entrega.veiculoId === watchVeiculoId) {
            match = true;
        } else if (watchTipoEntrega === "multi-entrega") {
            // Conta todas as entregas do lote que estão associadas a algum dos veículos selecionados
            if (entrega.veiculosIds?.some(id => watchVeiculosIds.includes(id))) {
                match = true;
            }
        }
        
        if (match) {
            return acc + entrega.produtos.reduce((pAcc, p) => pAcc + (p.quantidade * p.peso_unitario), 0);
        }
        return acc;
    }, 0);

    const cargaTotalAtual = cargaBackend + cargaLote + cargaFormulario;
    let porcentagemOcupacao = 0;
    if (capacidadeTotal > 0) {
        porcentagemOcupacao = Math.min((cargaTotalAtual / capacidadeTotal) * 100, 100);
    }
    
    const sobrecarga = capacidadeTotal > 0 && cargaTotalAtual > capacidadeTotal;
    const mostraProgressBar = capacidadeTotal > 0;

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

                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="depositoId">Selecione o Depósito (Origem)</Label>
                                <Popover open={openDeposito} onOpenChange={setOpenDeposito}>
                                    <PopoverTrigger render={
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openDeposito}
                                            className={cn("justify-between", !depositoIdSelecionado && "text-muted-foreground")}
                                        />
                                    }>
                                        {depositoIdSelecionado
                                            ? depositos.find(d => d.deposito_id === depositoIdSelecionado)?.dep_nome
                                            : "Selecione um depósito..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar depósito..." />
                                            <CommandList>
                                                <CommandEmpty>Nenhum depósito disponível.</CommandEmpty>
                                                {depositos.map((deposito) => (
                                                    <CommandItem
                                                        key={deposito.deposito_id}
                                                        value={deposito.dep_nome}
                                                        onSelect={() => {
                                                            setDepositoIdSelecionado(deposito.deposito_id);
                                                            setOpenDeposito(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                depositoIdSelecionado === deposito.deposito_id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {deposito.dep_nome}
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

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
                                                ? veiculosDisponiveis.find(v => v.veiculo_id === watchVeiculoId)?.veiculo_nome
                                                : loadingVeiculos ? "Carregando..." : "Selecione um veiculo..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar veiculo..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum veiculo disponível.</CommandEmpty>
                                                    {veiculosDisponiveis.map((veiculo) => (
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
                                                            {veiculo.veiculo_nome} ({veiculo.veiculo_capacidade}kg)
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}

                            {watchTipoEntrega === "multi-entrega" && (
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="veiculosIds">Selecione os veículos</Label>
                                    <Popover open={openVeiculosMulti} onOpenChange={setOpenVeiculosMulti}>
                                        <PopoverTrigger render={
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openVeiculosMulti}
                                                className={cn("justify-between", watchVeiculosIds.length === 0 && "text-muted-foreground")}
                                                disabled={loadingVeiculos}
                                            />
                                        }>
                                            {watchVeiculosIds.length > 0
                                                ? `${watchVeiculosIds.length} selecionado(s)`
                                                : loadingVeiculos ? "Carregando..." : "Selecione veículos..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar veiculo..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhum veiculo disponível.</CommandEmpty>
                                                    {veiculosDisponiveis.map((veiculo) => (
                                                        <CommandItem
                                                            key={veiculo.veiculo_id}
                                                            value={veiculo.veiculo_nome}
                                                            onSelect={() => {
                                                                const current = watchVeiculosIds;
                                                                const isSelected = current.includes(veiculo.veiculo_id);
                                                                if (isSelected) {
                                                                    setValue("veiculosIds", current.filter(id => id !== veiculo.veiculo_id));
                                                                } else {
                                                                    setValue("veiculosIds", [...current, veiculo.veiculo_id]);
                                                                }
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    watchVeiculosIds.includes(veiculo.veiculo_id)
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {veiculo.veiculo_nome} ({veiculo.veiculo_capacidade}kg)
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}

                            {mostraProgressBar && (
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                        <span>Carga Calculada: {cargaTotalAtual.toFixed(2)}kg</span>
                                        <span>Limite: {capacidadeTotal}kg</span>
                                    </div>
                                    <Progress value={porcentagemOcupacao} className={cn("h-2", sobrecarga && "[&>div]:bg-red-500")} />
                                </div>
                            )}

                            {sobrecarga && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Sobrecarga Detectada</AlertTitle>
                                    <AlertDescription>
                                        O limite de peso foi ultrapassado. Você ainda pode adicionar o item à lista; a API tentará balancear a carga automaticamente depois.
                                    </AlertDescription>
                                </Alert>
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
                                {watchClienteId && (
                                    <div className="text-sm p-3 bg-muted/30 border rounded-md text-muted-foreground flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {clientes.find(c => c.usr_id === watchClienteId)?.endereco_digitado || "Cliente não tem endereço salvo."}
                                    </div>
                                )}
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
                            disabled={entregas.length === 0 || salvando || !depositoIdSelecionado}
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
