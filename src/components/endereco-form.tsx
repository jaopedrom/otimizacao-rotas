import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { useFormContext, FieldError } from "react-hook-form";
import { Signup } from "@/src/server/schemas/auth.schema";

type SignupFormEnderecoProps = React.ComponentProps<typeof Card> & {
    texto?: string;
    campoBase: "empresa.endereco" | "usuario.endereco";
    mostrarApelido?: boolean;
};

export function SignupFormEndereco({
                                       texto = "Cadastro de Endereço",
                                       campoBase,
                                       mostrarApelido = false,
                                       ...props
                                   }: SignupFormEnderecoProps) {
    const { register, formState: { errors } } = useFormContext<Signup>();
    const idPrefix = campoBase.replace(".", "-");

    // errors.empresa?.endereco ou errors.usuario?.endereco, dependendo de campoBase
    const enderecoErrors =
        campoBase === "empresa.endereco"
            ? errors.empresa?.endereco
            : errors.usuario?.endereco;

    function erroDoCampo(nome: keyof NonNullable<typeof enderecoErrors>): FieldError | undefined {
        return enderecoErrors?.[nome] as FieldError | undefined;
    }

    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>{texto}</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    {mostrarApelido && (
                        <Field>
                            <FieldLabel htmlFor={`${idPrefix}-apelido`}>Apelido</FieldLabel>
                            <Input id={`${idPrefix}-apelido`} type="text" placeholder="Casa, Trabalho..."
                                   {...register(`${campoBase}.apelido`)} />
                            {erroDoCampo("apelido") && (
                                <FieldDescription className="text-destructive">
                                    {erroDoCampo("apelido")?.message}
                                </FieldDescription>
                            )}
                        </Field>
                    )}
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-cep`}>CEP</FieldLabel>
                        <Input id={`${idPrefix}-cep`} type="text" {...register(`${campoBase}.cep`)} />
                        {erroDoCampo("cep") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("cep")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-logradouro`}>Logradouro</FieldLabel>
                        <Input id={`${idPrefix}-logradouro`} type="text" {...register(`${campoBase}.logradouro`)} />
                        {erroDoCampo("logradouro") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("logradouro")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-bairro`}>Bairro</FieldLabel>
                        <Input id={`${idPrefix}-bairro`} type="text" {...register(`${campoBase}.bairro`)} />
                        {erroDoCampo("bairro") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("bairro")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-cidade`}>Cidade</FieldLabel>
                        <Input id={`${idPrefix}-cidade`} type="text" {...register(`${campoBase}.cidade`)} />
                        {erroDoCampo("cidade") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("cidade")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-estado`}>Estado</FieldLabel>
                        <Input id={`${idPrefix}-estado`} type="text" {...register(`${campoBase}.estado`)} />
                        {erroDoCampo("estado") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("estado")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-numero`}>Número</FieldLabel>
                        <Input id={`${idPrefix}-numero`} type="text" {...register(`${campoBase}.numero`)} />
                        {erroDoCampo("numero") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("numero")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor={`${idPrefix}-complemento`}>Complemento</FieldLabel>
                        <Input id={`${idPrefix}-complemento`} type="text" {...register(`${campoBase}.complemento`)} />
                        {erroDoCampo("complemento") && (
                            <FieldDescription className="text-destructive">
                                {erroDoCampo("complemento")?.message}
                            </FieldDescription>
                        )}
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    )
}