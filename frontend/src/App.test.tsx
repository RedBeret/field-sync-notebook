import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Field Sync workflow", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves a new update locally and puts it in the queue", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add update" }));
    await user.type(screen.getByLabelText("Title"), "Inspect west valve");
    await user.type(screen.getByLabelText("Details"), "Check pressure and photograph the seal.");
    await user.click(screen.getByRole("button", { name: "Save locally" }));

    expect(screen.getAllByText("Inspect west valve").length).toBeGreaterThan(1);
    expect(screen.getByText("Update saved locally and added to the sync queue.")).toBeInTheDocument();
  });

  it("keeps queued work safe when a sync is attempted offline", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Open connection settings" }));
    await user.click(screen.getByRole("button", { name: /Offline/ }));
    await user.click(screen.getByRole("button", { name: "Sync now" }));

    expect(await screen.findByText("No connection. Changes remain safely on this device.")).toBeInTheDocument();
    expect(screen.getByText("3 changes waiting")).toBeInTheDocument();
  });

  it("exposes conflict resolution from the selected task", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Confirm generator fuel delivery/ }));
    await user.click(screen.getByRole("button", { name: "Resolve conflict" }));
    await user.click(screen.getByRole("button", { name: /Merge changes/ }));

    expect(screen.getByText("Conflict resolved. The chosen version is queued to sync.")).toBeInTheDocument();
    expect(screen.getAllByText("Queued").length).toBeGreaterThan(0);
  });
});
