import type {
    Jugador,
    JugadorRival,
    Partido,
    Rival,
    Torneo,
} from "@/types";
import { EventosEditor } from "./EventosEditor";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export interface PartidoFormProps {
    action: (formData: FormData) => void | Promise<void>;
    torneos: Torneo[];
    rivales: Rival[];
    jugadores: Jugador[];
    jugadoresRivales: JugadorRival[];
    partido?: Partido; // si está, modo edición
}

export function PartidoForm({
    action,
    torneos,
    rivales,
    jugadores,
    jugadoresRivales,
    partido,
}: PartidoFormProps) {
    const jugadoresActivos = jugadores.filter((j) => j.activo || partido?.convocados.includes(j.id));

    // Eventos pre-existentes (para edición) — los rellenamos en las primeras filas
    const eventos = partido?.eventos ?? [];

    return (
        <form action={action} className="space-y-8">
            {partido && <input type="hidden" name="id" value={partido.id} />}

            {/* ───── Datos básicos ───── */}
            <Seccion titulo="Datos del partido">
                <Field label="Torneo *">
                    <select
                        name="torneoId"
                        required
                        defaultValue={partido?.torneoId ?? ""}
                        className={inputCls}
                    >
                        <option value="" disabled>
                            Elegí torneo
                        </option>
                        {torneos.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.nombre} ({t.temporada})
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Rival *">
                    <select
                        name="rivalId"
                        required
                        defaultValue={partido?.rivalId ?? ""}
                        className={inputCls}
                    >
                        <option value="" disabled>
                            Elegí rival
                        </option>
                        {rivales.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nombre}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Jornada">
                    <input
                        type="number"
                        name="jornada"
                        min={1}
                        defaultValue={partido?.jornada ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Fecha y hora *">
                    <input
                        type="datetime-local"
                        name="fecha"
                        required
                        defaultValue={partido?.fecha?.slice(0, 16) ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Sede">
                    <input
                        name="sede"
                        defaultValue={partido?.sede ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="" full>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            name="esLocal"
                            defaultChecked={partido?.esLocal ?? true}
                        />
                        Jugamos como local
                    </label>
                </Field>
            </Seccion>

            {/* ───── Resultado ───── */}
            <Seccion titulo="Resultado">
                <Field label="Estado *">
                    <select
                        name="resultado"
                        required
                        defaultValue={partido?.resultado ?? "pendiente"}
                        className={inputCls}
                    >
                        <option value="pendiente">Pendiente (borrador)</option>
                        <option value="ganado">Ganado</option>
                        <option value="empatado">Empatado</option>
                        <option value="perdido">Perdido</option>
                        <option value="default-favor">Default a favor</option>
                        <option value="default-contra">Default en contra</option>
                    </select>
                </Field>
                <Field label="Goles a favor">
                    <input
                        type="number"
                        name="golesFavor"
                        min={0}
                        defaultValue={partido?.golesFavor ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Goles en contra">
                    <input
                        type="number"
                        name="golesContra"
                        min={0}
                        defaultValue={partido?.golesContra ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Penales a favor (si hubo tanda)">
                    <input
                        type="number"
                        name="penalesFavor"
                        min={0}
                        defaultValue={partido?.penales?.favor ?? ""}
                        className={inputCls}
                    />
                </Field>
                <Field label="Penales en contra (si hubo tanda)">
                    <input
                        type="number"
                        name="penalesContra"
                        min={0}
                        defaultValue={partido?.penales?.contra ?? ""}
                        className={inputCls}
                    />
                </Field>
            </Seccion>

            {/* ───── Convocatoria ───── */}
            <Seccion titulo="Convocatoria">
                {jugadoresActivos.length === 0 ? (
                    <p className="text-sm text-neutral-500 md:col-span-2">
                        No hay jugadores activos para convocar.
                    </p>
                ) : (
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                        {jugadoresActivos
                            .sort((a, b) => a.dorsal - b.dorsal)
                            .map((j) => (
                                <div
                                    key={j.id}
                                    className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-neutral-900"
                                >
                                    <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="convocados"
                                            value={j.id}
                                            defaultChecked={partido?.convocados.includes(j.id) ?? false}
                                        />
                                        <span className="font-mono text-xs text-neutral-500 w-6">
                                            {j.dorsal}
                                        </span>
                                        <span className="truncate">
                                            {j.nombre} {j.apellido}
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-1 text-xs text-neutral-500 shrink-0 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="titulares"
                                            value={j.id}
                                            defaultChecked={partido?.titulares.includes(j.id) ?? false}
                                        />
                                        Titular
                                    </label>
                                </div>
                            ))}
                    </div>
                )}
            </Seccion>

            {/* ───── MVP ───── */}
            <Seccion titulo="MVP del partido (designación del admin)">
                <Field label="MVP" full>
                    <select
                        name="mvpId"
                        defaultValue={partido?.mvpId ?? ""}
                        className={inputCls}
                    >
                        <option value="">— sin elegir —</option>
                        {jugadoresActivos.map((j) => (
                            <option key={j.id} value={j.id}>
                                #{j.dorsal} {j.nombre} {j.apellido}
                            </option>
                        ))}
                    </select>
                </Field>
            </Seccion>

            {/* ───── Eventos ───── */}
            <Seccion titulo="Eventos del partido">
                <p className="md:col-span-2 text-xs text-neutral-500 -mt-2">
                    Sumá goles, asistencias, tarjetas y penales directamente en la
                    tarjeta de cada jugador. No hay límite de cantidad por jugador.
                </p>
                <div className="md:col-span-2">
                    <EventosEditor
                        jugadoresActivos={jugadoresActivos}
                        jugadoresRivales={jugadoresRivales}
                        rivales={rivales}
                        eventosIniciales={eventos}
                    />
                </div>
            </Seccion>

            {/* ───── Notas ───── */}
            <Seccion titulo="Notas del partido">
                <Field label="" full>
                    <textarea
                        name="notas"
                        rows={3}
                        defaultValue={partido?.notas ?? ""}
                        placeholder="Resumen del partido, anécdotas, comentarios..."
                        className={inputCls}
                    />
                </Field>
            </Seccion>

            <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                >
                    {partido ? "Guardar cambios" : "Crear partido"}
                </button>
            </div>
        </form>
    );
}

function Seccion({
    titulo,
    children,
}: {
    titulo: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                {titulo}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

function Field({
    label,
    children,
    full = false,
}: {
    label: string;
    children: React.ReactNode;
    full?: boolean;
}) {
    return (
        <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
            {label && (
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                    {label}
                </span>
            )}
            {children}
        </label>
    );
}