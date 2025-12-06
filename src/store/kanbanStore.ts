import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card, List } from "../types";
import { SupabaseRepository } from "../lib/SupabaseRepository.ts";

const repository = new SupabaseRepository();

interface KanbanState {
  lists: List[];
  isLoading: boolean;
}

interface KanbanActions {
  // Inicjalizacja z bazy danych
  fetchBoard: () => Promise<void>;
  // Operacje CRUD na kartach
  addCard: (
    listId: string,
    cardData: Omit<
      Card,
      "id" | "list_id" | "user_id" | "created_at" | "updated_at" | "position"
    >
  ) => Promise<void>;
  updateCard: (
    cardId: string,
    updates: Partial<Omit<Card, "id">>
  ) => Promise<void>;
  deleteCard: (cardId: string, listId: string) => Promise<void>;
  // Operacja Drag & Drop
  moveCard: (
    cardId: string,
    sourceListId: string,
    destListId: string,
    newPosition: number
  ) => Promise<void>;
  // Operacje CRUD na listach
  addList: (name: string) => Promise<void>;
  updateList: (listId: string, name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
}

export const useKanbanStore = create<KanbanState & KanbanActions>()(
  immer((set) => ({
    lists: [],
    isLoading: true,

    fetchBoard: async () => {
      set({ isLoading: true });
      const { data, error } = await repository.getBoard();
      if (data) {
        // Jeśli użytkownik ma już listy, załaduj je
        if (data.length > 0) {
          set({ lists: data, isLoading: false });
        } else {
          // Jeśli to nowy użytkownik (brak list), stwórz domyślny zestaw
          const { data: defaultLists } =
            await repository.createDefaultListsForNewUser();
          set({ lists: defaultLists || [], isLoading: false });
        }
      } else {
        console.error("Failed to fetch board:", error);
        set({ isLoading: false });
      }
    },

    addCard: async (listId, cardData) => {
      const list = useKanbanStore.getState().lists.find((l) => l.id === listId);
      if (!list) return;

      const position = list.cards.length;
      const { data: newCard, error } = await repository.createCard({
        ...cardData,
        list_id: listId,
        position,
      });

      if (newCard) {
        set((state) => {
          const targetList = state.lists.find((l) => l.id === listId);
          targetList?.cards.push(newCard);
        });
      } else {
        console.error("Failed to create card:", error);
      }
    },

    updateCard: async (cardId, updates) => {
      // Optymistyczna aktualizacja UI
      set((state) => {
        for (const list of state.lists) {
          const card = list.cards.find((c) => c.id === cardId);
          if (card) {
            Object.assign(card, updates);
            return;
          }
        }
      });

      // Wysłanie zmiany do bazy
      const { error } = await repository.updateCard(cardId, updates);
      if (error) {
        console.error("Failed to update card:", error);
        // TODO: Wycofaj zmianę w UI w razie błędu
      }
    },

    deleteCard: async (cardId, listId) => {
      // Optymistyczna aktualizacja UI
      set((state) => {
        const list = state.lists.find((l) => l.id === listId);
        if (list) {
          list.cards = list.cards.filter((c) => c.id !== cardId);
        }
      });

      const { error } = await repository.deleteCard(cardId);
      if (error) {
        console.error("Failed to delete card:", error);
        // TODO: Wycofaj zmianę w UI w razie błędu
      }
    },

    moveCard: async (cardId, sourceListId, destListId, newPosition) => {
      // 1. Zapisz migawkę stanu na wypadek błędu
      const previousLists = useKanbanStore.getState().lists;

      // Optymistyczna aktualizacja UI
      set((state) => {
        const sourceList = state.lists.find((l) => l.id === sourceListId);
        if (!sourceList) return;

        const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return;

        const [movedCard] = sourceList.cards.splice(cardIndex, 1);
        movedCard.list_id = destListId;

        const destList = state.lists.find((l) => l.id === destListId);
        if (destList) {
          destList.cards.splice(newPosition, 0, movedCard);
        }
      });

      // Aktualizacja pozycji w bazie danych
      const { error } = await repository.updateCard(cardId, {
        list_id: destListId,
        position: newPosition,
      });
      if (error) {
        console.error("Failed to move card:", error);
        // 3. Wycofaj zmianę w UI w razie błędu (Rollback)
        set({ lists: previousLists });
      }
    },

    // Metody dla list (na razie bez implementacji w repozytorium)
    addList: async (name: string) => {
      const state = useKanbanStore.getState();
      // Zakładamy, że wszystkie listy należą do tej samej tablicy
      const boardId = state.lists[0]?.board_id;
      if (!boardId) {
        console.error("Cannot add list: board ID is unknown.");
        return;
      }

      const position = state.lists.length;
      const { data: newList, error } = await repository.createList(
        boardId,
        name,
        position
      );

      if (newList) {
        set({ lists: [...state.lists, newList] });
      } else {
        console.error("Failed to add list:", error);
      }
    },
    updateList: async (listId, name) => {
      console.log("updateList not implemented with backend yet", listId, name);
    },
    deleteList: async (listId) => {
      console.log("deleteList not implemented with backend yet", listId);
    },
  }))
);

// Przykładowe selektory
export const selectLists = (state: KanbanState) => state.lists;
export const selectIsLoading = (state: KanbanState) => state.isLoading;
