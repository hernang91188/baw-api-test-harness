// src/DataHandler.tsx

import React, { useEffect } from "react";
import { useBawApi } from "./useBawApi"; // Reutilizamos el hook

interface DataHandlerProps {
  idSolicitud: string;
  sectorOrigen: string;
  // Callback para enviar los datos de vuelta al padre (TaskHandler) si es necesario
  onDataLoaded: (data: any) => void;
  onDataLoading: (loading: boolean) => void;
}

/**
 * Componente que se encarga de llamar al servicio de datos de BAW y renderizar los resultados.
 */
const DataHandler: React.FC<DataHandlerProps> = ({
  idSolicitud,
  sectorOrigen,
  onDataLoaded,
  onDataLoading,
}) => {
  // Hook para la llamada al servicio de datos de BAW (Base de Servicios)
  const {
    data: dbData,
    loading: dataLoading,
    error: dataServiceError,
    execute: executeGetDataService,
  } = useBawApi();

  // ----------------------------------------------------------------------
  // EFECTO: Llamar al servicio al montar y cuando los IDs cambien
  // ----------------------------------------------------------------------
  useEffect(() => {
    // Notificar al padre que la carga ha comenzado
    onDataLoading(true);

    const fetchBawDataService = async () => {
      // 🚨 El endpoint de tu servicio REST expuesto
      const endpoint = "/REST%20Service/get-client-data"; // Reemplazar con el endpoint real

      try {
        const response = await executeGetDataService({
          method: "POST",
          endpoint: endpoint,
          payload: {
            idSolicitud: idSolicitud,
            sectorOrigen: sectorOrigen,
          },
          baseURLType: "service", // Usar la base de Automation Services
        });

        // Notificar al padre (TaskHandler) que los datos están listos
        onDataLoaded(response.data);
      } catch (e) {
        console.error("Fallo en la llamada a servicio BAW:", dataServiceError);
        onDataLoaded(null); // Enviar nulo si hay error
      } finally {
        onDataLoading(false);
      }
    };

    fetchBawDataService();
  }, [idSolicitud, sectorOrigen, onDataLoaded, onDataLoading]); // Dependencias

  // ----------------------------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------------------------

  if (dataLoading) {
    return (
      <p style={{ color: "#007ad9", fontWeight: "bold" }}>
        Cargando datos externos...
      </p>
    );
  }

  if (dataServiceError) {
    return (
      <p style={{ color: "red" }}>
        ❌ Error al cargar datos: {dataServiceError}
      </p>
    );
  }

  if (!dbData) {
    return <p>Esperando datos...</p>;
  }

  // Mostrar los datos obtenidos
  return (
    <>
      <h3 style={{ color: "#0056b3" }}>Datos Externos (Vía Servicio BAW):</h3>
      <pre
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {JSON.stringify(dbData, null, 2)}
      </pre>
    </>
  );
};

export default DataHandler;
