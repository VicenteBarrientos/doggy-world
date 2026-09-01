"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Compass,
  Eye,
  EyeOff,
  List,
  LoaderCircle,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { saveDogLocationAction, toggleNearbyVisibilityAction } from "@/app/actions/location";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { DogLocation, DogWithPhoto, NearbyDog } from "@/types/database";

// Dynamically import map with SSR disabled to prevent Leaflet window errors
const DynamicNearbyMap = dynamic(
  () => import("@/components/map/nearby-map").then((mod) => mod.NearbyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center border-2 border-ink bg-cream-deep">
        <div className="flex items-center gap-2 font-display text-sm uppercase text-ink">
          <LoaderCircle className="animate-spin text-electric" size={18} />
          Cargando mapa interactivo…
        </div>
      </div>
    ),
  },
);

type NearbyClientViewProps = {
  ownerDogs: DogWithPhoto[];
  initialLocation: Pick<DogLocation, "id" | "dog_id" | "nearby_enabled" | "city" | "location_label"> | null;
  initialNearbyDogs: NearbyDog[];
};

export function NearbyClientView({
  ownerDogs,
  initialLocation,
  initialNearbyDogs,
}: NearbyClientViewProps) {
  const [selectedDogId, setSelectedDogId] = useState(ownerDogs[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [nearbyEnabled, setNearbyEnabled] = useState(initialLocation?.nearby_enabled ?? true);
  const [userCoords, setUserCoords] = useState<[number, number]>([-33.4372, -70.6506]);
  const [hasCustomLocation, setHasCustomLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter nearby dogs by selected radius
  const filteredDogs = initialNearbyDogs.filter((d) => d.distance_km <= radiusKm);

  function handleRequestLocation() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords([lat, lng]);
        setHasCustomLocation(true);
        setIsLocating(false);
        track("nearby_location_enabled");

        // Save location for the selected dog
        const fd = new FormData();
        fd.set("dogId", selectedDogId);
        fd.set("lat", lat.toString());
        fd.set("lng", lng.toString());
        fd.set("nearbyEnabled", nearbyEnabled ? "true" : "false");

        startTransition(async () => {
          await saveDogLocationAction({ status: "idle" }, fd);
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGeoError("Permiso de ubicación denegado. Puedes cambiarlo en los ajustes de tu navegador.");
        } else {
          setGeoError("No pudimos obtener tu ubicación precisa. Revisa tu conexión.");
        }
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  }

  function handleToggleNearby() {
    const nextVal = !nearbyEnabled;
    setNearbyEnabled(nextVal);

    const fd = new FormData();
    fd.set("dogId", selectedDogId);
    if (nextVal) fd.set("nearbyEnabled", "true");

    startTransition(async () => {
      await toggleNearbyVisibilityAction({ status: "idle" }, fd);
    });
  }

  function handleRadiusChange(r: number) {
    setRadiusKm(r);
    track("nearby_radius_changed", { radius_km: r });
  }

  function handleToggleView(mode: "list" | "map") {
    setViewMode(mode);
    if (mode === "map") {
      track("map_opened");
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. PRIVACY BANNER */}
      <div className="border-2 border-ink bg-sun/30 p-4 shadow-[4px_4px_0_var(--ink)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_var(--ink)]">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 className="font-display text-sm uppercase tracking-wide text-ink">
                Tu ubicación es privada
              </h3>
              <p className="mt-0.5 text-xs text-ink/80">
                Usamos tu ubicación para encontrar perros en tu zona. Nunca mostramos tu dirección exacta ni
                coordenadas reales a otros usuarios.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRequestLocation}
              disabled={isLocating || isPending}
              className="w-full gap-1.5 sm:w-auto"
            >
              {isLocating ? (
                <LoaderCircle className="animate-spin" size={14} />
              ) : (
                <MapPin size={14} />
              )}
              {hasCustomLocation ? "Ubicación actualizada" : "Usar mi ubicación"}
            </Button>
          </div>
        </div>

        {geoError ? (
          <p className="mt-3 text-xs font-semibold text-danger">{geoError}</p>
        ) : null}
      </div>

      {/* 2. CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-white p-4 shadow-[4px_4px_0_var(--ink)]">
        {/* Dog Selector */}
        {ownerDogs.length > 1 ? (
          <div className="flex items-center gap-2">
            <label htmlFor="dog-select" className="font-display text-xs uppercase tracking-wider text-ink">
              Buscando con:
            </label>
            <select
              id="dog-select"
              value={selectedDogId}
              onChange={(e) => setSelectedDogId(e.target.value)}
              className="border-2 border-ink bg-cream px-2.5 py-1 text-xs font-bold text-ink shadow-[2px_2px_0_var(--ink)]"
            >
              {ownerDogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          </div>
        ) : ownerDogs[0] ? (
          <div className="flex items-center gap-2">
            <span className="font-display text-xs uppercase tracking-wider text-ink/70">Perro activo:</span>
            <span className="font-display text-xs uppercase font-bold text-ink">{ownerDogs[0].name}</span>
          </div>
        ) : null}

        {/* Radius selector */}
        <div className="flex items-center gap-1.5">
          <span className="mr-1 font-display text-xs uppercase tracking-wider text-ink/70">Radio:</span>
          {[1, 3, 5, 10, 25].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRadiusChange(r)}
              className={`border-2 border-ink px-2.5 py-1 font-display text-xs uppercase transition shadow-[1px_1px_0_var(--ink)] ${
                radiusKm === r
                  ? "bg-electric text-white"
                  : "bg-cream text-ink hover:bg-cream-deep"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* Visibility Toggle & List/Map Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleNearby}
            className={`inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1 font-display text-xs uppercase tracking-wider shadow-[2px_2px_0_var(--ink)] transition ${
              nearbyEnabled ? "bg-sun text-ink" : "bg-white text-ink/60"
            }`}
            title="Activar o desactivar visibilidad para otros perros cercanos"
          >
            {nearbyEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{nearbyEnabled ? "Visible cerca" : "Oculto"}</span>
          </button>

          <div className="inline-flex border-2 border-ink bg-white shadow-[2px_2px_0_var(--ink)]">
            <button
              type="button"
              onClick={() => handleToggleView("list")}
              className={`inline-flex items-center gap-1 px-3 py-1 font-display text-xs uppercase transition ${
                viewMode === "list" ? "bg-ink text-white" : "text-ink hover:bg-cream"
              }`}
            >
              <List size={13} />
              <span>Lista</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleView("map")}
              className={`inline-flex items-center gap-1 border-l-2 border-ink px-3 py-1 font-display text-xs uppercase transition ${
                viewMode === "map" ? "bg-ink text-white" : "text-ink hover:bg-cream"
              }`}
            >
              <MapIcon size={13} />
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTENT (LIST OR MAP) */}
      {viewMode === "map" ? (
        <div className="overflow-hidden">
          <DynamicNearbyMap center={userCoords} dogs={filteredDogs} />
        </div>
      ) : (
        <div>
          {filteredDogs.length === 0 ? (
            <div className="border-2 border-ink bg-white p-12 text-center shadow-[6px_6px_0_var(--ink)]">
              <div className="mx-auto flex size-14 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[3px_3px_0_var(--ink)]">
                <Compass size={28} />
              </div>
              <h3 className="mt-4 font-display text-xl uppercase tracking-tight text-ink">
                Todavía no hay perros cerca
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-ink/75">
                No encontramos otros pasaportes públicos a menos de {radiusKm} km. Prueba ampliando el
                radio de búsqueda a 10 km o 25 km.
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleRadiusChange(10)}>
                  Buscar en 10 km
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRadiusChange(25)}>
                  Buscar en 25 km
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDogs.map((dog) => (
                <div
                  key={dog.dog_id}
                  className="edge-card flex flex-col justify-between bg-white p-5 shadow-[5px_5px_0_var(--ink)] transition hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <DogAvatar
                        src={dog.photo_url}
                        name={dog.name}
                        size="md"
                        className="border-2 border-ink"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="truncate font-display text-lg uppercase text-ink">
                            {dog.name}
                          </h4>
                          <span className="shrink-0 border border-ink bg-sun px-1.5 py-0.5 font-display text-[10px] uppercase text-ink shadow-[1px_1px_0_var(--ink)]">
                            ~{dog.distance_km} km
                          </span>
                        </div>
                        <p className="truncate text-xs text-ink/70">{dog.breed}</p>
                        {dog.city ? (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink/60">
                            <MapPin size={11} /> {dog.city}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 border border-ink bg-cream px-2 py-0.5 font-display text-[10px] uppercase text-ink">
                        <Zap size={10} className="text-ink/60" /> {dog.energy_level}
                      </span>
                      <span className="inline-flex items-center gap-1 border border-ink bg-cream px-2 py-0.5 font-display text-[10px] uppercase text-ink">
                        <Sparkles size={10} className="text-ink/60" /> {dog.sociability}
                      </span>
                      <span className="border border-ink bg-cream px-2 py-0.5 font-display text-[10px] uppercase text-ink">
                        {dog.size}
                      </span>
                    </div>

                    {dog.play_style ? (
                      <p className="mt-3 line-clamp-2 text-xs italic text-ink/75">
                        “{dog.play_style}”
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t-2 border-ink pt-3">
                    <Link
                      href={`/dog/${dog.slug}`}
                      className="font-display text-xs uppercase tracking-wider text-ink underline decoration-2 underline-offset-2 transition hover:text-electric"
                    >
                      Ver Pasaporte
                    </Link>
                    <Link
                      href="/match"
                      className="inline-flex items-center gap-1 border border-ink bg-electric px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-white shadow-[2px_2px_0_var(--ink)] transition hover:bg-electric-hover"
                    >
                      <span>Match 🐾</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
