"use client";

import { createContext, useContext, useState } from "react";

interface TorneoContextValue {
    torneoId: string;
    setTorneoId: (id: string) => void;
}

const TorneoContext = createContext<TorneoContextValue | null>(null);

export function TorneoProvider({
    defaultTorneoId,
    children,
}: {
    defaultTorneoId: string;
    children: React.ReactNode;
}) {
    const [torneoId, setTorneoId] = useState(defaultTorneoId);
    return (
        <TorneoContext.Provider value={{ torneoId, setTorneoId }}>
            {children}
        </TorneoContext.Provider>
    );
}

export function useTorneoSeleccionado() {
    const ctx = useContext(TorneoContext);
    if (!ctx) {
        throw new Error("useTorneoSeleccionado debe usarse dentro de <TorneoProvider>");
    }
    return ctx;
}
