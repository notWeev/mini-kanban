import { describe, it, expect, beforeEach, vi } from "vitest";
import { useKanbanStore } from "./store/kanbanStore";
import { SupabaseRepository } from "./lib/SupabaseRepository";
import type { Card, List } from "./types";

// Mockujemy całą klasę repozytorium. Vitest zastąpi wszystkie jej metody pustymi funkcjami.
vi.mock("./lib/SupabaseRepository");

const initialState = useKanbanStore.getState();
beforeEach(() => {
  // Resetujemy stan store'a przed każdym testem
  useKanbanStore.setState(initialState, true);
  // Czyścimy wszystkie mocki, aby testy były od siebie odizolowane
  vi.clearAllMocks();
});

describe("Kanban Store", () => {
  it("should fetch the board and set lists", async () => {
    const mockLists: List[] = [
      {
        id: "list-1",
        name: "Test List",
        position: 0,
        board_id: "board-1",
        cards: [],
      },
    ];
    // Konfigurujemy mocka, aby `getBoard` zwracał nasze dane testowe
    vi.mocked(SupabaseRepository.prototype.getBoard).mockResolvedValue({
      data: mockLists,
      error: null,
    });

    const { fetchBoard } = useKanbanStore.getState();
    await fetchBoard();

    const state = useKanbanStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.lists).toEqual(mockLists);
  });

  it("should add a new card by calling the repository", async () => {
    const listId = "list-1";
    // Ustawiamy początkowy stan dla tego testu
    useKanbanStore.setState({
      lists: [
        {
          id: listId,
          name: "Test",
          position: 0,
          board_id: "board-1",
          cards: [],
        },
      ],
      isLoading: false,
    });

    const newCardData = {
      title: "Nowe zadanie",
      description: "Opis",
      priority: "medium" as const,
    };
    const returnedCard: Card = {
      ...newCardData,
      id: "card-new",
      list_id: listId,
      position: 0,
      user_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Konfigurujemy mocka, aby `createCard` zwracał nową kartę
    vi.mocked(SupabaseRepository.prototype.createCard).mockResolvedValue({
      data: returnedCard,
      error: null,
    });

    const { addCard } = useKanbanStore.getState();
    await addCard(listId, newCardData);

    // Sprawdzamy, czy metoda repozytorium została wywołana z poprawnymi danymi
    expect(SupabaseRepository.prototype.createCard).toHaveBeenCalledWith({
      ...newCardData,
      list_id: listId,
      position: 0,
    });

    // Sprawdzamy, czy stan store'a został poprawnie zaktualizowany
    const state = useKanbanStore.getState();
    expect(state.lists[0].cards).toHaveLength(1);
    expect(state.lists[0].cards[0]).toEqual(returnedCard);
  });

  it("should optimistically update a card and call the repository", async () => {
    const cardId = "card-1";
    const listId = "list-1";
    const newTitle = "Zaktualizowany tytuł";

    // Ustawiamy stan początkowy z jedną kartą
    useKanbanStore.setState({
      lists: [
        {
          id: listId,
          name: "Test",
          position: 0,
          board_id: "board-1",
          cards: [
            {
              id: cardId,
              title: "Stary tytuł",
            } as Card,
          ],
        },
      ],
      isLoading: false,
    });

    // Konfigurujemy mocka, aby `updateCard` zwracał poprawną odpowiedź
    vi.mocked(SupabaseRepository.prototype.updateCard).mockResolvedValue({
      data: { id: cardId, title: newTitle } as Card,
      error: null,
    });

    const { updateCard } = useKanbanStore.getState();
    await updateCard(cardId, { title: newTitle });

    // Sprawdzamy, czy UI zostało zaktualizowane optymistycznie (natychmiast)
    expect(useKanbanStore.getState().lists[0].cards[0].title).toBe(newTitle);
    // Sprawdzamy, czy metoda repozytorium została wywołana w tle
    expect(SupabaseRepository.prototype.updateCard).toHaveBeenCalledWith(
      cardId,
      {
        title: newTitle,
      }
    );
  });

  it("should optimistically delete a card and call the repository", async () => {
    const cardId = "card-1";
    const listId = "list-1";

    // Ustawiamy stan początkowy z jedną kartą
    useKanbanStore.setState({
      lists: [
        {
          id: listId,
          name: "Test",
          position: 0,
          board_id: "board-1",
          cards: [
            {
              id: cardId,
              title: "Do usunięcia",
            } as Card,
          ],
        },
      ],
      isLoading: false,
    });

    // Konfigurujemy mocka, aby `deleteCard` nic nie zwracał (sukces)
    vi.mocked(SupabaseRepository.prototype.deleteCard).mockResolvedValue({
      error: null,
    });

    const { deleteCard } = useKanbanStore.getState();
    await deleteCard(cardId, listId);

    // Sprawdzamy, czy UI zostało zaktualizowane optymistycznie
    expect(useKanbanStore.getState().lists[0].cards).toHaveLength(0);

    // Sprawdzamy, czy metoda repozytorium została wywołana
    expect(SupabaseRepository.prototype.deleteCard).toHaveBeenCalledWith(
      cardId
    );
  });

  it("should optimistically move a card and call the repository", async () => {
    const cardId = "card-1";
    const sourceListId = "list-1";
    const destListId = "list-2";

    // Ustawiamy stan początkowy z dwiema listami i jedną kartą
    useKanbanStore.setState({
      lists: [
        {
          id: sourceListId,
          name: "Source",
          position: 0,
          board_id: "board-1",
          cards: [
            {
              id: cardId,
              title: "Przenośna karta",
              list_id: sourceListId,
              description: null,
              priority: "medium",
              user_id: "user-1",
              position: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Card,
          ],
        },
        {
          id: destListId,
          name: "Destination",
          position: 1,
          board_id: "board-1",
          cards: [],
        },
      ],
      isLoading: false,
    });

    vi.mocked(SupabaseRepository.prototype.updateCard).mockResolvedValue({
      data: {} as Card,
      error: null,
    });

    const { moveCard } = useKanbanStore.getState();
    await moveCard(cardId, sourceListId, destListId, 0);

    // Sprawdzamy, czy UI zostało zaktualizowane optymistycznie
    const state = useKanbanStore.getState();
    expect(state.lists.find((l) => l.id === sourceListId)?.cards).toHaveLength(
      0
    );
    expect(state.lists.find((l) => l.id === destListId)?.cards).toHaveLength(1);
    expect(state.lists.find((l) => l.id === destListId)?.cards[0].id).toBe(
      cardId
    );

    // Sprawdzamy, czy metoda repozytorium została wywołana z poprawnymi danymi
    expect(SupabaseRepository.prototype.updateCard).toHaveBeenCalledWith(
      cardId,
      { list_id: destListId, position: 0 }
    );
  });
});
