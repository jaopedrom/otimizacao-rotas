"use client";

import React from "react";
import AsyncSelect from "react-select/async";
import { useDebouncedCallback } from "use-debounce";

export interface GeocodeCandidate {
    lat: number;
    lng: number;
    displayName: string;
}

interface AddressAutocompleteProps {
    onSelectAddress: (address: GeocodeCandidate | null) => void;
    label?: string;
}

export function AddressAutocomplete({ onSelectAddress, label = "Endereço" }: AddressAutocompleteProps) {

    // Função real que faz o fetch
    const fetchAddresses = async (inputValue: string): Promise<any[]> => {
        if (!inputValue || inputValue.length < 5) return [];

        try {
            const response = await fetch(`/api/geocoding/search?address=${encodeURIComponent(inputValue)}`);
            if (!response.ok) return [];

            const data: GeocodeCandidate[] = await response.json();

            // O react-select exige que as opções tenham o formato { value, label }
            return data.map((candidate) => ({
                value: candidate, // salvamos o objeto completo no value
                label: candidate.displayName, // o que o usuário lê
            }));
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
            return [];
        }
    };

    // Criamos uma versão "debounced" que só executa após 600ms do usuário parar de digitar
    const debouncedLoadOptions = useDebouncedCallback(
        (inputValue: string, callback: (options: any[]) => void) => {
            fetchAddresses(inputValue).then((options) => callback(options));
        },
        600
    );

    return (
        <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <AsyncSelect
                instanceId="address-autocomplete"
                cacheOptions // Guarda os resultados em cache para não refazer busca pro mesmo texto
                loadOptions={(inputValue, callback) => {
                    debouncedLoadOptions(inputValue, callback);
                }}
                defaultOptions={false}
                placeholder="Ex: Avenida Paulista 1578, Sao Paulo..."
                noOptionsMessage={({ inputValue }) =>
                    inputValue.length < 5
                        ? "Digite pelo menos 5 caracteres para buscar..."
                        : "Nenhum endereço encontrado."
                }
                loadingMessage={() => "Buscando..."}
                onChange={(selectedOption: any) => {
                    if (selectedOption) {
                        onSelectAddress(selectedOption.value);
                    } else {
                        onSelectAddress(null);
                    }
                }}
                isClearable
                styles={{
                    control: (baseStyles) => ({
                        ...baseStyles,
                        borderRadius: '0.5rem',
                        padding: '0.1rem',
                        borderColor: '#085fe0ff',
                    }),
                }}
            />
        </div>
    );
}
