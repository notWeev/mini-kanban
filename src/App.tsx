import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BoardPage } from "./pages/BoardPage";
import { BoardsPage } from "./pages/BoardsPage";
import { LoginPage } from "./pages/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true, // Domyślna podstrona dla "/"
        element: <BoardsPage />,
      },
      {
        path: "board/:id",
        element: <BoardPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
