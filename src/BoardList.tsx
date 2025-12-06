import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { List } from "./types";
import { BoardCard } from "./BoardCard";

interface BoardListProps {
  list: List;
  onAddTask: () => void;
}

export function BoardList({ list, onAddTask }: BoardListProps) {
  const { setNodeRef } = useDroppable({
    id: list.id,
    data: { type: "List", list },
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-200/70 rounded-lg p-3 w-80 flex-shrink-0"
    >
      <h3 className="font-bold text-lg mb-4 px-1">{list.name}</h3>
      <ul className="space-y-3">
        <SortableContext items={list.cards.map((c) => c.id)}>
          {list.cards.map((card) => (
            <BoardCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </ul>
      <button
        onClick={onAddTask}
        className="mt-4 w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        + Dodaj zadanie
      </button>
    </div>
  );
}
