import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type LoginFormData,
  type RegisterFormData,
} from "../features/auth/schemas";
import { SupabaseRepository } from "../lib/SupabaseRepository";
import { LoginForm } from "../features/auth/LoginForm";
import { RegisterForm } from "../features/auth/RegisterForm";

const repository = new SupabaseRepository();

export function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setAuthError(null); // Czyścimy błędy autentykacji
  };

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);

    const credentials = { email: data.email, password: data.password };
    const { error } = isLoginView
      ? await repository.signIn(credentials)
      : await repository.signUp(credentials);

    setIsLoading(false);

    if (error) {
      setAuthError(error.message);
    } else {
      // Po udanym logowaniu/rejestracji przekieruj na stronę główną
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center pt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          {isLoginView ? "Logowanie" : "Rejestracja"}
        </h1>

        {isLoginView ? (
          <LoginForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            authError={authError}
          />
        ) : (
          <RegisterForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            authError={authError}
          />
        )}

        <p className="text-sm text-center">
          {isLoginView ? "Nie masz konta? " : "Masz już konto? "}
          <button
            onClick={toggleView}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLoginView ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </p>
      </div>
    </div>
  );
}
