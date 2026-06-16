import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    await connectDB();
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    return NextResponse.json({ error: 'Error al obtener empleado' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params; 
    const body = await request.json();
    await connectDB();
    
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }

    Object.assign(employee, body);
    await employee.save();

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error al actualizar:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const employee = await Employee.findByIdAndDelete(id);
    
    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}