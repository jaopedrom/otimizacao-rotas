// src/app/layout.tsx
// import "@/globals.css"; // Seus estilos globais
import "@/src/app/globals.css"

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
        <body>
        {/* Repare: SEM Sidebar aqui, apenas o children */}
        {children}
        </body>
        </html>
    );
}