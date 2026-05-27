import JustificationForm from "../../../components/justifications/JustificationForm";

export default function JustificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Justificaciones
        </h1>

        <JustificationForm />
      </div>
    </div>
  );
}