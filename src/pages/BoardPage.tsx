import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { BoardList } from "../BoardList";
import { BoardCard } from "../BoardCard";
import { SortableContext } from "@dnd-kit/sortable";
import type { Priority, Card } from "../types";
import { useKanbanStore } from "../store/kanbanStore";
import { Modal } from "../components/Modal";
import { TaskForm } from "../TaskForm";
import { type TaskFormData } from "../schemas";

export function BoardPage() {
  const { lists, isLoading, fetchBoard, moveCard, addCard, addList } =
    useKanbanStore();
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [filterText, setFilterText] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [isAddingList, setIsAddingList] = useState(false);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const filteredLists = useMemo(() => {
    if (!filterText && filterPriority === "all") {
      return lists;
    }

    return lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => {
        const textMatch =
          filterText.length > 0
            ? card.title.toLowerCase().includes(filterText.toLowerCase()) ||
              card.description?.toLowerCase().includes(filterText.toLowerCase())
            : true;
        const priorityMatch =
          filterPriority !== "all" ? card.priority === filterPriority : true;
        return textMatch && priorityMatch;
      }),
    }));
  }, [lists, filterText, filterPriority]);

  const listIds = useMemo(() => lists.map((list) => list.id), [lists]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 10px
      },
    })
  );

  if (isLoading) {
    return <div className="text-center p-10">Ładowanie tablicy...</div>;
  }

  const handleAddTaskSubmit = (data: TaskFormData) => {
    if (addingToList) {
      // Konwertujemy `undefined` z formularza na `null` oczekiwany przez typ Card
      const cardData = { ...data, description: data.description || null };
      addCard(addingToList, cardData);
    }
    setAddingToList(null); // Zamknij modal po dodaniu
  };

  const currentListForModal = lists.find((l) => l.id === addingToList);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        if (event.active.data.current?.type === "Card") {
          setActiveCard(event.active.data.current.card);
        }
      }}
      onDragEnd={(event) => {
        setActiveCard(null);
        const { active, over } = event;
        if (!over) return;
        if (active.id === over.id) return;

        const sourceListId = active.data.current?.card.list_id;
        const destListId =
          over.data.current?.list?.id || over.data.current?.card.list_id;

        if (sourceListId && destListId) {
          // Na razie uproszczona pozycja - na koniec listy
          moveCard(String(active.id), sourceListId, destListId, 999);
        }
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Tablica Kanban</h1>
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="filter-text" className="sr-only">
              Filtruj po tekście
            </label>
            <input
              id="filter-text"
              type="text"
              placeholder="Filtruj zadania..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="filter-priority" className="sr-only">
              Filtruj po priorytecie
            </label>
            <select
              id="filter-priority"
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(e.target.value as Priority | "all")
              }
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Wszystkie priorytety</option>
              <option value="low">Niski</option>
              <option value="medium">Średni</option>
              <option value="high">Wysoki</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        <SortableContext items={listIds}>
          {filteredLists.map((list) => (
            <BoardList
              key={list.id}
              list={list}
              onAddTask={() => setAddingToList(list.id)}
            />
          ))}
          {/* Przycisk do dodawania nowej listy */}
          <div className="flex-shrink-0">
            {isAddingList ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem(
                    "listName"
                  ) as HTMLInputElement;
                  if (input.value.trim()) {
                    addList(input.value.trim());
                    setIsAddingList(false);
                  }
                }}
                className="w-80 bg-gray-200 rounded-lg p-3"
              >
                <input
                  name="listName"
                  autoFocus
                  placeholder="Wpisz nazwę listy..."
                  className="w-full p-2 border-blue-500 border-2 rounded-md"
                  onBlur={() => setIsAddingList(false)}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Dodaj listę
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingList(false)}
                    className="px-4 py-2 text-sm text-gray-700"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-80 bg-gray-200/50 hover:bg-gray-300/80 text-gray-700 font-bold py-2 px-4 rounded-lg"
              >
                + Dodaj nową listę
              </button>
            )}
          </div>
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay>
          {activeCard && <BoardCard card={activeCard} />}
        </DragOverlay>,
        document.body
      )}

      <Modal
        isOpen={!!addingToList}
        onClose={() => setAddingToList(null)}
        title={`Dodaj zadanie do: ${currentListForModal?.name || ""}`}
      >
        <TaskForm
          onSubmit={handleAddTaskSubmit}
          onCancel={() => setAddingToList(null)}
        />
      </Modal>
    </DndContext>
  );
}
