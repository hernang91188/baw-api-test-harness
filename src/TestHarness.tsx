// src/TestHarness.tsx

import React, { useState, CSSProperties } from "react"; // Importamos CSSProperties para el tipado de estilos
import { useBawApi } from "./useBawApi"; // Asegúrate de que este archivo (useBawApi.ts/tsx) esté disponible

// Datos por defecto para los formularios de prueba
const DEFAULT_SERVICE_ENDPOINT = "/REST%20Service/get-client-data"; // Endpoint de servicio REST de ejemplo
const DEFAULT_TASK_PAYLOAD = JSON.stringify(
  {
    output: [
      { name: "tareaAprobada", data: true },
      { name: "comentario", data: "Prueba manual desde Test Harness" },
    ],
  },
  null,
  2
);

/**
 * Pantalla de prueba para ejecutar manualmente las APIs de BAW (Servicios y Tareas).
 * Incluye secciones para completar tareas y llamar a servicios REST.
 */
const TestHarness: React.FC = () => {
  // ---------------------------------------------------
  // ESTADOS PARA PRUEBA DE SERVICIOS
  // ---------------------------------------------------
  const [serviceEndpoint, setServiceEndpoint] = useState<string>(
    DEFAULT_SERVICE_ENDPOINT
  );
  const [servicePayload, setServicePayload] = useState<string>(
    '{\n  "idSolicitud": "SOL-TEST-001"\n}'
  );
  const [serviceMethod, setServiceMethod] = useState<"GET" | "POST">("POST");

  // Hook para llamadas a Servicios REST
  const {
    data: serviceData,
    loading: serviceLoading,
    error: serviceError,
    execute: executeServiceCall,
  } = useBawApi();

  // ---------------------------------------------------
  // ESTADOS PARA PRUEBA DE TAREAS
  // ---------------------------------------------------
  const [taskId, setTaskId] = useState<string>("12345"); // ID de tarea de prueba de ejemplo
  const [taskPayload, setTaskPayload] = useState<string>(DEFAULT_TASK_PAYLOAD);

  // Hook para completar Tareas
  const {
    data: taskData,
    loading: taskLoading,
    error: taskError,
    execute: executeTaskComplete,
  } = useBawApi();

  // ---------------------------------------------------
  // MANEJADORES DE ACCIONES
  // ---------------------------------------------------

  /**
   * Maneja la llamada al servicio REST expuesto por la Process App.
   */
  const handleServiceCall = async () => {
    try {
      const payloadObject = JSON.parse(servicePayload);
      await executeServiceCall({
        method: serviceMethod,
        endpoint: serviceEndpoint,
        payload: payloadObject,
        baseURLType: "service", // Usa la base de servicios (BAW_SERVICE_BASE de config.ts)
      });
      console.log(
        "Llamada a servicio ejecutada. Revise el panel de Resultados."
      );
    } catch (e) {
      console.error("Error al ejecutar servicio:", e);
    }
  };

  /**
   * Maneja el completado de una tarea de usuario de BAW.
   */
  const handleTaskCompletion = async () => {
    if (!taskId) {
      console.error("Error: Debe ingresar un Task ID.");
      return;
    }

    try {
      const payloadObject = JSON.parse(taskPayload);
      const endpoint = `/bpm/user-tasks/${taskId}/complete`;

      await executeTaskComplete({
        method: "POST",
        endpoint: endpoint,
        payload: payloadObject,
        baseURLType: "task", // Usa la base de tareas (BAW_BASE de config.ts)
      });
      console.log(
        `Tarea ID ${taskId} ejecutada con éxito (Revise el panel de Resultados).`
      );
    } catch (e) {
      console.error(`Error al completar la tarea. Causa: ${taskError}`, e);
    }
  };

  // ---------------------------------------------------
  // RENDERIZADO Y ESTILOS EN LÍNEA (CORRECCIÓN DE TIPADO)
  // ---------------------------------------------------

  // Al usar el casting explícito 'as CSSProperties' en cada sub-objeto,
  // resolvemos los errores de tipado de boxSizing y overflowX.
  const style = {
    common: {
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      marginBottom: "20px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    } as CSSProperties,
    button: {
      padding: "10px 20px",
      borderRadius: "5px",
      border: "none",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "15px",
      transition: "background-color 0.3s ease",
    } as CSSProperties,
    label: {
      display: "block",
      fontWeight: "bold",
      marginTop: "10px",
      marginBottom: "5px",
    } as CSSProperties,
    // Estilo corregido para inputs, textareas y selects (Resuelve errores de boxSizing)
    input: {
      width: "100%",
      padding: "10px",
      margin: "5px 0 10px 0",
      boxSizing: "border-box",
      border: "1px solid #ddd",
      borderRadius: "4px",
    } as CSSProperties,
    // Estilo corregido para bloques <pre> (Resuelve errores de overflowX)
    pre: {
      backgroundColor: "#e9ecef",
      padding: "15px",
      borderRadius: "4px",
      whiteSpace: "pre-wrap",
      overflowX: "auto",
      maxHeight: "300px",
    } as CSSProperties,
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: "#0056b3" }}>🔧 BAW API Test Harness</h1>
      <p style={{ textAlign: "center", color: "#666" }}>
        Herramienta para probar manualmente las dos principales integraciones:
        Servicios de Datos y Completado de Tareas.
      </p>
      <hr style={{ marginBottom: "30px" }} />

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}
      >
        {/* SECCIÓN 1: PRUEBA DE COMPLETADO DE TAREAS */}
        <div style={{ ...style.common, borderLeft: "5px solid #dc3545" }}>
          <h2 style={{ color: "#dc3545" }}>1. Completar Tarea (Task API)</h2>

          <label style={style.label}>Task ID a completar:</label>
          <input
            type="text"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            style={style.input} // Usa el estilo corregido
          />

          <label style={style.label}>
            Payload JSON de Salida (`output` para la Tarea):
          </label>
          <textarea
            value={taskPayload}
            onChange={(e) => setTaskPayload(e.target.value)}
            rows={10}
            style={{ ...style.input, fontFamily: "monospace" }} // Usa el estilo corregido
          />

          <button
            onClick={handleTaskCompletion}
            disabled={taskLoading || !taskId}
            style={{
              ...style.button,
              backgroundColor: taskLoading ? "#ccc" : "#dc3545",
              color: "white",
            }}
          >
            {taskLoading
              ? "Completando Tarea..."
              : `Ejecutar /bpm/user-tasks/${taskId}/complete`}
          </button>

          {/* Resultado */}
          <div style={{ marginTop: "20px" }}>
            <h3 style={style.label}>Resultado de Completado:</h3>
            {taskError && <p style={{ color: "red" }}>Error: {taskError}</p>}
            {taskData && (
              <pre style={{ ...style.pre, backgroundColor: "#ffe9e9" }}>
                {JSON.stringify(taskData, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* SECCIÓN 2: PRUEBA DE SERVICIOS REST */}
        <div style={{ ...style.common, borderLeft: "5px solid #00a359" }}>
          <h2 style={{ color: "#00a359" }}>
            2. Llamar Servicio REST (Automation Services)
          </h2>

          <label style={style.label}>Método:</label>
          <select
            value={serviceMethod}
            onChange={(e) => setServiceMethod(e.target.value as "GET" | "POST")}
            style={style.input} // Usa el estilo corregido
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>

          <label style={style.label}>
            Endpoint (Ej. /REST%20Service/get-client-data):
          </label>
          <input
            type="text"
            value={serviceEndpoint}
            onChange={(e) => setServiceEndpoint(e.target.value)}
            style={style.input} // Usa el estilo corregido
          />

          <label style={style.label}>Payload JSON de Entrada:</label>
          <textarea
            value={servicePayload}
            onChange={(e) => setServicePayload(e.target.value)}
            rows={10}
            style={{ ...style.input, fontFamily: "monospace" }} // Usa el estilo corregido
          />

          <button
            onClick={handleServiceCall}
            disabled={serviceLoading}
            style={{
              ...style.button,
              backgroundColor: serviceLoading ? "#ccc" : "#00a359",
              color: "white",
            }}
          >
            {serviceLoading
              ? "Ejecutando Servicio..."
              : "Ejecutar Servicio REST"}
          </button>

          {/* Resultado */}
          <div style={{ marginTop: "20px" }}>
            <h3 style={style.label}>Resultado del Servicio:</h3>
            {serviceError && (
              <p style={{ color: "red" }}>Error: {serviceError}</p>
            )}
            {serviceData && (
              <pre style={{ ...style.pre, backgroundColor: "#e6ffe6" }}>
                {JSON.stringify(serviceData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHarness;
