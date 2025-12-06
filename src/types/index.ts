import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Reprezentuje uproszczony model użytkownika na potrzeby frontendu.
 */
export type User = Pick<SupabaseUser, "id" | "email">;

/**
 * Dostępne priorytety dla zadań.
 */
export type Priority = "low" | "medium" | "high";

/**
 * Reprezentuje pojedynczą kartę (zadanie) na tablicy Kanban.
 */
export interface Card {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  list_id: string;
  user_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Reprezentuje kolumnę (listę) na tablicy Kanban, zawierającą karty.
 */
export interface List {
  id: string;
  name: string;
  position: number;
  board_id: string;
  cards: Card[];
}

// Dla MVP nie potrzebujemy oddzielnego typu Board, ponieważ zakładamy jedną tablicę na użytkownika.
