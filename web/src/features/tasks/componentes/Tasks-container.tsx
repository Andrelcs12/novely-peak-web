"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button" // Shadcn puro

export function TasksContainer() {
  const [focusMode, setFocusMode] = useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Blocos de Deep Work</h2>
      <p>Gerencie seus períodos de foco extremo aqui.</p>
      
      <Button onClick={() => setFocusMode(!focusMode)}>
        {focusMode ? "Parar Foco" : "Iniciar Deep Work"}
      </Button>
    </div>
  )
}