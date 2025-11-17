import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            MiniKanban
          </Link>
          <div>
            {/* W przyszłości pojawi się tu informacja o użytkowniku i przycisk wylogowania */}
            <span className="text-gray-700">Zaloguj się</span>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
