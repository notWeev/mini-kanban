import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import type { IDataRepository } from "./repository";
import { supabase } from "./supabase";
import type { Card, List } from "../types/index";

export class SupabaseRepository implements IDataRepository {
  // --- Auth ---
  async signIn(credentials: SignInWithPasswordCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    return { user: data.user, session: data.session, error };
  }

  async signUp(credentials: SignUpWithPasswordCredentials) {
    const { data, error } = await supabase.auth.signUp(credentials);
    return { user: data.user, session: data.session, error };
  }

  async signOut() {
    return supabase.auth.signOut();
  }

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    // Zwracamy tylko potrzebne pola, zgodnie z naszym typem User
    const user = data.user
      ? { id: data.user.id, email: data.user.email }
      : null;
    return { user, error };
  }

  // --- Board ---
  async getBoard() {
    // Zakładamy na razie, że użytkownik ma jedną tablicę (board)
    // Pobieramy wszystkie listy należące do tablicy użytkownika,
    // a wraz z nimi wszystkie zagnieżdżone karty, posortowane według pozycji.
    const { data, error } = await supabase
      .from("lists")
      .select("*, cards(*)")
      .order("position")
      .order("position", { foreignTable: "cards" });

    // Supabase zwraca typ generyczny, rzutujemy go na nasz typ List[]
    return { data: data as List[] | null, error };
  }

  // --- Lists ---
  async createDefaultListsForNewUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { data: null, error: new Error("User not authenticated") };

    // 1. Stwórz domyślną tablicę (board) dla użytkownika
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({ user_id: user.id, name: "Moja tablica" })
      .select()
      .single();

    if (boardError) return { data: null, error: boardError };

    // 2. Stwórz domyślne listy dla tej tablicy
    const defaultLists = [
      { board_id: board.id, name: "Do zrobienia", position: 0 },
      { board_id: board.id, name: "W toku", position: 1 },
      { board_id: board.id, name: "Zrobione", position: 2 },
    ];

    const { data, error } = await supabase
      .from("lists")
      .insert(defaultLists)
      .select("*, cards(*)");

    return { data: data as List[] | null, error };
  }

  async createList(boardId: string, name: string, position: number) {
    const { data, error } = await supabase
      .from("lists")
      .insert({ board_id: boardId, name, position })
      .select("*, cards(*)") // Zwróć nową listę z pustą tablicą kart
      .single();
    return { data: data as List | null, error };
  }

  // --- Cards ---
  async getCards() {
    // Zakładamy, że RLS jest skonfigurowane i zwróci tylko karty zalogowanego użytkownika
    const { data, error } = await supabase.from("cards").select("*");
    return { data, error };
  }

  async createCard(
    cardData: Omit<Card, "id" | "created_at" | "updated_at" | "user_id">
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { data: null, error: new Error("User not authenticated") };

    const { data, error } = await supabase
      .from("cards")
      .insert({ ...cardData, user_id: user.id })
      .select()
      .single();

    return { data, error };
  }

  async updateCard(
    cardId: string,
    updates: Partial<Omit<Card, "id" | "created_at" | "updated_at" | "user_id">>
  ) {
    const { data, error } = await supabase
      .from("cards")
      .update(updates)
      .eq("id", cardId)
      .select()
      .single();
    return { data, error };
  }

  async deleteCard(cardId: string) {
    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    return { error };
  }
}
