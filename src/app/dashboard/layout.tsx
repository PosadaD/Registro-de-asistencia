"use client";

import { useRouter } from "next/navigation";

import Link from "next/link";

import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
  };


 type User = {
  username: string;
};

const [data, setData] = useState<User | null>(null);

useEffect(() => {
  async function getUser() {
    const res = await fetch("/api/me");
    const data = await res.json();
    setData(data);
  }

  getUser();
}, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r">
        <div className="p-5">
          <h1 className="text-xl font-bold">
            Sistema de Asistencia
          </h1>

          <p className="text-sm text-muted-foreground">
            Panel administrativo
          </p>
        </div>

        <Separator />

        <nav className="p-3 flex flex-col gap-1">
          <LinkItem href="/dashboard" label="Inicio" />
          <LinkItem href="/attendance" label="Asistencias" />
          <LinkItem href="/dashboard/employees" label="Prestadores" />
          <LinkItem href="/dashboard/justifications" label="Justificaciones" />
          <LinkItem href="/dashboard/reports" label="Expedientes" />
          <LinkItem href="/dashboard/users" label="Usuarios"/>
          <LinkItem href="/dashboard/adjust-attendance" label="Ajustar Asistencia"/>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="font-semibold tex-withe">
              {data?.username}
          </h2>

          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

/* LINK COMPONENT */
function LinkItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition"
    >
      {label}
    </Link>
  );
}