import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            MiniKanban
          </Link>
          <div className="flex items-center gap-4">
            <AuthStatus />
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

function AuthStatus() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // Przekieruj na stronę logowania po wylogowaniu
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Ładowanie...</div>;
  }

  return user ? (
    <>
      <span className="text-sm text-gray-700">{user.email}</span>
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-blue-600 hover:text-blue-500"
      >
        Wyloguj się
      </button>
    </>
  ) : (
    <Link
      to="/login"
      className="text-sm font-medium text-blue-600 hover:text-blue-500"
    >
      Zaloguj się
    </Link>
  );
}
