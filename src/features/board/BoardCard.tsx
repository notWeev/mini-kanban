import type { Card } from "../../types";

const priorityClasses: Record<Card["priority"], string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

interface BoardCardProps {
  card: Card;
}

export function BoardCard({ card }: BoardCardProps) {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800">{card.title}</h4>
        <span
          className={`px-2 py-1 text-xs font-bold rounded-full ${
            priorityClasses[card.priority]
          }`}
        >
          {card.priority}
        </span>
      </div>
      {card.description && (
        <p className="text-sm text-gray-600">{card.description}</p>
      )}
    </div>
  );
}
