import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "../button"


export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="h-5 w-px bg-border" />

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="text-xs text-muted-foreground">
            Operational overview
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="outline" size="sm">
          Export
        </Button>

        <Button size="sm">
          Create Task
        </Button>
      </div>
    </header>
  )
}
