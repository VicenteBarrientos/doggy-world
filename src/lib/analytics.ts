import { track as vercelTrack } from "@vercel/analytics";

export type AnalyticsEvent =
  | "landing_view"
  | "signup_started"
  | "signup_completed"
  | "login_completed"
  | "dog_creation_started"
  | "dog_created"
  | "dog_photo_uploaded"
  | "passport_viewed_owner"
  | "passport_viewed_public"
  | "passport_share_opened"
  | "passport_qr_opened"
  | "friendship_request_sent"
  | "friendship_request_accepted"
  | "product_feedback_submitted"
  | "beta_feedback_opened"
  | "beta_feedback_submitted";

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Privacy-conscious analytics tracker.
 * Strips null/undefined values and never sends private user notes, passwords, tokens, or PII.
 */
export function track(eventName: AnalyticsEvent, properties?: EventProperties) {
  try {
    if (typeof window === "undefined") return;

    const safeProperties: Record<string, string | number | boolean> = {};
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (value !== null && value !== undefined) {
          safeProperties[key] = value;
        }
      }
    }

    vercelTrack(eventName, safeProperties);
  } catch {
    // Analytics failure should never disrupt the user journey.
  }
}
