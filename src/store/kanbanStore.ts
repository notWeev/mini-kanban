import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card, List } from "../types";

// Przykładowe dane początkowe dla MVP
const initialLists: List[] = [
  {
    id: "list-1",
    name: "Do zrobienia",
    position: 0,
    cards: [
      {
        id: "card-1",
        title: "Skonfigurować projekt",
        description: "Zainicjować repozytorium i podstawowe zależności.",
        priority: "high",
        list_id: "list-1",
        user_id: "user-1",
        position: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  { id: "list-2", name: "W toku", position: 1, cards: [] },
  { id: "list-3", name: "Zrobione", position: 2, cards: [] },
];

interface KanbanState {
  lists: List[];
}

interface KanbanActions {
  // Używane do inicjalizacji stanu danymi z backendu
  setLists: (lists: List[]) => void;
  // Operacje CRUD na kartach
  addCard: (
    listId: string,
    cardData: Omit<
      Card,
      "id" | "list_id" | "user_id" | "created_at" | "updated_at" | "position"
    >
  ) => void;
  updateCard: (cardId: string, updates: Partial<Omit<Card, "id">>) => void;
  deleteCard: (cardId: string) => void;
  // Operacja Drag & Drop
  moveCard: (
    cardId: string,
    sourceListId: string,
    destListId: string,
    newPosition: number
  ) => void;
}

export const useKanbanStore = create<KanbanState & KanbanActions>()(
  immer((set) => ({
    lists: initialLists,

    setLists: (lists) => set({ lists }),

    addCard: (listId, cardData) => {
      set((state) => {
        const list = state.lists.find((l) => l.id === listId);
        if (list) {
          const newCard: Card = {
            ...cardData,
            id: `card-${Date.now()}`, // Tymczasowe ID, backend nada właściwe
            list_id: listId,
            user_id: "user-1", // Placeholder
            position: list.cards.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          list.cards.push(newCard);
        }
      });
    },

    updateCard: (cardId, updates) => {
      set((state) => {
        for (const list of state.lists) {
          const card = list.cards.find((c) => c.id === cardId);
          if (card) {
            Object.assign(card, updates, {
              updated_at: new Date().toISOString(),
            });
            return;
          }
        }
      });
    },

    deleteCard: (cardId) => {
      set((state) => {
        for (const list of state.lists) {
          const cardIndex = list.cards.findIndex((c) => c.id === cardId);
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            return;
          }
        }
      });
    },

    moveCard: (cardId, sourceListId, destListId, newPosition) => {
      set((state) => {
        const sourceList = state.lists.find((l) => l.id === sourceListId);
        if (!sourceList) return;

        const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return;

        // 1. Usuń kartę z listy źródłowej
        const [movedCard] = sourceList.cards.splice(cardIndex, 1);
        movedCard.list_id = destListId; // Zaktualizuj list_id

        // 2. Dodaj kartę do listy docelowej
        const destList = state.lists.find((l) => l.id === destListId);
        if (destList) {
          destList.cards.splice(newPosition, 0, movedCard);
        }
      });
    },
  }))
);

// Przykładowe selektory
export const selectLists = (state: KanbanState) => state.lists;
export const selectCardById = (cardId: string) => (state: KanbanState) => {
  for (const list of state.lists) {
    const card = list.cards.find((c) => c.id === cardId);
    if (card) return card;
  }
  return undefined;
};
