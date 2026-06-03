
import { Header } from "@/components/ui/dashboard/Header"
import { AppSidebar } from "@/components/ui/dashboard/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        
        {/* Sidebar fixa na esquerda */}
        <AppSidebar />
        
        <div className="flex flex-1 flex-col">
          {/* Header fixo no topo */}
          <Header />

          {/* Conteúdo dinâmico das páginas ((dashboard)/dashboard ou (dashboard)/tasks) */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-zinc-950">
            {children}
          </main>
        </div>

      </div>
    </SidebarProvider>
  )
}