import { Card, CardContent } from "@/src/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { useFormContext } from "react-hook-form";
import { Signup } from "@/src/server/schemas/auth.schema";
import {Separator} from "@/src/components/ui/separator";
import {SignupFormEndereco} from "@/src/components/endereco-form";

export function SignupFormUsuario({ ...props }: React.ComponentProps<typeof Card>) {
    const { register, formState: { errors } } = useFormContext<Signup>();

    return (
        <Card {...props}>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="usr_nome">Nome</FieldLabel>
                        <Input id="usr_nome" type="text" {...register("usuario.usr_nome")} />
                        {errors.usuario?.usr_nome && (
                            <FieldDescription className="text-destructive">
                                {errors.usuario.usr_nome.message}
                            </FieldDescription>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="usr_email">Email</FieldLabel>
                        <Input id="usr_email" type="email" {...register("usuario.usr_email")} />
                        {errors.usuario?.usr_email && (
                            <FieldDescription className="text-destructive">
                                {errors.usuario.usr_email.message}
                            </FieldDescription>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="usr_dt_nascimento">Data de Nascimento</FieldLabel>
                        <Input id="usr_dt_nascimento" type="date" {...register("usuario.usr_dt_nascimento")} />
                        {errors.usuario?.usr_dt_nascimento && (
                            <FieldDescription className="text-destructive">
                                {errors.usuario.usr_dt_nascimento.message}
                            </FieldDescription>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="usr_password">Password</FieldLabel>
                        <Input id="usr_password" type="password" {...register("usuario.usr_password")} />
                        <FieldDescription>Mínimo de 8 caracteres.</FieldDescription>
                        {errors.usuario?.usr_password && (
                            <FieldDescription className="text-destructive">
                                {errors.usuario.usr_password.message}
                            </FieldDescription>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="usr_password_confirm">Confirmar Password</FieldLabel>
                        <Input id="usr_password_confirm" type="password" {...register("usuario.usr_password_confirm")} />
                        {errors.usuario?.usr_password_confirm && (
                            <FieldDescription className="text-destructive">
                                {errors.usuario.usr_password_confirm.message}
                            </FieldDescription>
                        )}
                    </Field>
                </FieldGroup>

                <Separator className="my-4" />
                <SignupFormEndereco campoBase="usuario.endereco" texto="Endereço do usuário" mostrarApelido />
            </CardContent>
        </Card>
    )
}