// src/config.ts

// --------------------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE URLS BASE
// --------------------------------------------------------------------------------------

// URL BASE PARA COMPLETAR TAREAS (API de Tareas de Usuario)
// Se usa para endpoints como /bpm/user-tasks/[ID]/complete
export const BAW_BASE: string = "https://bcbadv2461.ciudad.bco:9444";

// URL BASE PARA LLAMADAS A SERVICIOS DE DATOS (Automation Services)
// Se usa para endpoints como /automationservices/rest/PR/REST%20Service/get-client-data
// Reemplaza 'PR' por el acrónimo de tu Process App si es diferente.
export const BAW_SERVICE_BASE: string =
  "https://bcbadv2461.ciudad.bco:9444/automationservices/rest/PR";

// --------------------------------------------------------------------------------------
// 2. CREDENCIALES Y AUTENTICACIÓN (Modificar con datos reales)
// --------------------------------------------------------------------------------------

// 🚨 PASO CRÍTICO: Reemplaza 'tuusuarioBAW' y 'tucontraseñaBAW' con tus credenciales reales
const user: string = "tuusuarioBAW";
const password: string = "tucontraseñaBAW";

// 🚨 TOKEN CSRF: **DEBE SER UN TOKEN VÁLIDO Y ACTUAL**
// Este token es necesario para las peticiones POST (como completar tareas) y debe obtenerse de una sesión BAW.
export const BPM_CSRF_TOKEN: string = "PON_AQUI_UN_TOKEN_CSRF_RECIEN_GENERADO";

// Codifica las credenciales en Base64 para el encabezado de Autorización Basic
// La función btoa() convierte la cadena en Base64.
const encodedCredentials: string = btoa(`${user}:${password}`);

// Objeto de encabezados de autenticación final para la librería Axios
export const AUTH_HEADERS = {
  Authorization: `Basic ${encodedCredentials}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  // El token CSRF es crucial para las peticiones que modifican datos (POST)
  BPMCSRFToken: BPM_CSRF_TOKEN,
};
