// src/components/telefone-form.tsx
import { Field, FieldDescription, FieldLabel } from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { useFormContext, FieldError } from "react-hook-form";
import { Signup } from "@/src/server/schemas/auth.schema";

type SignupFormTelefoneProps = {
    campoBase: "empresa.emp_telefone" | "usuario.usr_telefone";
};

export function SignupFormTelefone({ campoBase }: SignupFormTelefoneProps) {
    const { register, formState: { errors } } = useFormContext<Signup>();
    const idPrefix = campoBase.replace(".", "-");

    const erro =
        campoBase === "empresa.emp_telefone"
            ? errors.empresa?.emp_telefone
            : errors.usuario?.usr_telefone;

    return (
        <Field>
            <FieldLabel htmlFor={idPrefix}>Telefone</FieldLabel>
            <Input id={idPrefix} type="tel" placeholder="(45) 99999-9999" {...register(campoBase)} />
            <FieldDescription>Incluindo DDD.</FieldDescription>
            {erro && (
                <FieldDescription className="text-destructive">
                    {(erro as FieldError).message}
                </FieldDescription>
            )}
        </Field>
    );
}