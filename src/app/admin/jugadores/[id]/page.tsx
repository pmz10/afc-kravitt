import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getJugador,
  getPartidos,
  getTorneos,
} from "@/lib/data";
import {
  evaluarCriteriosLeyenda,
  getDesglosePorTorneo,
  getMVPCount,
  getStatsJugador,
} from "@/lib/stats";
import {
  agregarCarryOverTorneo,
  agregarHito,
  eliminarCarryOverTorneo,
  eliminarHito,
} from "../actions";
import type { Posicion, TipoHito } from "@/types";

const POSICION_LABEL: Record<Posicion, string> = {
  POR: "Portero",
  DEF: "Defensa",
  MED: "Medio",
  DEL: "Delantero",
};

const TIPO_HITO_LABEL: Record<TipoHito, string> = {
  campeon: "🏆 Campeón",
  subcampeon: "🥈 Subcampeón",
  max_goleador_torneo: "Máximo goleador",
  max_asistente_torneo: "Máximo asistente",
  mvp_torneo: "MVP del torneo",
  mvp_partido: "MVP del partido",
  hat_trick: "Hat-trick",
  milestone_partidos: "Milestone partidos",
  milestone_goles: "Milestone goles",
  capitan_temporada: "Capitán de temporada",
  otro: "Otro",
};

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export default async function FichaJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [jugador, partidos, torneos] = await Promise.all([
    getJugador(id),
    getPartidos(),
    getTorneos(),
  ]);

  if (!jugador) notFound();

  const total = getStatsJugador(jugador, partidos);
  const desglose = getDesglosePorTorneo(jugador, partidos, torneos);
  const mvps = getMVPCount(jugador.id, partidos);
  const criterios = evaluarCriteriosLeyenda(jugador, partidos, torneos);
  const criteriosCumplidos = criterios.filter((c) => c.cumple).length;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {jugador.foto ? (
            <Image
              src={jugador.foto}
              alt={`${jugador.nombre} ${jugador.apellido}`}
              width={80}
              height={80}
              className="rounded-xl object-cover w-20 h-20"
            />
          ) : (
            <span className="w-20 h-20 rounded-xl bg-neutral-800 inline-flex items-center justify-center text-lg text-neutral-500 font-semibold">
              {jugador.nombre[0]}
              {jugador.apellido[0]}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">
                {jugador.nombre} {jugador.apellido}
              </h1>
              {jugador.capitan && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-neutral-950 text-[10px] font-bold">
                  C
                </span>
              )}
              {jugador.esLeyenda && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-[10px] uppercase tracking-wider">
                  Leyenda
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-400">
              #{jugador.dorsal} · {POSICION_LABEL[jugador.posicion]}
              {jugador.apodo && ` · "${jugador.apodo}"`}
              {jugador.activo ? " · Activo" : " · Inactivo"}
            </p>
            {jugador.bio && (
              <p className="text-sm text-neutral-500 mt-2 max-w-xl">
                {jugador.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link
            href={`/admin/jugadores/enlaces?jugadorId=${jugador.id}`}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Generar enlace →
          </Link>
          <Link
            href={`/admin/jugadores/${jugador.id}/editar`}
            className="text-orange-400 hover:text-orange-300"
          >
            Editar →
          </Link>
          <Link
            href="/admin/jugadores"
            className="text-neutral-400 hover:text-neutral-100"
          >
            ← Volver
          </Link>
        </div>
      </header>

      {/* Stats totales */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Partidos" valor={total.partidosJugados} />
        <Stat label="Titular" valor={total.titularidades} />
        <Stat label="Goles" valor={total.goles} />
        <Stat label="Asistencias" valor={total.asistencias} />
        <Stat label="Amarillas" valor={total.amarillas} color="amber" />
        <Stat label="Rojas" valor={total.rojas} color="red" />
        <Stat label="MVPs" valor={mvps} color="orange" />
        <Stat label="Atajadas" valor={total.atajadas} />
        <Stat label="Faltas" valor={total.faltas} />
        <Stat label="Lesiones" valor={total.lesiones} />
      </section>

      {/* Desglose por torneo */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Desglose por torneo
        </h2>
        {desglose.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aún no participó en ningún torneo cargado.
          </p>
        ) : (
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2">Torneo</th>
                  <th className="text-right px-3 py-2">PJ</th>
                  <th className="text-right px-3 py-2">G</th>
                  <th className="text-right px-3 py-2">A</th>
                  <th className="text-right px-3 py-2">TA</th>
                  <th className="text-right px-3 py-2">TR</th>
                </tr>
              </thead>
              <tbody>
                {desglose.map(({ torneo, stats }) => (
                  <tr key={torneo.id} className="border-t border-neutral-800">
                    <td className="px-4 py-2">
                      <p className="font-medium">{torneo.nombre}</p>
                      <p className="text-xs text-neutral-500">
                        {torneo.temporada} · {torneo.categoria}
                      </p>
                    </td>
                    <td className="text-right px-3 py-2">
                      {stats.partidosJugados}
                    </td>
                    <td className="text-right px-3 py-2">{stats.goles}</td>
                    <td className="text-right px-3 py-2">{stats.asistencias}</td>
                    <td className="text-right px-3 py-2">{stats.amarillas}</td>
                    <td className="text-right px-3 py-2">{stats.rojas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Carry-over por torneo */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Carry-over por torneo (stats previas al admin)
        </h2>
        {(jugador.carryOverPorTorneo ?? []).length === 0 && (
          <p className="text-xs text-neutral-500">
            Sin carry-over por torneo. Útil para temporadas viejas sin partidos
            cargados.
          </p>
        )}
        {(jugador.carryOverPorTorneo ?? []).map((c) => {
          const torneo = torneos.find((t) => t.id === c.torneoId);
          return (
            <div
              key={c.torneoId}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm"
            >
              <div>
                <p className="font-medium">
                  {torneo?.nombre ?? "Torneo desconocido"}
                </p>
                <p className="text-xs text-neutral-500">
                  PJ {c.partidosJugados} · G {c.goles} · A {c.asistencias} · TA{" "}
                  {c.amarillas} · TR {c.rojas}
                </p>
              </div>
              <form action={eliminarCarryOverTorneo}>
                <input type="hidden" name="jugadorId" value={jugador.id} />
                <input type="hidden" name="torneoId" value={c.torneoId} />
                <button className="text-xs text-red-400 hover:text-red-300">
                  Quitar
                </button>
              </form>
            </div>
          );
        })}

        {torneos.length > 0 && (
          <form
            action={agregarCarryOverTorneo}
            className="p-4 rounded-lg border border-dashed border-neutral-800 space-y-3 bg-neutral-950"
          >
            <input type="hidden" name="jugadorId" value={jugador.id} />
            <p className="text-xs text-neutral-400">
              Agregar carry-over para un torneo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Torneo">
                <select name="torneoId" required className={inputCls}>
                  <option value="">Elegí torneo</option>
                  {torneos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.temporada})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="PJ">
                <input
                  type="number"
                  name="co_pj"
                  min={0}
                  defaultValue={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Goles">
                <input
                  type="number"
                  name="co_goles"
                  min={0}
                  defaultValue={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Asistencias">
                <input
                  type="number"
                  name="co_asistencias"
                  min={0}
                  defaultValue={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Amarillas">
                <input
                  type="number"
                  name="co_amarillas"
                  min={0}
                  defaultValue={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Rojas">
                <input
                  type="number"
                  name="co_rojas"
                  min={0}
                  defaultValue={0}
                  className={inputCls}
                />
              </Field>
            </div>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30"
            >
              Agregar
            </button>
          </form>
        )}
      </section>

      {/* Hitos */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Hitos y reconocimientos
        </h2>
        {(jugador.hitos ?? []).length === 0 && (
          <p className="text-xs text-neutral-500">Sin hitos cargados.</p>
        )}
        {(jugador.hitos ?? []).map((h) => {
          const torneo = torneos.find((t) => t.id === h.torneoId);
          return (
            <div
              key={h.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm"
            >
              <div>
                <p className="font-medium">
                  {TIPO_HITO_LABEL[h.tipo]} · {h.titulo}
                </p>
                <p className="text-xs text-neutral-500">
                  {h.fecha && `${h.fecha}`}
                  {torneo && ` · ${torneo.nombre}`}
                  {h.notas && ` · ${h.notas}`}
                </p>
              </div>
              <form action={eliminarHito}>
                <input type="hidden" name="jugadorId" value={jugador.id} />
                <input type="hidden" name="hitoId" value={h.id} />
                <button className="text-xs text-red-400 hover:text-red-300">
                  Quitar
                </button>
              </form>
            </div>
          );
        })}

        <form
          action={agregarHito}
          className="p-4 rounded-lg border border-dashed border-neutral-800 space-y-3 bg-neutral-950"
        >
          <input type="hidden" name="jugadorId" value={jugador.id} />
          <p className="text-xs text-neutral-400">Agregar hito</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Tipo">
              <select name="tipo" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Elegí
                </option>
                {(Object.keys(TIPO_HITO_LABEL) as TipoHito[]).map((t) => (
                  <option key={t} value={t}>
                    {TIPO_HITO_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Título *">
              <input
                name="titulo"
                required
                placeholder="ej: Máximo goleador Liga 2026"
                className={inputCls}
              />
            </Field>
            <Field label="Fecha">
              <input type="date" name="fecha" className={inputCls} />
            </Field>
            <Field label="Torneo (opcional)">
              <select name="torneoId" defaultValue="" className={inputCls}>
                <option value="">— sin torneo —</option>
                {torneos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notas" full>
              <input name="notas" className={inputCls} />
            </Field>
          </div>
          <button
            type="submit"
            className="text-xs px-3 py-1.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30"
          >
            Agregar hito
          </button>
        </form>
      </section>

      {/* Criterios de leyenda */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Criterios de leyenda ({criteriosCumplidos} de {criterios.length}{" "}
          cumplidos)
        </h2>
        <p className="text-xs text-neutral-500">
          Referencia para decidir si marcarlo como leyenda. La marca sigue siendo
          manual desde la edición.
        </p>
        <ul className="space-y-1">
          {criterios.map((c) => (
            <li
              key={c.clave}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-neutral-900/50 border border-neutral-800 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    c.cumple
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {c.cumple ? "✓" : "·"}
                </span>
                <span>{c.etiqueta}</span>
                <span className="text-xs text-neutral-500">({c.umbral})</span>
              </span>
              <span className="text-xs text-neutral-400">
                Actual: {c.valorActual}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Historial */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Historial en el club
        </h2>
        <ul className="space-y-2">
          {jugador.historial.map((p) => (
            <li
              key={p.id}
              className="px-3 py-2 rounded-md bg-neutral-900/50 border border-neutral-800 text-sm"
            >
              <span className="text-neutral-200">{p.desde}</span>
              <span className="text-neutral-500"> → </span>
              <span className="text-neutral-200">{p.hasta ?? "vigente"}</span>
              {p.motivoBaja && (
                <span className="text-neutral-500 text-xs ml-2">
                  · {p.motivoBaja}
                </span>
              )}
            </li>
          ))}
        </ul>
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
  color?: "neutral" | "amber" | "red" | "orange";
}) {
  const colorCls =
    color === "amber"
      ? "text-amber-300"
      : color === "red"
        ? "text-red-300"
        : color === "orange"
          ? "text-orange-300"
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
