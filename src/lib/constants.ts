import type { Database } from "@/types/database";

export const personalityOptions = [
  { value: "playful", label: "Juguetón", emoji: "🎾" },
  { value: "calm", label: "Tranquilo", emoji: "🌿" },
  { value: "cuddly", label: "Regalón", emoji: "🤗" },
  { value: "independent", label: "Independiente", emoji: "✨" },
  { value: "curious", label: "Curioso", emoji: "🔎" },
  { value: "energetic", label: "Energético", emoji: "⚡" },
  { value: "protective", label: "Protector", emoji: "🛡️" },
  { value: "gentle", label: "Gentil", emoji: "🌼" },
  { value: "social", label: "Sociable", emoji: "🐾" },
  { value: "explorer", label: "Explorador", emoji: "🧭" },
  { value: "food_motivated", label: "Motivado por comida", emoji: "🦴" },
  { value: "toy_motivated", label: "Fanático de juguetes", emoji: "🪢" },
] as const;

export const sizeOptions: {
  value: Database["public"]["Enums"]["dog_size"];
  label: string;
}[] = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
  { value: "giant", label: "Gigante" },
];

export const energyOptions: {
  value: Database["public"]["Enums"]["energy_level"];
  label: string;
}[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "very_high", label: "Muy alta" },
];

export const sociabilityOptions: {
  value: Database["public"]["Enums"]["sociability_level"];
  label: string;
}[] = [
  { value: "shy", label: "Tímido" },
  { value: "selective", label: "Selectivo" },
  { value: "social", label: "Sociable" },
  { value: "very_social", label: "Muy sociable" },
];

export const productCategoryLabels: Record<
  Database["public"]["Enums"]["product_category"],
  string
> = {
  toy: "Juguete",
  treat: "Premio",
  food: "Alimento",
  accessory: "Accesorio",
  enrichment: "Enriquecimiento",
  health: "Bienestar",
  other: "Otro",
};

export const preferenceCategoryLabels: Record<
  Database["public"]["Enums"]["preference_category"],
  string
> = {
  toy: "Juguetes",
  treat: "Premios",
  food: "Alimentación",
  activity: "Actividades",
  behavior: "Comportamiento",
  other: "Otros",
};

export const reactionOptions = [
  { value: "loved", label: "Le encantó", emoji: "😍", rating: 5 },
  { value: "liked", label: "Le gustó", emoji: "🙂", rating: 4 },
  { value: "neutral", label: "Más o menos", emoji: "😐", rating: 3 },
  { value: "disliked", label: "No le gustó", emoji: "👎", rating: 1 },
] as const;

export const defaultSiteUrl = "http://localhost:3000";
export const dogPhotoBucket = "dog-photos";
export const maxDogPhotoBytes = 3 * 1024 * 1024;
