// app/attendance/layout.tsx (versión simplificada)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Sesión cerrada');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra superior simple */}
      <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h1 className="font-semibold text-gray-800">Asistencia</h1>
          <span className="text-xs text-gray-500">{user.username}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1" />
          Salir
        </Button>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}