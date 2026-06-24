import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getJugador } from "@/lib/data";
import { toISODate } from "@/lib/utils";
import {
    darDeBaja,
    editarJugador,
    eliminarJugador,
    marcarRegreso,
} from "../../actions";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

const ERRORES: Record<string, string> = {
    campos: "Faltan campos obligatorios.",
    foto_grande: "La foto pesa más de 2 MB.",
    foto_tipo: "La foto debe ser JPG, PNG o WebP.",
};

export default async function EditarJugadorPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error } = await searchParams;
    const jugador = await getJugador(id);

    if (!jugador) notFound();

    const mensajeError = error ? ERRORES[error] : null;
    const hoy = toISODate(new Date());

    return (
        <div className="space-y-6 max-w-3xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Editar {jugador.nombre} {jugador.apellido}
                    </h1>
                    <p className="text-sm text-neutral-400">
                        Dorsal {jugador.dorsal} · {jugador.posicion}
                        {jugador.activo ? " · activo" : " · inactivo"}
                    </p>
                </div>
                <div className="flex flex-col gap-2 text-sm items-end">
                    <Link
                        href={`/admin/jugadores/${jugador.id}`}
                        className="text-orange-400 hover:text-orange-300"
                    >
                        Ver ficha →
                    </Link>
                    <Link
                        href="/admin/jugadores"
                        className="text-neutral-400 hover:text-neutral-100"
                    >
                        ← Volver al listado
                    </Link>
                </div>
            </header>

            {mensajeError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    {mensajeError}
                </p>
            )}

            {/* FORM DE EDICIÓN */}
            <form action={editarJugador} className="space-y-8">
                <input type="hidden" name="id" value={jugador.id} />

                <Seccion titulo="Datos personales">
                    <Field label="Nombre *">
                        <input name="nombre" required defaultValue={jugador.nombre} className={inputCls} />
                    </Field>
                    <Field label="Apellido *">
                        <input name="apellido" required defaultValue={jugador.apellido} className={inputCls} />
                    </Field>
                    <Field label="Apodo">
                        <input name="apodo" defaultValue={jugador.apodo ?? ""} className={inputCls} />
                    </Field>
                    <Field label="Fecha de nacimiento">
                        <input type="date" name="fechaNacimiento" defaultValue={jugador.fechaNacimiento ?? ""} className={inputCls} />
                    </Field>
                    <Field label="Email" full>
                        <input type="email" name="email" defaultValue={jugador.email ?? ""} className={inputCls} />
                    </Field>
                </Seccion>

                <Seccion titulo="Información deportiva">
                    <Field label="Dorsal *">
                        <input type="number" name="dorsal" min={0} max={99} required defaultValue={jugador.dorsal} className={inputCls} />
                    </Field>
                    <Field label="Posición principal *">
                        <select name="posicion" required defaultValue={jugador.posicion} className={inputCls}>
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
                                        defaultChecked={jugador.posicionesSecundarias?.includes(p) ?? false}
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
                                    <input type="radio" name="pieDominante" value={p} defaultChecked={jugador.pieDominante === p} />
                                    {p === "izq" ? "Izquierdo" : p === "der" ? "Derecho" : "Ambos"}
                                </label>
                            ))}
                        </div>
                    </Field>
                    <Field label="" full>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="capitan" defaultChecked={jugador.capitan ?? false} />
                            Es capitán del equipo
                        </label>
                    </Field>
                </Seccion>

                <Seccion titulo="Perfil">
                    <Field label="Foto" full>
                        {jugador.foto && (
                            <div className="flex items-center gap-3 mb-2">
                                <Image
                                    src={jugador.foto}
                                    alt={jugador.nombre}
                                    width={64}
                                    height={64}
                                    className="rounded-lg object-cover w-16 h-16"
                                />
                                <label className="flex items-center gap-2 text-xs text-neutral-400">
                                    <input type="checkbox" name="eliminarFoto" />
                                    Eliminar foto actual
                                </label>
                            </div>
                        )}
                        <input
                            type="file"
                            name="foto"
                            accept="image/jpeg,image/png,image/webp"
                            className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-neutral-100 file:text-xs file:cursor-pointer`}
                        />
                        <span className="text-xs text-neutral-500 mt-1">
                            Subí una nueva para reemplazar. Máx 2 MB.
                        </span>
                    </Field>
                    <Field label="Bio" full>
                        <textarea name="bio" rows={3} defaultValue={jugador.bio ?? ""} className={inputCls} />
                    </Field>
                </Seccion>

                <Seccion titulo="Estadísticas previas (carry-over)">
                    <Field label="Partidos jugados">
                        <input type="number" name="co_pj" min={0} defaultValue={jugador.carryOver?.partidosJugados ?? 0} className={inputCls} />
                    </Field>
                    <Field label="Goles">
                        <input type="number" name="co_goles" min={0} defaultValue={jugador.carryOver?.goles ?? 0} className={inputCls} />
                    </Field>
                    <Field label="Asistencias">
                        <input type="number" name="co_asistencias" min={0} defaultValue={jugador.carryOver?.asistencias ?? 0} className={inputCls} />
                    </Field>
                    <Field label="Amarillas">
                        <input type="number" name="co_amarillas" min={0} defaultValue={jugador.carryOver?.amarillas ?? 0} className={inputCls} />
                    </Field>
                    <Field label="Rojas">
                        <input type="number" name="co_rojas" min={0} defaultValue={jugador.carryOver?.rojas ?? 0} className={inputCls} />
                    </Field>
                    <Field label="" full>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="esLeyenda" defaultChecked={jugador.esLeyenda ?? false} />
                            Es una leyenda del club
                        </label>
                    </Field>
                </Seccion>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button type="submit" className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm">
                        Guardar cambios
                    </button>
                    <Link href="/admin/jugadores" className="px-5 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm">
                        Cancelar
                    </Link>
                </div>
            </form>

            {/* MEMBRESÍA */}
            <section className="space-y-4 pt-8 border-t border-neutral-800">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500">
                    Historial en el club
                </h2>

                <ul className="space-y-2">
                    {jugador.historial.map((p) => (
                        <li key={p.id} className="flex justify-between items-center gap-4 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-sm">
                            <div>
                                <span className="text-neutral-200">{p.desde}</span>
                                <span className="text-neutral-500"> → </span>
                                <span className="text-neutral-200">{p.hasta ?? "vigente"}</span>
                                {p.motivoBaja && <span className="text-neutral-500 text-xs ml-2">· {p.motivoBaja}</span>}
                            </div>
                            {!p.hasta && <span className="text-xs text-emerald-400">Activo</span>}
                        </li>
                    ))}
                </ul>

                {jugador.activo ? (
                    <form action={darDeBaja} className="rounded-lg border border-neutral-800 p-4 space-y-3 bg-neutral-950">
                        <input type="hidden" name="id" value={jugador.id} />
                        <h3 className="text-sm font-medium text-red-300">Dar de baja del club</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Fecha de baja *">
                                <input type="date" name="hasta" defaultValue={hoy} required className={inputCls} />
                            </Field>
                            <Field label="Motivo">
                                <input name="motivoBaja" placeholder="lesión, mudanza, trabajo..." className={inputCls} />
                            </Field>
                        </div>
                        <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30">
                            Confirmar baja
                        </button>
                    </form>
                ) : (
                    <form action={marcarRegreso} className="rounded-lg border border-neutral-800 p-4 space-y-3 bg-neutral-950">
                        <input type="hidden" name="id" value={jugador.id} />
                        <h3 className="text-sm font-medium text-emerald-300">Marcar regreso al club</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Fecha de regreso *">
                                <input type="date" name="desde" defaultValue={hoy} required className={inputCls} />
                            </Field>
                            <Field label="Notas">
                                <input name="notas" placeholder="opcional" className={inputCls} />
                            </Field>
                        </div>
                        <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Confirmar regreso
                        </button>
                    </form>
                )}
            </section>

            {/* ZONA PELIGROSA */}
            <section className="pt-8 border-t border-neutral-800">
                <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">Zona peligrosa</h2>
                <form action={eliminarJugador}>
                    <input type="hidden" name="id" value={jugador.id} />
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30">
                        Eliminar jugador permanentemente
                    </button>
                    <p className="text-xs text-neutral-500 mt-2">
                        Borra el jugador y su foto. No se puede recuperar.
                    </p>
                </form>
            </section>
        </div>
    );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-neutral-500">{titulo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
    return (
        <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
            {label && <span className="text-xs uppercase tracking-wider text-neutral-400">{label}</span>}
            {children}
        </label>
    );
}