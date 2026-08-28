// src/components/alerta-erro.tsx
import { XCircleIcon } from "lucide-react" // Exemplo de ícone de erro

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/src/components/ui/alert"

interface AlertErroProps {
    title: string;
    description: string;
}

export function AlertErro({ title, description }: AlertErroProps) {
    return (
        // Classes iguais ao de sucesso, mas com cores de erro (vermelho)
        <Alert className="fixed top-4 right-4 z-50 w-[90%] max-w-md shadow-lg bg-white border-red-500 animate-in fade-in slide-in-from-right-8 duration-300" variant="destructive">
            <XCircleIcon className="text-red-500" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {description}
            </AlertDescription>
        </Alert>
    )
}