import React, { useEffect, useState } from "react";
import { Star, Loader } from "lucide-react";

const GameCard = ({ game, onClick }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatNumber = (num) => {
    if (!num) return "N/A";
    if (typeof num === 'string') return num;
    return num.toLocaleString();
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white p-4"
    >
      <div className="flex items-start gap-3 mb-4">
        {game.icon_url ? (
          <img
            src={game.icon_url}
            alt={game.name}
            className="w-12 h-12 rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-gray-500">
              {game.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {game.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {game.publisher_name || "Unknown Publisher"}
          </p>
          <p className="text-xs text-gray-400 uppercase">
            {game.os}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rating</span>
          {game.rating ? (
            renderStars(game.rating)
          ) : (
            <span className="text-xs text-gray-400">No rating</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Reviews</span>
          <span className="text-sm font-medium">
            {formatNumber(game.global_rating_count || game.rating_count)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Downloads</span>
          <span className="text-sm font-medium">
            {game.last_month_downloads_string || "N/A"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Revenue</span>
          <span className="text-sm font-medium">
            {game.last_month_revenue_string || "N/A"}
          </span>
        </div>

        {game.description && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 line-clamp-2">
              {game.description.length > 100 
                ? `${game.description.substring(0, 100)}...` 
                : game.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;