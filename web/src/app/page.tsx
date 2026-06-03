"use client"; // TODO componente que usa hooks (como useRouter e useEffect) PRECISA disso no topo

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]); // Array de dependências correto

  return <div className="min-h-screen bg-background" />; // Tela em branco limpa enquanto redireciona
}