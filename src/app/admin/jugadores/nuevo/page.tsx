import Link from "next/link";
import { crearJugador } from "../actions";
import { toISODate } from "@/lib/utils";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

const ERRORES: Record<string, string> = {
    campos: "Faltan campos obligatorios. Revisá los marcados con *.",
    foto_grande:
        "La foto pesa más de 2 MB. Comprimila primero con Squoosh y volvé a intentar.",
    foto_tipo: "La foto debe ser JPG, PNG o WebP.",
};

export default async function NuevoJugadorPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const hoy = toISODate(new Date());
    const mensajeError = params.error ? ERRORES[params.error] : null;

    return (
        <div className="space-y-6 max-w-3xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Nuevo jugador</h1>
                    <p className="text-sm text-neutral-400">
                        Datos personales, posición, foto y fecha de ingreso al club.
                    </p>
                </div>
                <Link
                    href="/admin/jugadores"
                    className="text-sm text-neutral-400 hover:text-neutral-100"
                >
                    ← Volver
                </Link>
            </header>

            {mensajeError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    {mensajeError}
                </p>
            )}

            <form action={crearJugador} className="space-y-8">
                {/* ───── Datos personales ───── */}
                <Seccion titulo="Datos personales">
                    <Field label="Nombre *">
                        <input name="nombre" required className={inputCls} />
                    </Field>
                    <Field label="Apellido *">
                        <input name="apellido" required className={inputCls} />
                    </Field>
                    <Field label="Apodo">
                        <input name="apodo" className={inputCls} />
                    </Field>
                    <Field label="Fecha de nacimiento">
                        <input type="date" name="fechaNacimiento" className={inputCls} />
                    </Field>
                    <Field label="Email" full>
                        <input
                            type="email"
                            name="email"
                            placeholder="opcional, para futuro acceso del jugador"
                            className={inputCls}
                        />
                    </Field>
                </Seccion>

                {/* ───── Información deportiva ───── */}
                <Seccion titulo="Información deportiva">
                    <Field label="Dorsal *">
                        <input
                            type="number"
                            name="dorsal"
                            min={0}
                            max={99}
                            required
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Posición principal *">
                        <select
                            name="posicion"
                            required
                            defaultValue=""
                            className={inputCls}
                        >
                            <option value="" disabled>
                                Elegí una
                            </option>
                            <option value="POR">Portero</option>
                            <option value="DEF">Defensa</option>
                            <option value="MED">Medio</option>
                            <option value="DEL">Delantero</option>
                        </select>
                    </Field>
                    <Field label="Posiciones secundarias">
                        <div className="flex flex-wrap gap-3 text-sm">
                            {(["POR", "DEF", "MED", "DEL"] as const).map((p) => (
                                <label key={p} className="flex items-center gap-1.5">
                                    <input
                                        type="checkbox"
                                        name="posicionesSecundarias"
                                        value={p}
                                    />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </Field>
                    <Field label="Pie dominante">
                        <div className="flex gap-4 text-sm">
                            {(["izq", "der", "ambos"] as const).map((p) => (
                                <label key={p} className="flex items-center gap-1.5">
                                    <input type="radio" name="pieDominante" value={p} />
                                    {p === "izq" ? "Izquierdo" : p === "der" ? "Derecho" : "Ambos"}
                                </label>
                            ))}
                        </div>
                    </Field>
                    <Field label="" full>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="capitan" />
                            Es capitán del equipo
                        </label>
                    </Field>
                </Seccion>

                {/* ───── Membresía ───── */}
                <Seccion titulo="Membresía en el club">
                    <Field label="Fecha de ingreso *">
                        <input
                            type="date"
                            name="desde"
                            defaultValue={hoy}
                            required
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Notas del período">
                        <input
                            name="notasPeriodo"
                            placeholder="ej: viene del juvenil B"
                            className={inputCls}
                        />
                    </Field>
                </Seccion>

                {/* ───── Perfil ───── */}
                <Seccion titulo="Perfil">
                    <Field label="Foto" full>
                        <input
                            type="file"
                            name="foto"
                            accept="image/jpeg,image/png,image/webp"
                            className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-neutral-100 file:text-xs file:cursor-pointer`}
                        />
                        <span className="text-xs text-neutral-500 mt-1">
                            JPG, PNG o WebP. Máx 2 MB. Para mejor rendimiento comprimila antes
                            en{" "}
                            <a
                                href="https://squoosh.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 hover:text-orange-300 underline"
                            >
                                squoosh.app
                            </a>{" "}
                            (objetivo: &lt;500 KB).
                        </span>
                    </Field>
                    <Field label="Bio" full>
                        <textarea
                            name="bio"
                            rows={3}
                            placeholder="Breve descripción del jugador"
                            className={inputCls}
                        />
                    </Field>
                </Seccion>

                {/* ───── Reconocimientos ───── */}
                <Seccion titulo="Reconocimientos">
                    <p className="md:col-span-2 text-xs text-neutral-500 -mt-2">
                        Si lo estás cargando como una leyenda del club que ya no está
                        activa, marcalo acá. Para jugadores que recién ingresan, dejá esto
                        sin tocar. Los hitos y logros se cargan desde la ficha del jugador.
                    </p>
                    <Field label="" full>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="esLeyenda" />
                            Es una leyenda del club
                        </label>
                    </Field>
                </Seccion>

                {/* ───── Carry-over ───── */}
                <Seccion titulo="Estadísticas previas (opcional)">
                    <p className="md:col-span-2 text-xs text-neutral-500 -mt-2">
                        Si el jugador ya tenía partidos o goles antes de empezar a usar el
                        panel, anotalos acá. Se sumarán a los que vayamos derivando de los
                        partidos cargados.
                    </p>
                    <Field label="Partidos jugados">
                        <input type="number" name="co_pj" min={0} defaultValue={0} className={inputCls} />
                    </Field>
                    <Field label="Goles">
                        <input type="number" name="co_goles" min={0} defaultValue={0} className={inputCls} />
                    </Field>
                    <Field label="Asistencias">
                        <input type="number" name="co_asistencias" min={0} defaultValue={0} className={inputCls} />
                    </Field>
                    <Field label="Amarillas">
                        <input type="number" name="co_amarillas" min={0} defaultValue={0} className={inputCls} />
                    </Field>
                    <Field label="Rojas">
                        <input type="number" name="co_rojas" min={0} defaultValue={0} className={inputCls} />
                    </Field>
                </Seccion>

                {/* ───── Acciones ───── */}
                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        Dar de alta
                    </button>
                    <Link
                        href="/admin/jugadores"
                        className="px-5 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
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