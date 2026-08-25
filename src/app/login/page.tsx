"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";

type LoginForm = {
  email: string;
  password: string;
  role: "OPERADOR" | "MOTORISTA"; // Mock
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    // Simula o delay de requisição
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (data.role === "OPERADOR") {
      router.push("/operador");
    } else {
      router.push("/motorista");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background decorations - Glassmorphism e Premium Feel */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-zinc-900/60 border-zinc-800 backdrop-blur-xl shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <CardHeader className="space-y-3 pb-8 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-white text-center">
            SysRotas
          </CardTitle>
          <CardDescription className="text-zinc-400 text-center text-base">
            Entre na sua conta para continuar
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 font-medium">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com"
                className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 h-12"
                {...register("email", { required: "E-mail é obrigatório" })}
              />
              {errors.email && <span className="text-red-400 text-sm font-medium">{errors.email.message}</span>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 font-medium">Senha</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="bg-zinc-950/50 border-zinc-700 text-white focus-visible:border-blue-500 focus-visible:ring-blue-500/20 h-12"
                {...register("password", { required: "Senha é obrigatória" })}
              />
              {errors.password && <span className="text-red-400 text-sm font-medium">{errors.password.message}</span>}
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="role" className="text-zinc-300 font-medium">Simular Navegação Como:</Label>
              <select 
                id="role"
                className="flex h-12 w-full rounded-md border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                {...register("role")}
              >
                <option value="OPERADOR" className="bg-zinc-900 text-white">Operador (Dashboard)</option>
                <option value="MOTORISTA" className="bg-zinc-900 text-white">Veículo / Motorista</option>
              </select>
            </div>
          </CardContent>
          
          <CardFooter className="pb-8 pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
              disabled={loading}
            >
              {loading ? "Autenticando..." : "Acessar Sistema"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
