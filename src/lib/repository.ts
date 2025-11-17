import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import type { Card, User } from "../types/index";

/**
 * Definiuje kontrakt dla operacji na danych, abstrahując od konkretnej implementacji (np. Supabase, Firebase).
 */
export interface IDataRepository {
  // --- Auth ---
  signIn(credentials: SignInWithPasswordCredentials): Promise<{
    user: SupabaseUser | null;
    session: Session | null;
    error: Error | null;
  }>;

  signUp(credentials: SignUpWithPasswordCredentials): Promise<{
    user: SupabaseUser | null;
    session: Session | null;
    error: Error | null;
  }>;

  signOut(): Promise<{ error: Error | null }>;
  getUser(): Promise<{ user: User | null; error: Error | null }>;

  // --- Cards ---
  getCards(): Promise<{ data: Card[] | null; error: Error | null }>;

  createCard(
    cardData: Omit<Card, "id" | "created_at" | "updated_at" | "user_id">
  ): Promise<{ data: Card | null; error: Error | null }>;

  updateCard(
    cardId: string,
    updates: Partial<Omit<Card, "id" | "created_at" | "updated_at" | "user_id">>
  ): Promise<{ data: Card | null; error: Error | null }>;

  deleteCard(cardId: string): Promise<{ error: Error | null }>;

  // W przyszłości można dodać metody dla List i Board
  // getLists(): Promise<List[]>;
  // updateCardPosition(cardId: string, newListId: string, newPosition: number): Promise<void>;
}

// Konkretna implementacja, np. SupabaseRepository, będzie implementować ten interfejs.
// class SupabaseRepository implements IDataRepository { ... }
