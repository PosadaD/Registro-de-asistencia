// components/employees/EmployeeForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, X, CheckCircle } from 'lucide-react';
import { FaceCapture } from './FaceCapture';

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
  faceDescriptor?: number[] | null;
  faceImage?: string;
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
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(editingEmployee?.faceDescriptor || null);
  const [faceImage, setFaceImage] = useState<string | undefined>(editingEmployee?.faceImage);
  const [hasFace, setHasFace] = useState(!!editingEmployee?.faceDescriptor);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
    if (!open) {
      setFormData({});
      setFaceDescriptor(null);
      setHasFace(false);
    }
  };

  useEffect(() => {
    if (editingEmployee && isOpen) {
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
      setFaceDescriptor(editingEmployee.faceDescriptor || null);
      setFaceImage(editingEmployee.faceImage);
      setHasFace(!!editingEmployee.faceDescriptor);
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
        workSchedule: { startTime: '09:00', endTime: '13:00' },
        status: 'ACTIVE',
      });
      setFaceDescriptor(null);
      setFaceImage(undefined);
      setHasFace(false);
    }
  }, [editingEmployee, isOpen]);

  const handleFaceDescriptor = (descriptor: number[] | null) => {
    setFaceDescriptor(descriptor);
    setHasFace(!!descriptor);
  };

  const handleFaceImage = (image: string) => {
    setFaceImage(image);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Validar que se haya capturado un rostro (solo para nuevos empleados)
    if (!editingEmployee && !faceDescriptor) {
      toast.error('Debes capturar un rostro para el prestador');
      setLoading(false);
      return;
    }

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
      faceDescriptor: faceDescriptor || editingEmployee?.faceDescriptor,
      faceImage: faceImage,
    };

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
            <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
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

              {/* Formulario con 2 columnas */}
              <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* COLUMNA IZQUIERDA: Datos personales y laborales */}
                  <div className="space-y-6">
                    {/* Datos personales */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Datos Personales</h3>
                      
                      <div>
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="gender">Género</Label>
                        <select
                          id="gender"
                          value={formData.gender || ''}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Seleccionar</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="FEMENINO">Femenino</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="rfc">RFC</Label>
                          <Input id="rfc" value={formData.rfc || ''} onChange={(e) => setFormData({ ...formData, rfc: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="curp">CURP</Label>
                          <Input id="curp" value={formData.curp || ''} onChange={(e) => setFormData({ ...formData, curp: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* Información académica/laboral */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Información Académica y Laboral</h3>
                      
                      <div>
                        <Label htmlFor="educationalInstitution">Institución educativa</Label>
                        <Input
                          id="educationalInstitution"
                          value={formData.educationalInstitution || ''}
                          onChange={(e) => setFormData({ ...formData, educationalInstitution: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="semester">Semestre</Label>
                          <Input id="semester" value={formData.semester || ''} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="immediateBoss">Jefe inmediato</Label>
                          <Input id="immediateBoss" value={formData.immediateBoss || ''} onChange={(e) => setFormData({ ...formData, immediateBoss: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="providerType">Tipo de prestador</Label>
                          <select
                            id="providerType"
                            value={formData.providerType || ''}
                            onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Seleccionar</option>
                            <option value="SERVICIO_SOCIAL">Servicio Social</option>
                            <option value="PRACTICAS_PROFESIONALES">Prácticas Profesionales</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="economicSupport">Apoyo económico</Label>
                          <select
                            id="economicSupport"
                            value={formData.economicSupport ? "true" : "false"}
                            onChange={(e) => setFormData({ ...formData, economicSupport: e.target.value === "true" })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="startDate">Fecha de inicio *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Fecha de término</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="startTime">Hora de entrada</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={formData.workSchedule?.startTime || '09:00'}
                            onChange={(e) => setFormData({
                              ...formData,
                              workSchedule: { ...formData.workSchedule, startTime: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">Hora de salida</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={formData.workSchedule?.endTime || '13:00'}
                            onChange={(e) => setFormData({
                              ...formData,
                              workSchedule: { ...formData.workSchedule, endTime: e.target.value }
                            })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="status">Estatus</Label>
                        <select
                          id="status"
                          value={formData.status || 'ACTIVE'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

                  {/* COLUMNA DERECHA: Captura Facial */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Registro Facial</h3>
                    
                    {!editingEmployee || !hasFace ? (
                      <FaceCapture 
                        onFaceDescriptor={handleFaceDescriptor}
                        onFaceImage={handleFaceImage}
                        initialDescriptor={faceDescriptor}
                      />
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-sm text-green-700 font-medium">Rostro registrado correctamente</p>
                        <p className="text-xs text-green-600 mt-1">El sistema podrá reconocer a este prestador</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setHasFace(false);
                            setFaceDescriptor(null);
                          }}
                        >
                          Volver a Capturar
                        </Button>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-xs text-blue-700">
                        📸 El sistema capturará un descriptor único del rostro que se usará para el reconocimiento facial en el registro de asistencia. Asegúrate de que el empleado mire directamente a la cámara con buena iluminación.
                      </p>
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