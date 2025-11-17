import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BoardCard } from "./features/board/BoardCard";
import type { Card } from "./types";

describe("BoardCard", () => {
  it("should render card title and priority", () => {
    const mockCard: Card = {
      id: "card-1",
      title: "Testowa karta",
      description: "Opis testowej karty",
      priority: "high",
      list_id: "list-1",
      user_id: "user-1",
      position: 0,
      created_at: "",
      updated_at: "",
    };

    render(<BoardCard card={mockCard} />);

    expect(screen.getByText("Testowa karta")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });
});
