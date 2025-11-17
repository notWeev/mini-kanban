/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Umożliwia używanie globalnych API Vitest (describe, it, expect) bez importowania
    globals: true,
    // Symuluje środowisko przeglądarki (DOM) dla testów
    environment: "jsdom",
    // Wskazuje plik konfiguracyjny do uruchomienia przed testami
    setupFiles: "./src/setupTests.ts",
  },
});
