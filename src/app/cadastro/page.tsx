// src/app/cadastro/page.tsx
"use client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, Signup } from "@/src/server/schemas/auth.schema";
import { signupAction } from "@/src/app/cadastro/actionCadastro";
import { SignupFormEmpresa } from "@/src/components/signup-form";
import { SignupFormUsuario } from "@/src/components/singup-usuario";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default function CadastroPage() {
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

    const { handleSubmit, formState: { isSubmitting } } = methods;

    async function onSubmit(data: Signup) {
        const result = await signupAction(data);
        if (result.success !== false) {
            // redirecionar pra dashboard
        } else {
            alert(`Erro: ${result.message}`);
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
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

                <div className="mt-6 flex justify-center">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Criando conta..." : "Create Account"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}