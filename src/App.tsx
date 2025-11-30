// src/App.tsx

import React from "react";
// Importa el componente principal de la interfaz de usuario
import TestHarness from "./TestHarness";
// Importa los estilos globales
import "./styles.css";

/**
 * Componente principal de la aplicación.
 * Solo se encarga de montar el TestHarness de BAW.
 */
export default function App() {
  return (
    <div className="App">
      <TestHarness />
    </div>
  );
}
