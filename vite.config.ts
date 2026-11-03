import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Tauri: não limpar o terminal, para não esconder mensagens de erro do Rust
  clearScreen: false,
  server: {
    host: "::",
    port: 8080,
    // O Tauri aponta para uma URL fixa (devUrl). Se a 8080 estiver ocupada,
    // o Vite deve falhar em vez de subir em outra porta e deixar o app em branco.
    strictPort: true,
    // Não recarregar o frontend quando o Rust compila.
    watch: { ignored: ["**/src-tauri/**"] },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
