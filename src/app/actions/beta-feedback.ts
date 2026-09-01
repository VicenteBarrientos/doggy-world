"use server";

import { z } from "zod";

import { actionMessage, requireActionUser, stringValue } from "@/lib/action-helpers";
import type { ActionState } from "@/lib/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const betaFeedbackCategories = [
  "Algo no funciona",
  "No entendí algo",
  "Tengo una idea",
  "Me gustó algo",
  "Otro",
] as const;

export type BetaFeedbackCategory = (typeof betaFeedbackCategories)[number];

const betaFeedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Por favor escribe un mensaje con al menos 3 caracteres.")
    .max(2000, "El mensaje no puede superar los 2000 caracteres."),
  category: z.enum(betaFeedbackCategories).default("Otro"),
  pagePath: z.string().trim().max(200).optional().nullable(),
});

export async function submitBetaFeedbackAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireActionUser();

    const parsed = betaFeedbackSchema.safeParse({
      message: stringValue(formData, "message"),
      category: stringValue(formData, "category") || "Otro",
      pagePath: stringValue(formData, "pagePath") || null,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]?.toString() ?? "form";
        fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
      }
      return {
        status: "error",
        message: "Revisa los campos antes de enviar tu feedback.",
        fieldErrors,
      };
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("beta_feedback").insert({
        user_id: user.id,
        category: parsed.data.category,
        message: parsed.data.message,
        page_path: parsed.data.pagePath,
      });

      if (error) {
        console.error("[Beta Feedback Error]", error);
        return {
          status: "error",
          message: "No pudimos enviar tu feedback en este momento. Inténtalo de nuevo.",
        };
      }
    }

    return {
      status: "success",
      message: "¡Muchas gracias por tu feedback! Nos ayuda a construir un mejor Doggy World.",
    };
  } catch (error) {
    return {
      status: "error",
      message: actionMessage(error),
    };
  }
}
