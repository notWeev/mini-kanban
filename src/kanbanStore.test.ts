import { describe, it, expect, beforeEach } from "vitest";
import { useKanbanStore } from "./store/kanbanStore";

// Pobranie początkowego stanu i zresetowanie go przed każdym testem
const initialState = useKanbanStore.getState();
beforeEach(() => {
  useKanbanStore.setState(initialState, true);
});

describe("Kanban Store", () => {
  it("should add a new card to the correct list", () => {
    const listId = "list-1";
    const initialCardCount = useKanbanStore
      .getState()
      .lists.find((l) => l.id === listId)!.cards.length;

    // Pobranie akcji ze store'a
    const { addCard } = useKanbanStore.getState();
    addCard(listId, {
      title: "Nowe zadanie",
      description: "Opis",
      priority: "medium",
    });

    const list = useKanbanStore.getState().lists.find((l) => l.id === listId);
    expect(list!.cards.length).toBe(initialCardCount + 1);
    expect(list!.cards[list!.cards.length - 1].title).toBe("Nowe zadanie");
  });

  it("should update an existing card", () => {
    const cardId = "card-1";
    const newTitle = "Zaktualizowany tytuł";

    const { updateCard } = useKanbanStore.getState();
    updateCard(cardId, { title: newTitle });

    const state = useKanbanStore.getState();
    const updatedCard = state.lists
      .flatMap((l) => l.cards)
      .find((c) => c.id === cardId);

    expect(updatedCard).toBeDefined();
    expect(updatedCard!.title).toBe(newTitle);
  });

  it("should delete a card", () => {
    const cardId = "card-1";

    const { deleteCard } = useKanbanStore.getState();
    deleteCard(cardId);

    const state = useKanbanStore.getState();
    const deletedCard = state.lists
      .flatMap((l) => l.cards)
      .find((c) => c.id === cardId);

    expect(deletedCard).toBeUndefined();
  });

  it("should move a card from one list to another", () => {
    const cardId = "card-1";
    const sourceListId = "list-1";
    const destListId = "list-2";

    const { moveCard } = useKanbanStore.getState();
    moveCard(cardId, sourceListId, destListId, 0);

    const state = useKanbanStore.getState();
    expect(state.lists.find((l) => l.id === sourceListId)!.cards).toHaveLength(
      0
    );
    expect(state.lists.find((l) => l.id === destListId)!.cards).toHaveLength(1);
    expect(state.lists.find((l) => l.id === destListId)!.cards[0].id).toBe(
      cardId
    );
  });
});
