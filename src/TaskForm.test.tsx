import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaskForm } from "./TaskForm";

describe("TaskForm", () => {
  it("should submit with valid data", async () => {
    const handleSubmit = vi.fn();
    const handleCancel = vi.fn();

    render(<TaskForm onSubmit={handleSubmit} onCancel={handleCancel} />);

    fireEvent.change(screen.getByLabelText("Tytuł"), {
      target: { value: "Nowe, ważne zadanie" },
    });
    fireEvent.change(screen.getByLabelText(/opis/i), {
      target: { value: "Szczegółowy opis zadania" },
    });
    fireEvent.click(screen.getByText("Zapisz"));

    await waitFor(() => {
      // Sprawdzamy, czy funkcja została wywołana z obiektem zawierającym oczekiwane dane.
      // To ignoruje drugi argument (event), który przekazuje react-hook-form.
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Nowe, ważne zadanie",
          description: "Szczegółowy opis zadania",
        }),
        expect.anything() // Sprawdzamy, że istnieje drugi argument (event), ale ignorujemy jego zawartość.
      );
    });
  });

  it("should show a validation error for a short title (edge case)", async () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} onCancel={() => {}} />);

    // Wpisujemy za krótki tytuł
    fireEvent.change(screen.getByLabelText("Tytuł"), {
      target: { value: "ab" },
    });
    fireEvent.click(screen.getByText("Zapisz"));

    // Oczekujemy na pojawienie się komunikatu o błędzie
    await waitFor(() => {
      expect(
        screen.getByText("Tytuł musi mieć co najmniej 3 znaki.")
      ).toBeInTheDocument();
    });

    // Funkcja onSubmit nie powinna zostać wywołana
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
