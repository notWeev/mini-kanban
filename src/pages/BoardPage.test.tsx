import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BoardPage } from "./BoardPage";
// import { useKanbanStore } from "../store/kanbanStore";

vi.mock("../store/kanbanStore", () => {
  // Mockujemy store Zustand, aby dostarczyć kontrolowane dane do testu
  const mockLists = [
    {
      id: "list-1",
      name: "Do zrobienia",
      position: 0,
      cards: [
        {
          id: "card-1",
          title: "Zadanie o wysokim priorytecie",
          priority: "high",
          description: null,
          list_id: "list-1",
          user_id: "user-1",
          position: 0,
          created_at: "",
          updated_at: "",
        },
        {
          id: "card-2",
          title: "Zadanie o niskim priorytecie",
          priority: "low",
          description: "Ważny opis",
          list_id: "list-1",
          user_id: "user-1",
          position: 1,
          created_at: "",
          updated_at: "",
        },
      ],
    },
  ];

  // Tworzymy pełny, mockowy stan, którego oczekuje komponent
  const mockState = {
    lists: mockLists,
    isLoading: false,
    fetchBoard: vi.fn(),
    moveCard: vi.fn(),
  };
  return {
    useKanbanStore: vi.fn((selector) =>
      selector ? selector(mockState) : mockState
    ),
  };
});

describe("BoardPage", () => {
  it("should filter cards by text input", () => {
    render(<BoardPage />);

    // Początkowo obie karty są widoczne
    expect(
      screen.getByText("Zadanie o wysokim priorytecie")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Zadanie o niskim priorytecie")
    ).toBeInTheDocument();

    // Wpisujemy tekst w pole filtra
    const filterInput = screen.getByPlaceholderText("Filtruj zadania...");
    fireEvent.change(filterInput, { target: { value: "Ważny opis" } });

    // Tylko karta z pasującym opisem powinna być widoczna
    expect(
      screen.queryByText("Zadanie o wysokim priorytecie")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Zadanie o niskim priorytecie")
    ).toBeInTheDocument();
  });

  it("should filter cards by priority", () => {
    render(<BoardPage />);

    // Początkowo obie karty są widoczne
    expect(
      screen.getByText("Zadanie o wysokim priorytecie")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Zadanie o niskim priorytecie")
    ).toBeInTheDocument();

    // Wybieramy priorytet "high" z listy
    const prioritySelect = screen.getByRole("combobox");
    fireEvent.change(prioritySelect, { target: { value: "high" } });

    // Tylko karta z wysokim priorytetem powinna być widoczna
    expect(
      screen.queryByText("Zadanie o niskim priorytecie")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Zadanie o wysokim priorytecie")
    ).toBeInTheDocument();
  });
});
