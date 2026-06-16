'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Justification {
  _id: string;
  employeeId: { _id: string; name: string };
  date: string;
  type: string;
  reason: string;
  fileUrl?: string;
  status: string;
}

interface JustificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  justification: Justification | null;
  onSuccess: () => void;
}

export function JustificationModal({ open, onOpenChange, justification, onSuccess }: JustificationModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (justification) {
      setReason(justification.reason);
    }
  }, [justification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/justifications/${justification._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (res.ok) {
        toast.success('Justificación actualizada');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error('Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !justification) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Editar Justificación</h2>
            <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <Label>Empleado</Label>
              <Input value={justification.employeeId?.name || 'N/A'} disabled className="bg-gray-50" />
            </div>
            
            <div>
              <Label>Fecha</Label>
              <Input value={new Date(justification.date).toLocaleDateString('es-MX')} disabled className="bg-gray-50" />
            </div>
            
            <div>
              <Label>Tipo</Label>
              <Input value={justification.type} disabled className="bg-gray-50" />
            </div>
            
            <div>
              <Label>Motivo</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} required />
            </div>
            
            {justification.fileUrl && (
              <div>
                <Label>Documento adjunto</Label>
                <a href={justification.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block mt-1">
                  Ver documento
                </a>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Actualizar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}