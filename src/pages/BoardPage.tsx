import { useParams } from "react-router-dom";

export function BoardPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Tablica: {id}</h1>
      <p className="text-gray-600">
        Tutaj pojawi się widok tablicy Kanban z kolumnami i zadaniami.
      </p>
    </div>
  );
}
