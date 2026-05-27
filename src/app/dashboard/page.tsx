import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard Administrador
        </h1>

        <p className="text-muted-foreground">
          Bienvenido al sistema de asistencia.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title="Prestadores activos"
          value="0"
        />

        <MetricCard
          title="Asistencias hoy"
          value="0"
        />

        <MetricCard
          title="Faltas registradas"
          value="0"
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Actividad reciente
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm text-muted-foreground">
            No hay actividad registrada aún.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* COMPONENTE REUTILIZABLE */
function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}