import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  recordMatchAction: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@/app/actions/matching", () => ({
  recordMatchAction: mocks.recordMatchAction,
}));

vi.mock("@/lib/analytics", () => ({
  track: mocks.track,
}));

import { MatchDeck } from "@/components/matching/match-deck";
import { demoDogs } from "@/lib/demo-data";
import type { MatchCandidateDog } from "@/types/database";

function candidate(
  index: number,
  score: number,
  approxDistanceKm?: number,
): MatchCandidateDog {
  return {
    ...demoDogs[index],
    photo_url: null,
    compatibility_score: score,
    approx_distance_km: approxDistanceKm,
  };
}

describe("MatchDeck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recordMatchAction.mockResolvedValue({
      status: "success",
      message: "Decisión registrada.",
      isMutualMatch: false,
    });
  });

  it("renders Macho for a male Match candidate", () => {
    render(
      <MatchDeck activeDog={demoDogs[0]} initialCandidates={[candidate(2, 91)]} />,
    );

    expect(screen.getByText("Macho")).toBeInTheDocument();
    expect(screen.queryByText("male")).not.toBeInTheDocument();
  });

  it("renders Hembra for a female Match candidate", () => {
    render(
      <MatchDeck activeDog={demoDogs[0]} initialCandidates={[candidate(4, 86)]} />,
    );

    expect(screen.getByText("Hembra")).toBeInTheDocument();
    expect(screen.queryByText("female")).not.toBeInTheDocument();
  });

  it("renders city and formatted approximate distance together", () => {
    render(
      <MatchDeck
        activeDog={demoDogs[0]}
        initialCandidates={[candidate(2, 91, 3.5)]}
      />,
    );

    expect(screen.getByText(/Viña del Mar · A 3,5 km/)).toBeInTheDocument();
  });

  it("omits distance when the candidate has no approximate distance", () => {
    render(
      <MatchDeck activeDog={demoDogs[0]} initialCandidates={[candidate(2, 91)]} />,
    );

    expect(screen.getByText("Viña del Mar")).toBeInTheDocument();
    expect(screen.queryByText(/A .* km/)).not.toBeInTheDocument();
  });

  it("keeps the current card visible and re-enables actions after an expected failure", async () => {
    const user = userEvent.setup();
    mocks.recordMatchAction.mockResolvedValue({
      status: "error",
      message: "No pudimos registrar tu decisión.",
    });

    render(
      <MatchDeck
        activeDog={demoDogs[0]}
        initialCandidates={[candidate(2, 91), candidate(4, 86)]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /me gusta/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos registrar tu decisión.",
    );
    expect(screen.getByRole("heading", { name: demoDogs[2].name })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: demoDogs[4].name })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /pasar/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /me gusta/i })).toBeEnabled();
    });
  });

  it("shows the existing celebration modal for a mutual match", async () => {
    const user = userEvent.setup();
    mocks.recordMatchAction.mockResolvedValue({
      status: "success",
      message: "¡Hicieron Match!",
      isMutualMatch: true,
    });

    render(
      <MatchDeck activeDog={demoDogs[0]} initialCandidates={[candidate(2, 91)]} />,
    );

    await user.click(screen.getByRole("button", { name: /me gusta/i }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("¡Hicieron Match!");
  });

  it("prevents double submissions while the first action is unresolved", async () => {
    let resolveAction: ((value: { status: "success"; isMutualMatch: false }) => void) | undefined;
    mocks.recordMatchAction.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );

    render(
      <MatchDeck
        activeDog={demoDogs[0]}
        initialCandidates={[candidate(2, 91), candidate(4, 86)]}
      />,
    );

    const likeButton = screen.getByRole("button", { name: /me gusta/i });
    fireEvent.click(likeButton);
    fireEvent.click(likeButton);

    expect(mocks.recordMatchAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveAction?.({ status: "success", isMutualMatch: false });
    });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: demoDogs[4].name })).toBeInTheDocument();
    });
  });
});
