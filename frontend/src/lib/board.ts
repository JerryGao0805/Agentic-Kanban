export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      {
        id: "card-1",
        title: "Draft landing copy",
        details: "Write headline and short value proposition for MVP launch.",
      },
      {
        id: "card-2",
        title: "Collect logo assets",
        details: "Prepare light and dark variants for the product UI.",
      },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    cards: [
      {
        id: "card-3",
        title: "Create onboarding checklist",
        details: "Outline first-use actions to reduce user confusion.",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      {
        id: "card-4",
        title: "Build card editor",
        details: "Support editing title and details inline without modal flows.",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      {
        id: "card-5",
        title: "Accessibility pass",
        details: "Check focus rings and contrast for all controls.",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "card-6",
        title: "Project setup",
        details: "Initialize repo standards and baseline tooling.",
      },
    ],
  },
];

export function createInitialColumns(): Column[] {
  return initialColumns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => ({ ...card })),
  }));
}

export function renameColumn(
  columns: Column[],
  columnId: string,
  title: string,
): Column[] {
  return columns.map((column) =>
    column.id === columnId ? { ...column, title } : column,
  );
}

export function addCard(
  columns: Column[],
  columnId: string,
  card: Card,
): Column[] {
  return columns.map((column) =>
    column.id === columnId ? { ...column, cards: [...column.cards, card] } : column,
  );
}

export function deleteCard(
  columns: Column[],
  columnId: string,
  cardId: string,
): Column[] {
  return columns.map((column) =>
    column.id === columnId
      ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
      : column,
  );
}

export function moveCard(
  columns: Column[],
  sourceColumnId: string,
  targetColumnId: string,
  cardId: string,
): Column[] {
  if (sourceColumnId === targetColumnId) {
    return columns;
  }

  const sourceColumn = columns.find((column) => column.id === sourceColumnId);
  const card = sourceColumn?.cards.find((item) => item.id === cardId);

  if (!card) {
    return columns;
  }

  return columns.map((column) => {
    if (column.id === sourceColumnId) {
      return {
        ...column,
        cards: column.cards.filter((item) => item.id !== cardId),
      };
    }

    if (column.id === targetColumnId) {
      return {
        ...column,
        cards: [...column.cards, card],
      };
    }

    return column;
  });
}
