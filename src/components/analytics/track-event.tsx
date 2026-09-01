"use client";

import { useEffect } from "react";

import { track, type AnalyticsEvent, type EventProperties } from "@/lib/analytics";

export function TrackEvent({
  name,
  properties,
}: {
  name: AnalyticsEvent;
  properties?: EventProperties;
}) {
  useEffect(() => {
    track(name, properties);
  }, [name, properties]);

  return null;
}
