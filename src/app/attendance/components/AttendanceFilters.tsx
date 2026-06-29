// components/attendance/AttendanceFilters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, X, Download, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Employee {
  _id: string;
  name: string;
  // puedes añadir más campos si los necesitas
}

interface AttendanceFiltersProps {
  startDate: string;
  endDate: string;
  employeeId: string;
  employees: Employee[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onFilter: () => void;
  onReset: () => void;
  onExport?: () => void;
}

export function AttendanceFilters({
  startDate,
  endDate,
  employeeId,
  employees,
  onStartDateChange,
  onEndDateChange,
  onEmployeeChange,
  onFilter,
  onReset,
  onExport,
}: AttendanceFiltersProps) {
  const [open, setOpen] = useState(false);

  // Encuentra el empleado seleccionado para mostrar su nombre
  const selectedEmployee = employees.find((emp) => emp._id === employeeId);

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros de búsqueda
        </h3>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro fecha inicio */}
        <div>
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Filtro fecha fin */}
        <div>
          <Label htmlFor="endDate">Fecha fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Filtro empleado con búsqueda */}
        <div>
          <Label>Prestador</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between mt-1 font-normal"
              >
                {selectedEmployee ? selectedEmployee.name : 'Todos'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar empleado..." />
                <CommandList>
                  <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                  <CommandGroup>
                    {/* Opción "Todos" */}
                    <CommandItem
                      onSelect={() => {
                        onEmployeeChange('');
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          employeeId === '' ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      Todos
                    </CommandItem>
                    {employees.map((emp) => (
                      <CommandItem
                        key={emp._id}
                        value={emp._id}
                        onSelect={(currentValue) => {
                          onEmployeeChange(currentValue === employeeId ? '' : currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            employeeId === emp._id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {emp.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onFilter}>Aplicar filtros</Button>
      </div>
    </div>
  );
}