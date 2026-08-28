// src/app/cadastro/page.tsx
"use client";
import { useState } from "react"; // 1. Importar o useState
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, Signup } from "@/src/server/schemas/auth.schema";
import { signupAction } from "@/src/app/cadastro/actionCadastro";
import { SignupFormEmpresa } from "@/src/components/signup-form";
import { SignupFormUsuario } from "@/src/components/singup-usuario";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { AlertSucess } from "@/src/components/alerta-sucesso";
import { AlertErro } from "@/src/components/alerta-erro";

export default function CadastroPage() {
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const methods = useForm<Signup>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            empresa: {
                emp_nome: "", emp_razao_soc: "", emp_cnpj: "", emp_email: "", emp_telefone: "",
                endereco: { cep: "", logradouro: "", bairro: "", cidade: "", estado: "", numero: "", complemento: "" },
            },
            usuario: {
                usr_nome: "", usr_cpf: "", usr_email: "", usr_telefone: "",
                usr_password: "", usr_password_confirm: "", usr_dt_nascimento: "",
                endereco: { cep: "", logradouro: "", bairro: "", cidade: "", estado: "", numero: "", complemento: "", apelido: "" },
            },
        },
    });

    const { handleSubmit, formState: { isSubmitting }, reset } = methods;

    async function onSubmit(data: Signup) {
        setAlertMessage(null); // limpa o alerta anterior

        const result = await signupAction(data);

        if (result.success !== false) {
            setAlertMessage({
                type: 'success',
                message: 'Cadastro de empresa e primeiro usuário realizado com sucesso!'
            });

            reset();

            // redirecionar pra dashboard
        } else {
            setAlertMessage({
                type: 'error',
                message: result.message
            });
        }
        setTimeout(() => {
            setAlertMessage(null);
        }, 4000);
    }

    return (
        <FormProvider {...methods}>
            <div className="max-w-5xl mx-auto p-6 lg:p-8">

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* alertas */}
                    {alertMessage?.type === 'success' && (
                        <AlertSucess
                            title="Cadastro realizado!"
                            description={alertMessage.message}
                        />
                    )}

                    {alertMessage?.type === 'error' && (
                        <AlertErro
                            title="Falha no cadastro"
                            description={`Erro: ${alertMessage.message}`}
                        />
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cadastro de nova empresa</CardTitle>
                                <CardDescription>Insira as informações da empresa</CardDescription>
                            </CardHeader>
                            <SignupFormEmpresa />
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cadastro de primeiro usuário</CardTitle>
                                <CardDescription>Insira as informações do usuário</CardDescription>
                            </CardHeader>
                            <SignupFormUsuario />
                        </Card>
                    </div>

                    <div className="mt-6 flex justify-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={isSubmitting}
                        >
                            Limpar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Criando conta..." : "Create Account"}
                        </Button>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
}