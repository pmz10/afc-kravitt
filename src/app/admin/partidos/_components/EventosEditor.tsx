"use client";

import { useRef, useState } from "react";
import type { EventoPartido, Jugador, JugadorRival, Rival, TipoEvento } from "@/types";

const inputCls =
    "w-full px-2 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-xs";

type TipoOpcion = { value: TipoEvento; label: string; emoji: string };

const TIPOS_PROPIOS: TipoOpcion[] = [
    { value: "gol", label: "Gol", emoji: "⚽" },
    { value: "asistencia", label: "Asistencia", emoji: "🅰️" },
    { value: "amarilla", label: "Amarilla", emoji: "🟨" },
    { value: "roja", label: "Roja directa", emoji: "🟥" },
    { value: "doble_amarilla", label: "Doble amarilla", emoji: "🟨🟨" },
    { value: "autogol", label: "Autogol", emoji: "🔴" },
    { value: "penal_anotado", label: "Penal anotado", emoji: "⚽" },
    { value: "penal_fallado", label: "Penal fallado", emoji: "❌" },
    { value: "atajada", label: "Atajada", emoji: "🧤" },
    { value: "falta", label: "Falta cometida", emoji: "🚫" },
    { value: "lesion", label: "Lesión", emoji: "🩹" },
];

const TIPOS_RIVAL: TipoOpcion[] = [
    { value: "gol_rival", label: "Gol", emoji: "⚽" },
    { value: "asistencia_rival", label: "Asistencia", emoji: "🅰️" },
    { value: "amarilla_rival", label: "Amarilla", emoji: "🟨" },
    { value: "roja_rival", label: "Roja directa", emoji: "🟥" },
    { value: "doble_amarilla_rival", label: "Doble amarilla", emoji: "🟨🟨" },
    { value: "penal_anotado_rival", label: "Penal anotado", emoji: "⚽" },
    { value: "penal_fallado_rival", label: "Penal fallado", emoji: "❌" },
    { value: "atajada_rival", label: "Atajada", emoji: "🧤" },
    { value: "falta_rival", label: "Falta cometida", emoji: "🚫" },
];

const LABELS = new Map<TipoEvento, { label: string; emoji: string }>(
    [...TIPOS_PROPIOS, ...TIPOS_RIVAL].map((t) => [t.value, { label: t.label, emoji: t.emoji }]),
);

type EventoLocal = {
    localId: string;
    tipo: TipoEvento;
    jugadorId?: string;
    jugadorRivalId?: string;
    minuto?: number;
    notas?: string;
};

function useIdGenerator() {
    const [prefijo] = useState(() => Math.random().toString(36).slice(2, 8));
    const contador = useRef(0);
    return () => `${prefijo}_${contador.current++}`;
}

export interface EventosEditorProps {
    jugadoresActivos: Jugador[];
    jugadoresRivales: JugadorRival[];
    rivales: Rival[];
    eventosIniciales: EventoPartido[];
}

export function EventosEditor({
    jugadoresActivos,
    jugadoresRivales,
    rivales,
    eventosIniciales,
}: EventosEditorProps) {
    const nuevoId = useIdGenerator();
    const [eventos, setEventos] = useState<EventoLocal[]>(() =>
        eventosIniciales.map((ev) => ({
            localId: nuevoId(),
            tipo: ev.tipo,
            jugadorId: "jugadorId" in ev ? ev.jugadorId : undefined,
            jugadorRivalId: "jugadorRivalId" in ev ? ev.jugadorRivalId : undefined,
            minuto: ev.minuto,
            notas: ev.notas,
        })),
    );

    const jugadoresOrdenados = [...jugadoresActivos].sort((a, b) => a.dorsal - b.dorsal);

    function agregar(
        target: { jugadorId?: string; jugadorRivalId?: string },
        tipo: TipoEvento,
        minuto?: number,
        notas?: string,
    ) {
        setEventos((prev) => [...prev, { localId: nuevoId(), tipo, minuto, notas, ...target }]);
    }

    function quitar(localId: string) {
        setEventos((prev) => prev.filter((e) => e.localId !== localId));
    }

    const eventosJson = JSON.stringify(
        eventos.map((e) => ({
            tipo: e.tipo,
            jugadorId: e.jugadorId,
            jugadorRivalId: e.jugadorRivalId,
            minuto: e.minuto,
            notas: e.notas,
        })),
    );

    return (
        <div className="space-y-6">
            <input type="hidden" name="eventosJson" value={eventosJson} />

            <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                    Nuestros jugadores
                </h3>
                {jugadoresOrdenados.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                        Convocá jugadores arriba para poder cargarles eventos.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {jugadoresOrdenados.map((j) => (
                            <JugadorCard
                                key={j.id}
                                titulo={`#${j.dorsal} ${j.nombre} ${j.apellido}`}
                                tipos={TIPOS_PROPIOS}
                                eventos={eventos.filter((e) => e.jugadorId === j.id)}
                                onAgregar={(tipo, minuto, notas) =>
                                    agregar({ jugadorId: j.id }, tipo, minuto, notas)
                                }
                                onQuitar={quitar}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Rival</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <JugadorCard
                        titulo="Autor desconocido"
                        tipos={TIPOS_RIVAL}
                        eventos={eventos.filter(
                            (e) => TIPOS_RIVAL.some((t) => t.value === e.tipo) && !e.jugadorRivalId,
                        )}
                        onAgregar={(tipo, minuto, notas) => agregar({}, tipo, minuto, notas)}
                        onQuitar={quitar}
                    />
                    {jugadoresRivales.map((jr) => {
                        const rival = rivales.find((r) => r.id === jr.rivalId);
                        const etiqueta = [
                            jr.dorsal ? `#${jr.dorsal}` : null,
                            jr.nombre ?? jr.apodo ?? "Sin nombre",
                            rival ? `(${rival.nombre})` : null,
                        ]
                            .filter(Boolean)
                            .join(" ");
                        return (
                            <JugadorCard
                                key={jr.id}
                                titulo={etiqueta}
                                tipos={TIPOS_RIVAL}
                                eventos={eventos.filter((e) => e.jugadorRivalId === jr.id)}
                                onAgregar={(tipo, minuto, notas) =>
                                    agregar({ jugadorRivalId: jr.id }, tipo, minuto, notas)
                                }
                                onQuitar={quitar}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function JugadorCard({
    titulo,
    tipos,
    eventos,
    onAgregar,
    onQuitar,
}: {
    titulo: string;
    tipos: TipoOpcion[];
    eventos: EventoLocal[];
    onAgregar: (tipo: TipoEvento, minuto?: number, notas?: string) => void;
    onQuitar: (localId: string) => void;
}) {
    const [abierto, setAbierto] = useState(false);
    const [detalles, setDetalles] = useState(false);
    const [tipo, setTipo] = useState<TipoEvento>(tipos[0].value);
    const [minuto, setMinuto] = useState("");
    const [notas, setNotas] = useState("");

    function confirmar() {
        onAgregar(tipo, minuto ? Number(minuto) : undefined, notas.trim() || undefined);
        setMinuto("");
        setNotas("");
        setDetalles(false);
        setAbierto(false);
    }

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate">{titulo}</span>
                <button
                    type="button"
                    onClick={() => setAbierto((v) => !v)}
                    className="shrink-0 text-xs px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 hover:border-orange-500"
                >
                    + Agregar
                </button>
            </div>

            {eventos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {eventos.map((e) => {
                        const meta = LABELS.get(e.tipo)!;
                        return (
                            <span
                                key={e.localId}
                                className="inline-flex items-center gap-1 text-xs bg-neutral-900 border border-neutral-800 rounded-full pl-2 pr-1 py-0.5"
                            >
                                {meta.emoji} {meta.label}
                                {e.minuto ? ` · ${e.minuto}'` : ""}
                                <button
                                    type="button"
                                    onClick={() => onQuitar(e.localId)}
                                    className="ml-1 text-neutral-500 hover:text-red-400"
                                    aria-label="Quitar evento"
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {abierto && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                    <div className="grid grid-cols-12 gap-1.5 items-center">
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as TipoEvento)}
                            className={`${inputCls} col-span-8`}
                        >
                            {tipos.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.emoji} {t.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={confirmar}
                            className="col-span-4 text-xs px-2 py-1.5 rounded-md bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium"
                        >
                            Sumar
                        </button>
                    </div>

                    {detalles ? (
                        <div className="grid grid-cols-12 gap-1.5 items-center">
                            <input
                                type="number"
                                min={0}
                                max={120}
                                placeholder="minuto"
                                value={minuto}
                                onChange={(e) => setMinuto(e.target.value)}
                                className={`${inputCls} col-span-4`}
                            />
                            <input
                                placeholder="notas"
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                className={`${inputCls} col-span-8`}
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setDetalles(true)}
                            className="text-[11px] text-neutral-500 hover:text-neutral-300 underline underline-offset-2"
                        >
                            + minuto y notas (opcional)
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
