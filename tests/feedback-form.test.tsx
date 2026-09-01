import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FeedbackForm } from "@/components/products/feedback-form";
import { demoDogs, demoProducts } from "@/lib/demo-data";

vi.mock("@/app/actions/feedback", () => ({
  saveProductFeedbackAction: vi.fn(),
}));

describe("FeedbackForm", () => {
  it("shows toy-specific follow-up questions after a reaction", async () => {
    const user = userEvent.setup();
    render(<FeedbackForm dog={demoDogs[0]} product={demoProducts[0]} />);

    expect(screen.queryByText("¿Lo destruyó?")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Le encantó"));

    expect(screen.getByText("¿Lo destruyó?")).toBeInTheDocument();
    expect(screen.getByLabelText("¿Cuánto duró?")).toBeInTheDocument();
    expect(screen.queryByText("¿Lo aceptó?")).not.toBeInTheDocument();
  });

  it("shows edible-specific follow-up questions for treats", async () => {
    const user = userEvent.setup();
    render(<FeedbackForm dog={demoDogs[0]} product={demoProducts[3]} />);
    await user.click(screen.getByLabelText("Le gustó"));

    expect(screen.getByText("¿Lo aceptó?")).toBeInTheDocument();
    expect(screen.getByText("¿Notaste una posible reacción?")).toBeInTheDocument();
    expect(screen.queryByText("¿Lo destruyó?")).not.toBeInTheDocument();
  });
});
