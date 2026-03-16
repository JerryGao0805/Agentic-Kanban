"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  addCard,
  Column,
  createInitialColumns,
  deleteCard,
  moveCard,
  renameColumn,
} from "@/src/lib/board";
import styles from "@/src/components/KanbanBoard.module.css";

type CardDraft = {
  title: string;
  details: string;
};

type DragCardData = {
  cardId: string;
  sourceColumnId: string;
};

function CardItem({
  columnId,
  cardId,
  title,
  details,
  onDelete,
}: {
  columnId: string;
  cardId: string;
  title: string;
  details: string;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card:${cardId}`,
    data: {
      cardId,
      sourceColumnId: columnId,
    } satisfies DragCardData,
  });

  const draggableStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={draggableStyle}
      className={styles.card}
      data-testid={`card-${cardId}`}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Drag ${title}`}
        {...listeners}
        {...attributes}
      >
        Drag
      </button>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDetails}>{details}</p>
      </div>
      <button
        type="button"
        className={styles.deleteButton}
        aria-label={`Delete ${title}`}
        onClick={onDelete}
      >
        Delete
      </button>
    </article>
  );
}

function ColumnView({
  column,
  draft,
  onTitleChange,
  onDraftChange,
  onAddCard,
  onDeleteCard,
}: {
  column: Column;
  draft: CardDraft;
  onTitleChange: (value: string) => void;
  onDraftChange: (next: CardDraft) => void;
  onAddCard: () => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ""}`}
      data-testid={`column-${column.id}`}
    >
      <input
        className={styles.columnTitle}
        value={column.title}
        onChange={(event) => onTitleChange(event.target.value)}
        aria-label={`Column title for ${column.id}`}
      />
      <div className={styles.cardsArea}>
        {column.cards.map((card) => (
          <CardItem
            key={card.id}
            columnId={column.id}
            cardId={card.id}
            title={card.title}
            details={card.details}
            onDelete={() => onDeleteCard(card.id)}
          />
        ))}
      </div>

      <form
        className={styles.addCardForm}
        onSubmit={(event) => {
          event.preventDefault();
          onAddCard();
        }}
      >
        <input
          className={styles.textInput}
          placeholder="Card title"
          value={draft.title}
          aria-label={`New title for ${column.id}`}
          onChange={(event) =>
            onDraftChange({
              ...draft,
              title: event.target.value,
            })
          }
        />
        <textarea
          className={styles.textArea}
          placeholder="Card details"
          value={draft.details}
          aria-label={`New details for ${column.id}`}
          onChange={(event) =>
            onDraftChange({
              ...draft,
              details: event.target.value,
            })
          }
        />
        <button type="submit" className={styles.primaryButton}>
          Add card
        </button>
      </form>
    </section>
  );
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(() => createInitialColumns());
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, CardDraft>>(() =>
    Object.fromEntries(
      createInitialColumns().map((column) => [
        column.id,
        {
          title: "",
          details: "",
        },
      ]),
    ),
  );

  const totalCards = useMemo(
    () => columns.reduce((accumulator, column) => accumulator + column.cards.length, 0),
    [columns],
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragCardData | undefined;
    if (data) {
      setActiveCardId(data.cardId);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const targetColumnId = event.over?.id;
    const dragData = event.active.data.current as DragCardData | undefined;

    if (!targetColumnId || !dragData) {
      return;
    }

    setColumns((previousColumns) =>
      moveCard(
        previousColumns,
        dragData.sourceColumnId,
        String(targetColumnId),
        dragData.cardId,
      ),
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Project Board</h1>
          <p className={styles.subtitle}>
            Drag cards between columns, rename lanes inline, and keep work visible.
          </p>
        </div>
        <p className={styles.countLabel}>
          <span className={styles.countValue}>{totalCards}</span> cards
          {activeCardId ? ` (moving ${activeCardId})` : ""}
        </p>
      </header>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {columns.map((column) => (
            <ColumnView
              key={column.id}
              column={column}
              draft={drafts[column.id]}
              onTitleChange={(value) => {
                setColumns((previousColumns) =>
                  renameColumn(previousColumns, column.id, value),
                );
              }}
              onDraftChange={(nextDraft) =>
                setDrafts((previousDrafts) => ({
                  ...previousDrafts,
                  [column.id]: nextDraft,
                }))
              }
              onAddCard={() => {
                const draft = drafts[column.id];
                const title = draft.title.trim();
                const details = draft.details.trim();
                if (!title || !details) {
                  return;
                }

                setColumns((previousColumns) =>
                  addCard(previousColumns, column.id, {
                    id: `card-${crypto.randomUUID()}`,
                    title,
                    details,
                  }),
                );
                setDrafts((previousDrafts) => ({
                  ...previousDrafts,
                  [column.id]: {
                    title: "",
                    details: "",
                  },
                }));
              }}
              onDeleteCard={(cardId) =>
                setColumns((previousColumns) =>
                  deleteCard(previousColumns, column.id, cardId),
                )
              }
            />
          ))}
        </div>
      </DndContext>
    </main>
  );
}
