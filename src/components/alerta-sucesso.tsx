// src/components/alerta-sucesso.tsx
import { CheckCircle2Icon } from "lucide-react"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/src/components/ui/alert"

interface AlertSuccessProps {
    title: string;
    description: string;
}

export function AlertSucess({ title, description }: AlertSuccessProps) {
    return (
        // Adicionamos as classes de fixação, posicionamento e animação aqui!
        <Alert className="fixed top-4 right-4 z-50 w-[90%] max-w-md shadow-lg bg-white border-green-500 animate-in fade-in slide-in-from-right-8 duration-300">
            <CheckCircle2Icon className="text-green-500" />
            <AlertTitle className="text-green-700">{title}</AlertTitle>
            <AlertDescription className="text-green-600">
                {description}
            </AlertDescription>
        </Alert>
    )
}