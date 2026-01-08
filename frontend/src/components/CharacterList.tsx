import React from 'react';
import { Character } from '../types/game';

interface CharacterListProps {
  characters: Character[];
  onAdd: () => void;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
}

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      onDelete(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Characters</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage NPCs and key characters in your world
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Character
        </button>
      </div>

      {/* Character Grid */}
      {characters.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 border-2 border-slate-600/30 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No Characters Yet
          </h3>
          <p className="text-slate-500 mb-6">
            Create your first character to populate your world
          </p>
          <button
            onClick={onAdd}
            className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/30"
          >
            Create Character
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => onEdit(character)}
              className="group glass hover:glass-elevated rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              {/* Image or Initial Badge */}
              <div className="relative mb-3">
                {character.imageUrl ? (
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-900/50">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-600/30">
                    <span className="text-5xl font-bold text-cyan-400">
                      {character.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(e, character.id)}
                  className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                  aria-label="Delete character"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Character Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1 truncate">
                  {character.name}
                </h3>
                {character.role && (
                  <p className="text-sm text-cyan-400 font-medium mb-2 truncate">
                    {character.role}
                  </p>
                )}
                {character.appearance && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {character.appearance}
                  </p>
                )}
              </div>

              {/* Hover Indicator */}
              <div className="mt-3 pt-3 border-t border-slate-600/30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-slate-500">Click to edit</span>
                <svg
                  className="w-4 h-4 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
