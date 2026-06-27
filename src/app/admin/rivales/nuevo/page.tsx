import Link from "next/link";
import { crearRival } from "../actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-orange-500 focus:outline-none text-sm";

const ERRORES: Record<string, string> = {
    campos: "El nombre es obligatorio.",
    escudo_grande: "El escudo pesa más de 10 MB.",
    escudo_tipo: "El escudo debe ser JPG, PNG o WebP.",
};

export default async function NuevoRivalPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const mensajeError = params.error ? ERRORES[params.error] : null;

    return (
        <div className="space-y-6 max-w-2xl">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Nuevo rival</h1>
                    <p className="text-sm text-neutral-400">
                        Equipo que hemos enfrentado o vamos a enfrentar.
                    </p>
                </div>
                <Link
                    href="/admin/rivales"
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

            <form action={crearRival} className="space-y-6">
                <Field label="Nombre *">
                    <input name="nombre" required className={inputCls} />
                </Field>
                <Field label="Nombre corto">
                    <input
                        name="nombreCorto"
                        placeholder="ej: TIG (para mostrar en marcadores compactos)"
                        className={inputCls}
                    />
                </Field>
                <Field label="Ciudad">
                    <input name="ciudad" className={inputCls} />
                </Field>
                <Field label="Escudo">
                    <ImageUploadField
                        name="escudo"
                        inputClassName={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-neutral-800 file:text-neutral-100 file:text-xs file:cursor-pointer`}
                    />
                    <span className="text-xs text-neutral-500 mt-1 block">
                        JPG, PNG o WebP. Máx 10 MB. Para mejor rendimiento, comprimilo en{" "}
                        <a
                            href="https://squoosh.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 underline"
                        >
                            squoosh.app
                        </a>
                        .
                    </span>
                </Field>
                <Field label="Notas tácticas">
                    <textarea
                        name="notas"
                        rows={3}
                        placeholder="ej: juego físico, presión alta, fuerte en pelota parada..."
                        className={inputCls}
                    />
                </Field>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-medium text-sm"
                    >
                        Crear rival
                    </button>
                    <Link
                        href="/admin/rivales"
                        className="px-5 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-sm"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
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
