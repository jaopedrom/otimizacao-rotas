"use client";

import { useState } from "react";
import { AddressAutocomplete, GeocodeCandidate } from "../components/AddressAutocomplete";


export default function Home() {
  const [currentSelection, setCurrentSelection] = useState<GeocodeCandidate | null>(null);
  const [stops, setStops] = useState<GeocodeCandidate[]>([]);

  const handleAddStop = () => {
    if (currentSelection) {
      setStops([...stops, currentSelection]);
      setCurrentSelection(null);
    }
  };

  const handleRemoveStop = (indexToRemove: number) => {
    setStops(stops.filter((_, index) => index !== indexToRemove));
  };

  return (

    <div className="flex flex-col flex-1 items-center bg-gray-50 font-sans min-h-screen pt-12 pb-20">
      <main className="flex w-full max-w-3xl flex-col bg-white p-8 rounded-xl shadow-sm border border-gray-100">

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Planejamento de Rotas
        </h1>

        <p className="text-gray-600 mb-8">
          Adicione os endereços de entrega. Posteriormente, estas coordenadas serão enviadas para o motor de otimização (VROOM).
        </p>

        {/* Input de Busca */}
        <div className="flex items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
          <div className="flex-1">
            <AddressAutocomplete
              label="Buscar Novo Endereço"
              onSelectAddress={(address) => setCurrentSelection(address)}
            />
          </div>
          <button
            onClick={handleAddStop}
            disabled={!currentSelection}
            className="h-10 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Adicionar
          </button>
        </div>

        {/* Lista de Endereços Salvos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Entregas Cadastradas <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">{stops.length}</span>
          </h2>

          {stops.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
              Nenhuma entrega adicionada ainda.
            </div>
          ) : (
            <ul className="space-y-3">
              {stops.map((stop, index) => (
                <li key={index} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs mr-2">
                        {index + 1}
                      </span>
                      {stop.displayName.split(',')[0]} {/* Mostra apenas o logradouro para não poluir */}
                    </p>
                    <div className="text-xs text-gray-500 ml-8 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                      Lat: {stop.lat.toFixed(5)} | Lng: {stop.lng.toFixed(5)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStop(index)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors text-sm font-medium"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>
    </div>
  );
}
