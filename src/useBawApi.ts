// src/useBawApi.ts

import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";
import { useState, useCallback } from "react";
// Importa las configuraciones esenciales: URLs base y encabezados de autenticación
import { BAW_BASE, BAW_SERVICE_BASE, AUTH_HEADERS } from "./config";

// Define el tipo para seleccionar la URL base: 'task' para tareas, 'service' para servicios REST
export type BaseUrlType = "task" | "service";

interface BawApiOptions {
  method?: "GET" | "POST";
  endpoint: string;
  payload?: any;
  baseURLType?: BaseUrlType; // Indica qué URL base usar (task o service)
}

interface BawApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (options: BawApiOptions) => Promise<AxiosResponse<T>>;
}

/**
 * Hook personalizado para interactuar con la API REST de IBM BAW (Tareas y Servicios).
 * Proporciona estados para manejar la carga (loading), el error y los datos.
 */
export const useBawApi = <T = any>(): BawApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async ({
      method = "GET",
      endpoint,
      payload,
      baseURLType = "task",
    }: BawApiOptions) => {
      setLoading(true);
      setError(null);
      setData(null); // 1. Seleccionar la URL base basada en el tipo de llamada (Task o Service)

      const baseUrl = baseURLType === "service" ? BAW_SERVICE_BASE : BAW_BASE;
      const url: string = `${baseUrl}${endpoint}`; // 2. Usar los headers de autenticación definidos en config.ts

      const headers = AUTH_HEADERS as unknown as AxiosRequestHeaders; // --- INICIO DEL LOGUEO CURL (Correcciones para TypeScript) ---

      let curlCommand = `curl -X ${method} "${url}"`;

      // Definir el objeto de encabezados de forma segura (clave string, valor string)
      // Usamos Record<string, string> y filtramos/coercemos los valores de AUTH_HEADERS.
      const mergedHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Iterar sobre los encabezados de autenticación y fusionarlos de forma segura
      // Esto resuelve los errores 2322 (tipos incompatibles) y 7031 (implícito 'any')
      for (const key in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, key)) {
          const value = headers[key];
          // AxiosRequestHeaders puede contener valores null/undefined/number/boolean.
          // Solo añadimos encabezados que no sean null/undefined y los coercemos a string.
          if (value !== null && value !== undefined) {
            mergedHeaders[key] = String(value); // Coerción a string
          }
        }
      }

      // Convertir los encabezados en una cadena curl usando Object.keys
      // Esto resuelve el error 2550 (Property 'entries' does not exist)
      const headerString = Object.keys(mergedHeaders)
        .map((key) => ` -H "${key}: ${mergedHeaders[key]}"`)
        .join(" \\\n");

      if (headerString) {
        curlCommand += ` \\\n${headerString}`;
      }

      if (method === "POST" && payload) {
        const payloadString = JSON.stringify(payload); // Añadir el cuerpo de la solicitud, escapando comillas para el shell
        curlCommand += ` \\\n  -d '${payloadString.replace(/'/g, "'\\''")}'`;
      }

      console.log(`\n================ BAW API CALL ===================\n`);
      console.log(`[BAW API] CURL COMMAND:\n${curlCommand}`);
      console.log(`\n=================================================\n`); // --- FIN DEL LOGUEO CURL ---
      try {
        let response: AxiosResponse<T>;

        if (method === "POST") {
          // Ejecuta POST, usado para completar tareas y llamadas a servicios POST
          response = await axios.post<T>(url, payload, { headers });
        } else {
          // Ejecuta GET
          response = await axios.get<T>(url, { headers });
        } // Actualiza el estado con la respuesta exitosa

        setData(response.data);
        setLoading(false);
        return response;
      } catch (err) {
        setLoading(false); // Manejo detallado de errores de Axios
        if (axios.isAxiosError(err)) {
          if (err.message.includes("CORS") || err.message.includes("Network")) {
            setError(
              "Error de red: La llamada fue bloqueada (Posiblemente CORS o red). Revise la consola."
            );
          } else {
            // Captura el estado HTTP (401, 403, 500, etc.)
            setError(
              `Error de API: ${err.response?.status} - ${
                err.response?.statusText || err.message
              }. Revise la consola.`
            );
          }
        } else {
          setError("Ocurrió un error desconocido. Revise la consola.");
        } // Re-lanzar el error para que el componente que llama pueda manejarlo
        throw err;
      }
    },
    []
  );

  return { data, loading, error, execute };
};
