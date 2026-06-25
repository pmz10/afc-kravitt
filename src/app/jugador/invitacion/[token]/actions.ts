"use server";

import { redirect } from "next/navigation";
import { submitPublicPlayerInvite } from "@/lib/player-invites";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function guardarDatosInvitacion(formData: FormData) {
  const token = readString(formData, "token");
  if (!token) redirect("/");

  const payload = {
    nombre: readString(formData, "nombre"),
    apellido: readString(formData, "apellido"),
    apodo: readString(formData, "apodo"),
    dorsal: readString(formData, "dorsal"),
    posicion: readString(formData, "posicion"),
    posicionesSecundarias: formData
      .getAll("posicionesSecundarias")
      .filter((value): value is string => typeof value === "string"),
    pieDominante: readString(formData, "pieDominante"),
    fechaNacimiento: readString(formData, "fechaNacimiento"),
    email: readString(formData, "email"),
    bio: readString(formData, "bio"),
    capitan: formData.get("capitan") === "on",
    desde: readString(formData, "desde"),
    notasPeriodo: readString(formData, "notasPeriodo"),
  };

  let result: {
    jugadorId?: string;
    remainingUses: number;
    pendingApproval: boolean;
  };
  try {
    result = await submitPublicPlayerInvite(token, payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron guardar los datos";
    redirect(
      `/jugador/invitacion/${encodeURIComponent(token)}?error=${encodeURIComponent(message)}`,
    );
  }

  redirect(
    `/jugador/invitacion/${encodeURIComponent(token)}?success=1&remaining=${result.remainingUses}&pending=${result.pendingApproval ? "1" : "0"}`,
  );
}
