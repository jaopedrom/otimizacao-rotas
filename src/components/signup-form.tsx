import {
  Card, CardContent,
} from "@/src/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { Separator } from "@/src/components/ui/separator";
import { SignupFormEndereco } from "@/src/components/endereco-form";
import { useFormContext } from "react-hook-form";
import { Signup } from "@/src/server/schemas/auth.schema";

export function SignupFormEmpresa({ ...props }: React.ComponentProps<typeof Card>) {
  const { register, formState: { errors } } = useFormContext<Signup>();

  return (
      <Card {...props}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="emp_razao_soc">Razão Social</FieldLabel>
              <Input id="emp_razao_soc" type="text" {...register("empresa.emp_razao_soc")} />
              {errors.empresa?.emp_razao_soc && (
                  <FieldDescription className="text-destructive">
                    {errors.empresa.emp_razao_soc.message}
                  </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="emp_nome">Nome Fantasia</FieldLabel>
              <Input id="emp_nome" type="text" {...register("empresa.emp_nome")} />
              {errors.empresa?.emp_nome && (
                  <FieldDescription className="text-destructive">
                    {errors.empresa.emp_nome.message}
                  </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="emp_cnpj">CNPJ</FieldLabel>
              <Input id="emp_cnpj" type="text" {...register("empresa.emp_cnpj")} />
              {errors.empresa?.emp_cnpj && (
                  <FieldDescription className="text-destructive">
                    {errors.empresa.emp_cnpj.message}
                  </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="emp_email">Email</FieldLabel>
              <Input id="emp_email" type="email" {...register("empresa.emp_email")} />
              <FieldDescription>
                Usaremos esse email para contato.
              </FieldDescription>
              {errors.empresa?.emp_email && (
                  <FieldDescription className="text-destructive">
                    {errors.empresa.emp_email.message}
                  </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="emp_telefone">Telefone</FieldLabel>
              <Input id="emp_telefone" type="tel" {...register("empresa.emp_telefone")} />
              {errors.empresa?.emp_telefone && (
                  <FieldDescription className="text-destructive">
                    {errors.empresa.emp_telefone.message}
                  </FieldDescription>
              )}
            </Field>
          </FieldGroup>

          <Separator className="my-4" />
          <SignupFormEndereco campoBase="empresa.endereco" texto="Endereço da empresa" />
        </CardContent>
      </Card>
  )
}