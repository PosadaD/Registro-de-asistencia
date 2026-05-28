// components/employees/EmployeeForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

interface Employee {
  _id?: string;
  name?: string;
  gender?: string;
  rfc?: string;
  shortRfc?: string;
  curp?: string;
  immediateBoss?: string;
  educationalInstitution?: string;
  semester?: string;
  providerType?: string;
  economicSupport?: boolean;
  startDate?: string;
  endDate?: string;
  workSchedule?: {
    startTime?: string;
    endTime?: string;
  };
  status?: string;
}

interface EmployeeFormProps {
  onCreated: () => void;
  editingEmployee?: Employee | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EmployeeForm({ onCreated, editingEmployee, open: externalOpen, onOpenChange }: EmployeeFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Employee>({});

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
    if (!open) {
      setFormData({});
    }
  };

  useEffect(() => {
    if (editingEmployee && isOpen) {
      console.log('Editando empleado:', editingEmployee);
      
      setFormData({
        name: editingEmployee.name || '',
        gender: editingEmployee.gender || '',
        rfc: editingEmployee.rfc || '',
        shortRfc: editingEmployee.shortRfc || '',
        curp: editingEmployee.curp || '',
        immediateBoss: editingEmployee.immediateBoss || '',
        educationalInstitution: editingEmployee.educationalInstitution || '',
        semester: editingEmployee.semester || '',
        providerType: editingEmployee.providerType || '',
        economicSupport: editingEmployee.economicSupport || false,
        startDate: editingEmployee.startDate ? new Date(editingEmployee.startDate).toISOString().split('T')[0] : '',
        endDate: editingEmployee.endDate ? new Date(editingEmployee.endDate).toISOString().split('T')[0] : '',
        workSchedule: {
          startTime: editingEmployee.workSchedule?.startTime || '09:00',
          endTime: editingEmployee.workSchedule?.endTime || '13:00',
        },
        status: editingEmployee.status || 'ACTIVE',
      });
    } else if (!editingEmployee && isOpen) {
      setFormData({
        name: '',
        gender: '',
        rfc: '',
        shortRfc: '',
        curp: '',
        immediateBoss: '',
        educationalInstitution: '',
        semester: '',
        providerType: '',
        economicSupport: false,
        startDate: '',
        endDate: '',
        workSchedule: { 
          startTime: '09:00', 
          endTime: '13:00'
        },
        status: 'ACTIVE',
      });
    }
  }, [editingEmployee, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const startTime = formData.workSchedule?.startTime || '09:00';
    const endTime = formData.workSchedule?.endTime || '13:00';
    
    const data = {
      name: formData.name,
      gender: formData.gender,
      rfc: formData.rfc,
      shortRfc: formData.shortRfc,
      curp: formData.curp,
      immediateBoss: formData.immediateBoss,
      educationalInstitution: formData.educationalInstitution,
      semester: formData.semester,
      providerType: formData.providerType,
      economicSupport: formData.economicSupport === true,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      workSchedule: {
        startTime: startTime,
        endTime: endTime,
      },
      status: formData.status,
    };

    console.log('Enviando datos:', data);

    try {
      const url = editingEmployee?._id ? `/api/employees/${editingEmployee._id}` : '/api/employees';
      const method = editingEmployee?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingEmployee?._id ? 'Prestador actualizado' : 'Prestador creado');
        onCreated();
        handleOpenChange(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <>
      {externalOpen === undefined && (
        <Button onClick={() => handleOpenChange(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Prestador
        </Button>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-lg">
                <h2 className="text-xl font-semibold">
                  {editingEmployee?._id ? 'Editar Prestador' : 'Nuevo Prestador'}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Datos personales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Datos Personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="gender">Género</Label>
                        <select
                          id="gender"
                          value={formData.gender || ''}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="FEMENINO">Femenino</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rfc">RFC</Label>
                        <Input
                          id="rfc"
                          value={formData.rfc || ''}
                          onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shortRfc">RFC Corto</Label>
                        <Input
                          id="shortRfc"
                          value={formData.shortRfc || ''}
                          onChange={(e) => setFormData({ ...formData, shortRfc: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="curp">CURP</Label>
                        <Input
                          id="curp"
                          value={formData.curp || ''}
                          onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información académica/laboral */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Información Académica y Laboral</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="immediateBoss">Jefe inmediato</Label>
                        <Input
                          id="immediateBoss"
                          value={formData.immediateBoss || ''}
                          onChange={(e) => setFormData({ ...formData, immediateBoss: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="educationalInstitution">Institución educativa</Label>
                        <Input
                          id="educationalInstitution"
                          value={formData.educationalInstitution || ''}
                          onChange={(e) => setFormData({ ...formData, educationalInstitution: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="semester">Semestre</Label>
                        <Input
                          id="semester"
                          value={formData.semester || ''}
                          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="providerType">Tipo de prestador</Label>
                        <select
                          id="providerType"
                          value={formData.providerType || ''}
                          onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="SERVICIO_SOCIAL">Servicio Social</option>
                          <option value="PRACTICAS">Prácticas Profesionales</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="economicSupport">Apoyo económico</Label>
                        <select
                          id="economicSupport"
                          value={formData.economicSupport ? "true" : "false"}
                          onChange={(e) => setFormData({ ...formData, economicSupport: e.target.value === "true" })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Fechas y horario */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Fechas y Horario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Fecha de inicio *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate || ''}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Fecha de término</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate || ''}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Hora de entrada</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.workSchedule?.startTime || '09:00'}
                          onChange={(e) => {
                            const newStartTime = e.target.value;
                            const [hours, minutes] = newStartTime.split(':').map(Number);
                            let endHour = hours + 4;
                            const newEndTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            
                            setFormData({
                              ...formData,
                              workSchedule: {
                                startTime: newStartTime,
                                endTime: newEndTime
                              }
                            });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Hora de salida</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.workSchedule?.endTime || '13:00'}
                          onChange={(e) => {
                            const newEndTime = e.target.value;
                            const [startHours, startMinutes] = (formData.workSchedule?.startTime || '09:00').split(':').map(Number);
                            const [endHours, endMinutes] = newEndTime.split(':').map(Number);
                            
                            let diffHours = endHours - startHours;
                            let diffMinutes = endMinutes - startMinutes;
                            
                            if (diffHours === 4 && diffMinutes === 0) {
                              setFormData({
                                ...formData,
                                workSchedule: {
                                  ...formData.workSchedule,
                                  endTime: newEndTime
                                }
                              });
                            } else {
                              toast.error('La hora de salida debe ser exactamente 4 horas después de la entrada');
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Estado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Estatus</Label>
                        <select
                          id="status"
                          value={formData.status || 'ACTIVE'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ACTIVE">Activo</option>
                          <option value="DISMISSED">Dado de baja</option>
                          <option value="VOLUNTARY_LEAVE">Baja voluntaria</option>
                          <option value="FINISHED">Terminado</option>
                          <option value="OTHER">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : (editingEmployee?._id ? 'Actualizar' : 'Crear')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}