import {
  PLAYER_INVITE_SECTIONS,
  getPublicPlayerInvite,
} from "@/lib/player-invites";
import { toISODate } from "@/lib/utils";
import { guardarDatosInvitacion } from "./actions";

export const metadata = {
  title: "Ficha de jugador | AFC Kravitt",
  robots: {
    index: false,
    follow: false,
  },
};

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-orange-500";

export default async function InvitacionJugadorPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    success?: string;
    remaining?: string;
    pending?: string;
    error?: string;
  }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const invite = await getPublicPlayerInvite(token);

  if (query.success) {
    return (
      <PublicShell>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-emerald-300">
            {query.pending === "1"
              ? "Información enviada para revisión"
              : "Datos guardados"}
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            {query.pending === "1"
              ? "Un administrador debe aprobarla antes de crear o modificar la ficha."
              : Number(query.remaining) > 0
                ? `El enlace todavía admite ${query.remaining} envío(s) más.`
                : "El enlace ya fue consumido y no puede volver a utilizarse."}
          </p>
        </div>
      </PublicShell>
    );
  }

  if (!invite.valid || !invite.mode) {
    return (
      <PublicShell>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-300">
            Enlace no disponible
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            El enlace expiró, fue revocado o ya alcanzó su límite de usos.
          </p>
        </div>
      </PublicShell>
    );
  }

  const jugador = invite.jugador;
  const allowedSections = new Set(
    invite.mode === "create"
      ? PLAYER_INVITE_SECTIONS
      : (invite.allowedSections ?? PLAYER_INVITE_SECTIONS),
  );
  const showPersonal = allowedSections.has("personal");
  const showSports = allowedSections.has("sports");
  const showProfile = allowedSections.has("profile");

  return (
    <PublicShell>
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
          AFC Kravitt
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          {invite.mode === "create"
            ? "Completa tu ficha de jugador"
            : `Actualiza los datos de ${jugador?.nombre ?? "tu ficha"}`}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          No necesitas una cuenta. Este enlace tiene permisos limitados únicamente
          para esta ficha.
        </p>
      </header>

      {query.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {query.error}
        </p>
      )}

      <form action={guardarDatosInvitacion} className="space-y-7">
        <input type="hidden" name="token" value={token} />

        {showPersonal && (
        <Section title="Datos personales">
          <Field label="Nombre *">
            <input
              name="nombre"
              required
              maxLength={100}
              defaultValue={jugador?.nombre ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Apellido *">
            <input
              name="apellido"
              required
              maxLength={100}
              defaultValue={jugador?.apellido ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Apodo">
            <input
              name="apodo"
              maxLength={100}
              defaultValue={jugador?.apodo ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              type="date"
              name="fechaNacimiento"
              defaultValue={jugador?.fechaNacimiento ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Email" full>
            <input
              type="email"
              name="email"
              maxLength={254}
              defaultValue={jugador?.email ?? ""}
              className={inputCls}
            />
          </Field>
        </Section>
        )}

        {showSports && (
        <Section title="Información deportiva">
          <Field label="Dorsal *">
            <input
              type="number"
              name="dorsal"
              min={0}
              max={99}
              required
              defaultValue={jugador?.dorsal ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="Posición principal *">
            <select
              name="posicion"
              required
              defaultValue={jugador?.posicion ?? ""}
              className={inputCls}
            >
              <option value="" disabled>
                Selecciona una
              </option>
              <option value="POR">Portero</option>
              <option value="DEF">Defensa</option>
              <option value="MED">Medio</option>
              <option value="DEL">Delantero</option>
            </select>
          </Field>
          <Field label="Posiciones secundarias">
            <div className="flex flex-wrap gap-3 text-sm">
              {(["POR", "DEF", "MED", "DEL"] as const).map((position) => (
                <label key={position} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="posicionesSecundarias"
                    value={position}
                    defaultChecked={
                      jugador?.posicionesSecundarias?.includes(position) ?? false
                    }
                  />
                  {position}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Pie dominante">
            <div className="flex flex-wrap gap-4 text-sm">
              {(["izq", "der", "ambos"] as const).map((foot) => (
                <label key={foot} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="pieDominante"
                    value={foot}
                    defaultChecked={jugador?.pieDominante === foot}
                  />
                  {foot === "izq"
                    ? "Izquierdo"
                    : foot === "der"
                      ? "Derecho"
                      : "Ambos"}
                </label>
              ))}
            </div>
          </Field>
          <Field label="" full>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="capitan"
                defaultChecked={jugador?.capitan ?? false}
              />
              Soy capitán del equipo
            </label>
          </Field>
        </Section>
        )}

        {invite.mode === "create" && (
          <Section title="Ingreso al club">
            <Field label="Fecha de ingreso *">
              <input
                type="date"
                name="desde"
                required
                defaultValue={toISODate(new Date())}
                className={inputCls}
              />
            </Field>
            <Field label="Notas">
              <input name="notasPeriodo" className={inputCls} />
            </Field>
          </Section>
        )}

        {showProfile && (
        <Section title="Perfil">
          <Field label="Bio" full>
            <textarea
              name="bio"
              rows={4}
              maxLength={1000}
              defaultValue={jugador?.bio ?? ""}
              className={inputCls}
            />
          </Field>
        </Section>
        )}

        <button className="w-full rounded-lg bg-orange-500 px-5 py-3 font-medium text-neutral-950 hover:bg-orange-400">
          Guardar datos
        </button>
      </form>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100">
      <div className="mx-auto max-w-2xl space-y-7">{children}</div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm uppercase tracking-widest text-neutral-500">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
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
