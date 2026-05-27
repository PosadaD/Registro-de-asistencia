import EmployeeProfile from "@/src/components/employees/EmployeeProfile";

async function getEmployee(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/employees/${id}`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const employee = await getEmployee(params.id);

  return (
    <div className="space-y-6">
      <EmployeeProfile employee={employee} />
    </div>
  );
}