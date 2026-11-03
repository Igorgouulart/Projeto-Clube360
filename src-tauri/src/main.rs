// Evita abrir uma janela de console extra no Windows na versao final. NAO REMOVER.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    clube360_lib::run();
}
