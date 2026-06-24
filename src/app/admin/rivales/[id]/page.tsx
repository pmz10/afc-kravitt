import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getJugadoresPorRival,
  getPartidos,
  getRival,
  getTorneos,
} from "@/lib/data";
import { getStatsVsRival, getTopGoleadoresDelRival } from "@/lib/stats";
import { agregarJugadorRival, eliminarJugadorRival } from "../actions";
import type { ResultadoPartido } from "@/types";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

const RESULTADO_BREVE: Record<ResultadoPartido, string> = {
  ganado: "G",
  perdido: "P",
  empatado: "E",
  "default-favor": "G",
  "default-contra": "P",
  pendiente: "—",
};

const RESULTADO_COLOR: Record<ResultadoPartido, string> = {
  ganado: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "default-favor": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  empatado: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  perdido: "bg-red-500/15 text-red-300 border-red-500/30",
  "default-contra": "bg-red-500/15 text-red-300 border-red-500/30",
  pendiente: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

export default async function FichaRivalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [rival, partidos, torneos, jugadoresRivales] = await Promise.all([
    getRival(id),
    getPartidos(),
    getTorneos(),
    getJugadoresPorRival(id),
  ]);

  if (!rival) notFound();

  const stats = getStatsVsRival(id, partidos);
  const topGoleadores = getTopGoleadoresDelRival(
    id,
    partidos,
    jugadoresRivales,
  );
  const partidosVs = partidos
    .filter((p) => p.rivalId === id)
    .sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {rival.escudo ? (
            <Image
              src={rival.escudo}
              alt={rival.nombre}
              width={80}
              height={80}
              className="rounded-xl object-cover w-20 h-20"
            />
          ) : (
            <span className="w-20 h-20 rounded-xl bg-neutral-800 inline-flex items-center justify-center text-lg text-neutral-500 font-semibold">
              {rival.nombre.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{rival.nombre}</h1>
            {rival.ciudad && (
              <p className="text-sm text-neutral-400">{rival.ciudad}</p>
            )}
            {rival.notas && (
              <p className="text-sm text-neutral-500 mt-2 max-w-xl">
                {rival.notas}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link
            href={`/admin/rivales/${rival.id}/editar`}
            className="text-orange-400 hover:text-orange-300"
          >
            Editar →
          </Link>
          <Link
            href="/admin/rivales"
            className="text-neutral-400 hover:text-neutral-100"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Historial vs AFC Kravitt ({stats.enfrentamientos} enfrentamientos)
        </h2>
        {stats.enfrentamientos === 0 ? (
          <p className="text-sm text-neutral-500">
            Todavía no nos enfrentamos en partidos cargados.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Stat label="Ganados" valor={stats.ganados} color="emerald" />
            <Stat label="Empatados" valor={stats.empatados} color="amber" />
            <Stat label="Perdidos" valor={stats.perdidos} color="red" />
            <Stat
              label="Goles a favor"
              valor={stats.golesFavor}
              color="emerald"
            />
            <Stat
              label="Goles en contra"
              valor={stats.golesContra}
              color="red"
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Partidos enfrentados
        </h2>
        {partidosVs.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Sin partidos cargados contra este rival.
          </p>
        ) : (
          <div className="space-y-2">
            {partidosVs.map((p) => {
              const torneo = torneos.find((t) => t.id === p.torneoId);
              const fecha = new Date(p.fecha).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const marcador =
                p.golesFavor !== undefined && p.golesContra !== undefined
                  ? p.esLocal
                    ? `${p.golesFavor} - ${p.golesContra}`
                    : `${p.golesContra} - ${p.golesFavor}`
                  : null;
              return (
                <Link
                  key={p.id}
                  href={`/admin/partidos/${p.id}/editar`}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs font-bold ${RESULTADO_COLOR[p.resultado]}`}
                    >
                      {RESULTADO_BREVE[p.resultado]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        {p.esLocal ? "Local" : "Visitante"}
                        {marcador && (
                          <span className="ml-2 text-neutral-300 font-medium">
                            {marcador}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {torneo?.nombre ?? "Sin torneo"}
                        {p.jornada && ` · Jornada ${p.jornada}`} · {fecha}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {topGoleadores.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-widest text-neutral-500">
            Jugadores rivales que más nos han hecho daño
          </h2>
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2">Jugador</th>
                  <th className="text-right px-4 py-2">Goles</th>
                  <th className="text-right px-4 py-2">Tarjetas</th>
                </tr>
              </thead>
              <tbody>
                {topGoleadores.map(({ jugadorRival, goles, tarjetas }) => (
                  <tr
                    key={jugadorRival.id}
                    className="border-t border-neutral-800"
                  >
                    <td className="px-4 py-2">
                      <span className="font-medium">
                        {jugadorRival.dorsal && `#${jugadorRival.dorsal} `}
                        {jugadorRival.nombre ?? jugadorRival.apodo ?? "—"}
                      </span>
                      {jugadorRival.posicion && (
                        <span className="text-xs text-neutral-500 ml-2">
                          {jugadorRival.posicion}
                        </span>
                      )}
                      {jugadorRival.notas && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {jugadorRival.notas}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {goles}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-400">
                      {tarjetas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Dossier de jugadores conocidos
        </h2>
        <p className="text-xs text-neutral-500">
          Andá agregando jugadores del rival cuando los identifiques. Sirven
          como base de scouting para cargar eventos del partido.
        </p>

        {error === "identidad" && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            Indica al menos un dorsal, nombre o apodo para identificarlo.
          </p>
        )}

        {jugadoresRivales.length === 0 && (
          <p className="text-xs text-neutral-500">
            Sin jugadores cargados todavía.
          </p>
        )}

        {jugadoresRivales.map((jr) => (
          <div
            key={jr.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm"
          >
            <div>
              <p className="font-medium">
                {jr.dorsal && `#${jr.dorsal} `}
                {jr.nombre ?? jr.apodo ?? "Sin nombre"}
                {jr.posicion && (
                  <span className="text-xs text-neutral-500 ml-2">
                    {jr.posicion}
                  </span>
                )}
              </p>
              {jr.notas && (
                <p className="text-xs text-neutral-500 mt-0.5">{jr.notas}</p>
              )}
            </div>
            <form action={eliminarJugadorRival}>
              <input type="hidden" name="rivalId" value={rival.id} />
              <input type="hidden" name="id" value={jr.id} />
              <button className="text-xs text-red-400 hover:text-red-300">
                Quitar
              </button>
            </form>
          </div>
        ))}

        <form
          action={agregarJugadorRival}
          className="p-4 rounded-lg border border-dashed border-neutral-800 space-y-3 bg-neutral-950"
        >
          <input type="hidden" name="rivalId" value={rival.id} />
          <p className="text-xs text-neutral-400">Agregar jugador del rival</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Dorsal">
              <input
                type="number"
                name="dorsal"
                min={0}
                max={99}
                className={inputCls}
              />
            </Field>
            <Field label="Posición">
              <select name="posicion" defaultValue="" className={inputCls}>
                <option value="">—</option>
                <option value="POR">Portero</option>
                <option value="DEF">Defensa</option>
                <option value="MED">Medio</option>
                <option value="DEL">Delantero</option>
              </select>
            </Field>
            <Field label="Nombre">
              <input name="nombre" className={inputCls} />
            </Field>
            <Field label="Apodo">
              <input name="apodo" className={inputCls} />
            </Field>
            <Field label="Notas tácticas" full>
              <input
                name="notas"
                placeholder="ej: rápido por banda derecha, alto de cabeza"
                className={inputCls}
              />
            </Field>
          </div>
          <button
            type="submit"
            className="text-xs px-3 py-1.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30"
          >
            Agregar jugador rival
          </button>
        </form>
      </section>
    </div>
  );
}

function Stat({
  label,
  valor,
  color = "neutral",
}: {
  label: string;
  valor: number;
  color?: "neutral" | "emerald" | "amber" | "red";
}) {
  const colorCls =
    color === "emerald"
      ? "text-emerald-300"
      : color === "amber"
        ? "text-amber-300"
        : color === "red"
          ? "text-red-300"
          : "text-neutral-100";
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className={`text-2xl font-semibold mt-1 ${colorCls}`}>{valor}</p>
    </div>
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
      <span className="text-xs uppercase tracking-wider text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
