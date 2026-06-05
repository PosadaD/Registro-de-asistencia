// components/attendance/SummaryCards.tsx
'use client';

import { Users, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface SummaryCardsProps {
  total: number;
  present: number;
  late: number;
  absent: number;
  totalHours?: number;
}

export function SummaryCards({ total, present, late, absent, totalHours = 0 }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total registros',
      value: total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Asistieron',
      value: present,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Llegaron tarde',
      value: late,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Ausencias',
      value: absent,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-3 rounded-full`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}
      {totalHours > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Horas totales</p>
              <p className="text-2xl font-bold mt-1">{totalHours}h</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}