import Link from "next/link";
import { headers } from "next/headers";
import { getJugadores } from "@/lib/data";
import {
  listPlayerInvites,
  listPlayerInviteSubmissions,
} from "@/lib/player-invites";
import {
  aprobarSolicitudJugador,
  crearEnlaceJugador,
  eliminarEnlaceJugador,
  rechazarSolicitudJugador,
  revocarEnlaceJugador,
} from "./actions";
import { CopyLinkButton } from "./CopyLinkButton";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

export default async function EnlacesJugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    jugadorId?: string;
    error?: string;
    approved?: string;
    rejected?: string;
    approvalError?: string;
    deleted?: string;
    deleteError?: string;
  }>;
}) {
  const params = await searchParams;
  const [jugadores, invites, submissions, headerStore] = await Promise.all([
    getJugadores(),
    listPlayerInvites(),
    listPlayerInviteSubmissions(),
    headers(),
  ]);
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const createdUrl =
    params.created && host
      ? `${protocol}://${host}/jugador/invitacion/${params.created}`
      : null;
  const names = new Map(
    jugadores.map((jugador) => [
      jugador.id,
      `${jugador.nombre} ${jugador.apellido}`,
    ]),
  );
  const playersById = new Map(
    jugadores.map((jugador) => [jugador.id, jugador]),
  );
  const pendingInviteIds = new Set(
    submissions
      .filter(
        (submission) =>
          submission.status === "pending" ||
          submission.status === "processing",
      )
      .map((submission) => submission.inviteId),
  );
  const pendingSubmissions = submissions.filter(
    (submission) =>
      submission.status === "pending" || submission.status === "processing",
  );
  return (
    <div className="space-y-8 max-w-5xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Enlaces para jugadores</h1>
          <p className="text-sm text-neutral-400">
            Permite que alguien capture o actualice sus datos sin entrar al admin.
          </p>
        </div>
        <Link
          href="/admin/jugadores"
          className="text-sm text-neutral-400 hover:text-neutral-100"
        >
          ← Volver
        </Link>
      </header>

      {createdUrl && (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-300">
            Enlace creado. También podrás volver a copiarlo desde la tabla.
          </p>
          <div className="flex items-center gap-3">
            <input
              readOnly
              value={createdUrl}
              className={`${inputCls} font-mono text-xs`}
            />
            <CopyLinkButton url={createdUrl} />
          </div>
        </section>
      )}

      {params.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Selecciona un jugador válido.
        </p>
      )}

      {(params.approved || params.rejected) && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          {params.approved
            ? "La solicitud fue aprobada y los datos ya se aplicaron."
            : "La solicitud fue rechazada."}
        </p>
      )}

      {params.approvalError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          No se pudo aprobar: {params.approvalError}
        </p>
      )}

      {params.deleted && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          El enlace consumido fue eliminado.
        </p>
      )}

      {params.deleteError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          No se pudo eliminar: {params.deleteError}
        </p>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        <form
          action={crearEnlaceJugador}
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-4"
        >
          <input type="hidden" name="mode" value="create" />
          <div>
            <h2 className="font-medium">Crear un jugador</h2>
            <p className="text-xs text-neutral-500">
              Este enlace siempre funciona una sola vez.
            </p>
          </div>
          <Field label="Caduca en">
            <select name="expiresInDays" defaultValue="7" className={inputCls}>
              <option value="1">1 día</option>
              <option value="3">3 días</option>
              <option value="7">7 días</option>
              <option value="14">14 días</option>
              <option value="30">30 días</option>
            </select>
          </Field>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="requiresApproval" className="mt-1" />
            <span>
              Requerir aprobación del admin
              <span className="block text-xs text-neutral-500">
                La ficha no se creará hasta que un administrador la apruebe.
              </span>
            </span>
          </label>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-orange-400">
            Generar enlace de alta
          </button>
        </form>

        <form
          action={crearEnlaceJugador}
          className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-4"
        >
          <input type="hidden" name="mode" value="edit" />
          <div>
            <h2 className="font-medium">Editar un jugador</h2>
            <p className="text-xs text-neutral-500">
              Tú decides cuántas veces puede guardarse.
            </p>
          </div>
          <Field label="Jugador">
            <select
              name="jugadorId"
              required
              defaultValue={params.jugadorId ?? ""}
              className={inputCls}
            >
              <option value="" disabled>
                Selecciona un jugador
              </option>
              {jugadores.map((jugador) => (
                <option key={jugador.id} value={jugador.id}>
                  {jugador.nombre} {jugador.apellido}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Máximo de envíos">
              <input
                type="number"
                name="maxUses"
                min={1}
                max={100}
                defaultValue={1}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Caduca en días">
              <input
                type="number"
                name="expiresInDays"
                min={1}
                max={90}
                defaultValue={7}
                required
                className={inputCls}
              />
            </Field>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="requiresApproval" className="mt-1" />
            <span>
              Requerir aprobación del admin
              <span className="block text-xs text-neutral-500">
                Cada envío quedará pendiente antes de modificar al jugador.
              </span>
            </span>
          </label>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-orange-400">
            Generar enlace de edición
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-neutral-500">
            Solicitudes por aprobar ({pendingSubmissions.length})
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Aprobar aplica los datos al jugador. Rechazar conserva el registro,
            pero no modifica ninguna ficha.
          </p>
        </div>

        {pendingSubmissions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No hay solicitudes pendientes.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingSubmissions.map((submission) => {
              const payload = submission.payload;
              const currentPlayer = submission.jugadorId
                ? playersById.get(submission.jugadorId)
                : undefined;
              const submittedName = [payload.nombre, payload.apellido]
                .filter((value) => typeof value === "string" && value)
                .join(" ");
              return (
                <article
                  key={submission.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-300">
                          {submission.mode === "create"
                            ? "Alta nueva"
                            : "Edición"}
                        </span>
                        {submission.status === "processing" && (
                          <span className="text-xs text-amber-400">
                            Procesando
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-medium">
                        {submittedName || "Jugador sin nombre"}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        {submission.mode === "edit" && submission.jugadorId
                          ? `Ficha actual: ${
                              names.get(submission.jugadorId) ??
                              submission.jugadorId
                            } · `
                          : ""}
                        Dorsal {String(payload.dorsal ?? "—")} · Posición{" "}
                        {String(payload.posicion ?? "—")}
                      </p>
                      {submission.errorMessage && (
                        <p className="mt-2 text-xs text-red-400">
                          Último intento: {submission.errorMessage}
                        </p>
                      )}
                      <SubmissionPreview
                        mode={submission.mode}
                        payload={payload}
                        currentPlayer={currentPlayer}
                      />
                    </div>
                    {submission.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <form action={aprobarSolicitudJugador}>
                          <input
                            type="hidden"
                            name="id"
                            value={submission.id}
                          />
                          <button className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-neutral-950 hover:bg-emerald-400">
                            Aprobar
                          </button>
                        </form>
                        <form action={rechazarSolicitudJugador}>
                          <input
                            type="hidden"
                            name="id"
                            value={submission.id}
                          />
                          <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20">
                            Rechazar
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">
          Enlaces generados
        </h2>
        {invites.length === 0 ? (
          <p className="text-sm text-neutral-500">Todavía no hay enlaces.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900 text-xs uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Jugador</th>
                  <th className="px-4 py-3 text-left">Usos</th>
                  <th className="px-4 py-3 text-left">Publicación</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => {
                  const exhausted = invite.usedCount >= invite.maxUses;
                  const active = !invite.revokedAt && !exhausted;
                  const inviteUrl =
                    invite.token && host
                      ? `${protocol}://${host}/jugador/invitacion/${invite.token}`
                      : null;
                  const canDelete =
                    exhausted && !pendingInviteIds.has(invite.id);
                  return (
                    <tr key={invite.id} className="border-t border-neutral-800">
                      <td className="px-4 py-3">
                        {invite.mode === "create" ? "Alta" : "Edición"}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {invite.jugadorId
                          ? names.get(invite.jugadorId) ?? invite.jugadorId
                          : "Nuevo jugador"}
                      </td>
                      <td className="px-4 py-3">
                        {invite.usedCount}/{invite.maxUses}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {invite.requiresApproval
                          ? "Con aprobación"
                          : "Inmediata"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            active ? "text-emerald-400" : "text-neutral-500"
                          }
                        >
                          {active
                            ? `Disponible hasta ${new Intl.DateTimeFormat("es-MX", {
                                dateStyle: "medium",
                              }).format(new Date(invite.expiresAt))}`
                            : invite.revokedAt
                              ? "Revocado"
                              : "Consumido"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          {inviteUrl ? (
                            <CopyLinkButton url={inviteUrl} />
                          ) : (
                            <span
                              title="Los enlaces creados antes de esta actualización solo guardaron su hash."
                              className="text-xs text-neutral-600"
                            >
                              No recuperable
                            </span>
                          )}
                          {active && (
                            <form action={revocarEnlaceJugador}>
                              <input type="hidden" name="id" value={invite.id} />
                              <button className="text-xs text-red-400 hover:text-red-300">
                                Revocar
                              </button>
                            </form>
                          )}
                          {canDelete && (
                            <form action={eliminarEnlaceJugador}>
                              <input type="hidden" name="id" value={invite.id} />
                              <button className="text-xs text-red-400 hover:text-red-300">
                                Eliminar
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

type PreviewPlayer = {
  nombre: string;
  apellido: string;
  apodo?: string;
  dorsal: number;
  posicion: string;
  posicionesSecundarias?: string[];
  pieDominante?: string;
  fechaNacimiento?: string;
  email?: string;
  bio?: string;
  capitan?: boolean;
};

const PREVIEW_FIELDS: {
  key: string;
  label: string;
  current: (player: PreviewPlayer) => unknown;
}[] = [
  { key: "nombre", label: "Nombre", current: (player) => player.nombre },
  { key: "apellido", label: "Apellido", current: (player) => player.apellido },
  { key: "apodo", label: "Apodo", current: (player) => player.apodo },
  { key: "dorsal", label: "Dorsal", current: (player) => player.dorsal },
  { key: "posicion", label: "Posición", current: (player) => player.posicion },
  {
    key: "posicionesSecundarias",
    label: "Posiciones secundarias",
    current: (player) => player.posicionesSecundarias,
  },
  {
    key: "pieDominante",
    label: "Pie dominante",
    current: (player) => player.pieDominante,
  },
  {
    key: "fechaNacimiento",
    label: "Nacimiento",
    current: (player) => player.fechaNacimiento,
  },
  { key: "email", label: "Email", current: (player) => player.email },
  { key: "bio", label: "Bio", current: (player) => player.bio },
  { key: "capitan", label: "Capitán", current: (player) => player.capitan },
];

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function SubmissionPreview({
  mode,
  payload,
  currentPlayer,
}: {
  mode: "create" | "edit";
  payload: Record<string, unknown>;
  currentPlayer?: PreviewPlayer;
}) {
  const extraCreateFields =
    mode === "create"
      ? [
          { key: "desde", label: "Fecha de ingreso" },
          { key: "notasPeriodo", label: "Notas de ingreso" },
        ]
      : [];

  return (
    <details className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/50">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-sky-300">
        Ver datos {mode === "edit" ? "y cambios propuestos" : "enviados"}
      </summary>
      <div className="border-t border-neutral-800 p-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs">
            <thead className="text-neutral-500">
              <tr>
                <th className="pb-2 text-left">Campo</th>
                {mode === "edit" && <th className="pb-2 text-left">Actual</th>}
                <th className="pb-2 text-left">
                  {mode === "edit" ? "Propuesto" : "Valor"}
                </th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_FIELDS.map((field) => {
                const currentValue = currentPlayer
                  ? field.current(currentPlayer)
                  : undefined;
                const proposedValue = payload[field.key];
                const changed =
                  mode === "edit" &&
                  displayValue(currentValue) !== displayValue(proposedValue);
                return (
                  <tr
                    key={field.key}
                    className={`border-t border-neutral-800 ${
                      changed ? "bg-orange-500/5" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 text-neutral-500">
                      {field.label}
                    </td>
                    {mode === "edit" && (
                      <td className="py-2 pr-3 text-neutral-400">
                        {displayValue(currentValue)}
                      </td>
                    )}
                    <td
                      className={`py-2 ${
                        changed ? "font-medium text-orange-300" : "text-neutral-200"
                      }`}
                    >
                      {displayValue(proposedValue)}
                    </td>
                  </tr>
                );
              })}
              {extraCreateFields.map((field) => (
                <tr key={field.key} className="border-t border-neutral-800">
                  <td className="py-2 pr-3 text-neutral-500">{field.label}</td>
                  <td className="py-2 text-neutral-200">
                    {displayValue(payload[field.key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
