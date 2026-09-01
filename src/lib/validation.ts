import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

export const loginSchema = z.object({
  email: z
    .string({ error: "Ingresa tu correo." })
    .trim()
    .email("Ingresa un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const signUpSchema = loginSchema.extend({
  displayName: z
    .string({ error: "Ingresa tu nombre." })
    .trim()
    .min(2, "Tu nombre debe tener al menos 2 caracteres.")
    .max(60, "Tu nombre es demasiado largo."),
});

export const dogSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(50, "El nombre es demasiado largo."),
    breed: z
      .string()
      .trim()
      .min(2, "Cuéntanos la raza o mezcla.")
      .max(80, "La raza es demasiado larga."),
    mixedBreed: z.boolean().default(false),
    sex: z.enum(["female", "male", "unknown"]).default("unknown"),
    birthDate: z.preprocess(
      emptyToUndefined,
      z.iso.date("Ingresa una fecha válida.").optional(),
    ),
    adoptionDate: z.preprocess(
      emptyToUndefined,
      z.iso.date("Ingresa una fecha válida.").optional(),
    ),
    weightKg: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .positive("El peso debe ser mayor que cero.")
        .max(150, "Revisa el peso ingresado.")
        .optional(),
    ),
    size: z.enum(["small", "medium", "large", "giant"]).default("medium"),
    energyLevel: z.enum(["low", "medium", "high", "very_high"]).default("medium"),
    sociability: z.enum(["shy", "selective", "social", "very_social"]).default("social"),
    playStyle: z.string().trim().max(100).optional(),
    personalityTags: z
      .array(z.string().regex(/^[a-z_]+$/))
      .max(6, "Elige hasta 6 rasgos.")
      .default([]),
    bio: z
      .string()
      .trim()
      .max(600, "La historia debe tener menos de 600 caracteres.")
      .default(""),
    city: z.string().trim().max(80).optional(),
    country: z.string().trim().max(80).optional(),
    isPublic: z.boolean().default(true),
  })
  .refine(
    ({ birthDate, adoptionDate }) =>
      !birthDate || !adoptionDate || adoptionDate >= birthDate,
    {
      message: "La fecha de adopción no puede ser anterior al nacimiento.",
      path: ["adoptionDate"],
    },
  );

export const preferenceSchema = z.object({
  dogId: z.string().uuid(),
  category: z.enum(["toy", "treat", "food", "activity", "behavior", "other"]),
  preferenceKey: z
    .string()
    .trim()
    .min(2, "Agrega un nombre breve.")
    .max(60),
  value: z.string().trim().min(2, "Agrega un detalle.").max(120),
  sentiment: z.coerce.number().int().min(-2).max(2),
  isPublic: z.boolean(),
});

export const productFeedbackSchema = z.object({
  dogId: z.string().uuid(),
  productId: z.string().uuid(),
  reaction: z.enum(["loved", "liked", "neutral", "disliked"]),
  rating: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(5).optional(),
  ),
  favorite: z.boolean(),
  destroyed: z.boolean().optional(),
  lifetimeHours: z.preprocess(
    emptyToUndefined,
    z.coerce.number().nonnegative().max(87600).optional(),
  ),
  accepted: z.boolean().optional(),
  wouldBuyAgain: z.boolean().optional(),
  possibleReaction: z.boolean().optional(),
  notes: z.string().trim().max(400).optional(),
});

export const friendRequestSchema = z
  .object({
    requesterDogId: z.string().uuid(),
    recipientDogId: z.string().uuid(),
  })
  .refine(({ requesterDogId, recipientDogId }) => requesterDogId !== recipientDogId, {
    message: "Un perro no puede agregarse a sí mismo.",
    path: ["recipientDogId"],
  });

export const friendshipResponseSchema = z.object({
  friendshipId: z.string().uuid(),
  status: z.enum(["accepted", "declined", "blocked"]),
});
