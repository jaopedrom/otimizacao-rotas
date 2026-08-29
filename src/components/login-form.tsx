"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field"
import { Input } from "@/src/components/ui/input"
import { loginSchema, LoginInput } from "@/src/server/schemas/login.schema"
import { loginAction } from "@/src/app/login/actionLogin";

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [erroLogin, setErroLogin] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setErroLogin(null)
    const result = await loginAction(data.email, data.password)

    if (!result.success) {
      setErroLogin(result.message)
      return
    }

    const destino = result.usuario.usr_cargo === "MOTORISTA" ? "/motorista" : "/operador"
    router.push(destino)
  }

  return (
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          {erroLogin && (
              <FieldDescription className="text-center text-destructive">
                {erroLogin}
              </FieldDescription>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
            {errors.email && (
                <FieldDescription className="text-destructive">
                  {errors.email.message}
                </FieldDescription>
            )}
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                Forgot your password?
              </a>
            </div>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
                <FieldDescription className="text-destructive">
                  {errors.password.message}
                </FieldDescription>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
  )
}