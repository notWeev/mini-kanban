import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormData } from "./schemas";

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<TaskFormData>;
}

export function TaskForm({ onSubmit, onCancel, defaultValues }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultValues || { priority: "medium" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Tytuł
        </label>
        <input
          {...register("title")}
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Opis (opcjonalnie)
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700"
        >
          Priorytet
        </label>
        <select
          {...register("priority")}
          id="priority"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="low">Niski</option>
          <option value="medium">Średni</option>
          <option value="high">Wysoki</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
        >
          Zapisz
        </button>
      </div>
    </form>
  );
}
