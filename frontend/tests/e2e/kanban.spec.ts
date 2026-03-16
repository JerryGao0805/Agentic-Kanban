import { expect, test } from "@playwright/test";

test("supports rename, add, and drag card flow", async ({ page }) => {
  await page.goto("/");

  const backlogTitle = page.getByLabel("Column title for backlog");
  await backlogTitle.fill("Ideas");
  await expect(backlogTitle).toHaveValue("Ideas");

  await page.getByLabel("New title for todo").fill("Write smoke test");
  await page.getByLabel("New details for todo").fill("Cover key kanban interactions.");
  await page.getByRole("button", { name: "Add card" }).nth(1).click();

  const newCard = page.getByText("Write smoke test");
  await expect(newCard).toBeVisible();

  const sourceCard = page.locator("[data-testid='card-card-new']").first();
  await expect(sourceCard).toHaveCount(0);

  const dragHandle = page.locator("button[aria-label='Drag Create onboarding checklist']");
  const source = await dragHandle.boundingBox();
  const targetColumn = page.locator("[data-testid='column-done']");
  const target = await targetColumn.boundingBox();

  if (!source || !target) {
    throw new Error("Unable to resolve drag bounds for card move.");
  }

  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + 40, { steps: 18 });
  await page.mouse.up();

  await expect(targetColumn.getByText("Create onboarding checklist")).toBeVisible();
});
