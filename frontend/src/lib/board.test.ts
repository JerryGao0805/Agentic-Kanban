import {
  addCard,
  createInitialColumns,
  deleteCard,
  moveCard,
  renameColumn,
} from "@/src/lib/board";

describe("board state operations", () => {
  test("renames a column inline", () => {
    const current = createInitialColumns();

    const next = renameColumn(current, "todo", "Ready Next");

    expect(next.find((column) => column.id === "todo")?.title).toBe("Ready Next");
  });

  test("adds and removes a card", () => {
    const current = createInitialColumns();
    const withCard = addCard(current, "todo", {
      id: "card-new",
      title: "Ship docs",
      details: "Add run/test docs to README",
    });

    const columnWithAddedCard = withCard.find((column) => column.id === "todo");
    expect(columnWithAddedCard?.cards.some((card) => card.id === "card-new")).toBe(true);

    const afterDelete = deleteCard(withCard, "todo", "card-new");
    const columnAfterDelete = afterDelete.find((column) => column.id === "todo");
    expect(columnAfterDelete?.cards.some((card) => card.id === "card-new")).toBe(false);
  });

  test("moves a card between columns", () => {
    const current = createInitialColumns();
    const next = moveCard(current, "backlog", "done", "card-1");

    const sourceColumn = next.find((column) => column.id === "backlog");
    const targetColumn = next.find((column) => column.id === "done");

    expect(sourceColumn?.cards.some((card) => card.id === "card-1")).toBe(false);
    expect(targetColumn?.cards.some((card) => card.id === "card-1")).toBe(true);
  });
});
