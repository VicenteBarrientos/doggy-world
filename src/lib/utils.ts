import { defaultSiteUrl, personalityOptions } from "@/lib/constants";
import type { Dog, DogPreference } from "@/types/database";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildDogSlug(name: string, id: string) {
  const prefix = slugify(name) || "perro";
  return `${prefix}-${id.replaceAll("-", "").slice(0, 6)}`;
}

export function calculateAge(birthDate: string | null, now = new Date()) {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime()) || birth > now) return null;

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatAge(birthDate: string | null, now = new Date()) {
  const months = calculateAge(birthDate, now);
  if (months === null) return "Edad por completar";
  if (months < 1) return "Menos de un mes";
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }
  return `${years} ${years === 1 ? "año" : "años"} y ${remainingMonths} ${remainingMonths === 1 ? "mes" : "meses"}`;
}

export function calculateProfileCompleteness(
  dog: Pick<
    Dog,
    | "photo_path"
    | "breed"
    | "birth_date"
    | "adoption_date"
    | "weight_kg"
    | "size"
    | "energy_level"
    | "sociability"
    | "bio"
  >,
  preferences: Pick<DogPreference, "id">[] = [],
) {
  const checks = [
    Boolean(dog.photo_path),
    Boolean(dog.breed.trim()),
    Boolean(dog.birth_date || dog.adoption_date),
    dog.weight_kg !== null,
    Boolean(dog.size),
    Boolean(dog.energy_level),
    Boolean(dog.sociability),
    dog.bio.trim().length >= 20,
    preferences.length > 0,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function personalityLabel(tag: string) {
  const option = personalityOptions.find((item) => item.value === tag);
  return option ? `${option.emoji} ${option.label}` : tag.replaceAll("_", " ");
}

export function sexLabel(sex: Dog["sex"] | null | undefined) {
  if (sex === "male") return "Macho";
  if (sex === "female") return "Hembra";
  return null;
}

export function canonicalFriendshipPair(firstDogId: string, secondDogId: string) {
  if (firstDogId === secondDogId) {
    throw new Error("Un perro no puede agregarse a sí mismo.");
  }
  return [firstDogId, secondDogId].sort() as [string, string];
}

export function absoluteUrl(path = "") {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null;
  const origin = configured || vercelHost || defaultSiteUrl;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatWeight(weight: number | null) {
  if (weight === null) return "Peso por completar";
  return `${new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 }).format(weight)} kg`;
}

export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
