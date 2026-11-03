// Clube360 - cliente desktop.
//
// Este aplicativo e SOMENTE a janela que exibe o frontend (React).
// O backend (Express) e o banco (PostgreSQL) rodam no computador do bar,
// de forma independente. Nada de servidor, banco ou impressao aqui.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Clube360");
}
