import type { List } from "../../types";
import { BoardCard } from "./BoardCard";

interface BoardListProps {
  list: List;
}

export function BoardList({ list }: BoardListProps) {
  return (
    <div className="bg-gray-200/70 rounded-lg p-3 w-80 flex-shrink-0">
      <h3 className="font-bold text-lg mb-4 px-1">{list.name}</h3>
      <div className="space-y-3">
        {list.cards.map((card) => (
          <BoardCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
