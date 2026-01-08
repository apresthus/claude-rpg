/**
 * Example usage of Character Management Components
 *
 * This file demonstrates how to integrate the CharacterList and CharacterEditor
 * components into your application.
 */

import React, { useState } from 'react';
import { Character } from '../types/game';
import { CharacterList } from './CharacterList';
import { CharacterEditor } from './CharacterEditor';

export const CharacterManagementExample: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle adding a new character
  const handleAddCharacter = () => {
    setSelectedCharacter(undefined);
    setIsEditorOpen(true);
  };

  // Handle editing an existing character
  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsEditorOpen(true);
  };

  // Handle saving character (create or update)
  const handleSaveCharacter = (characterData: Partial<Character>) => {
    setCharacters((prev) => {
      if (selectedCharacter) {
        // Update existing
        const updated = prev.map((c) =>
          c.id === selectedCharacter.id ? { ...c, ...characterData } : c
        );
        return updated;
      } else {
        // Add new
        const newCharacter: Character = {
          id: `char-${Date.now()}`,
          name: characterData.name || '',
          role: characterData.role,
          appearance: characterData.appearance,
          background: characterData.background,
          motivations: characterData.motivations,
          personality: characterData.personality,
          knows: characterData.knows,
          doesntKnow: characterData.doesntKnow,
          imageUrl: characterData.imageUrl,
        };
        return [...prev, newCharacter];
      }
    });
    setIsEditorOpen(false);
    setSelectedCharacter(undefined);
  };

  // Handle deleting character
  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  // Handle field generation (connect to your API)
  const handleGenerateField = async (
    field: string,
    name: string,
    existingData: Partial<Character>
  ) => {
    setIsLoading(true);
    console.log('Generate field:', field, 'for character:', name, existingData);

    // TODO: Call your backend API to generate content
    // Example:
    // try {
    //   const response = await api.generateCharacterField({
    //     field,
    //     name,
    //     existingData
    //   });
    //   setSelectedCharacter(prev => prev ? { ...prev, [field]: response.content } : prev);
    // } catch (error) {
    //   console.error('Failed to generate field:', error);
    // } finally {
    //   setIsLoading(false);
    // }

    setIsLoading(false);
  };

  // Handle image generation (connect to your API)
  const handleGenerateImage = async (name: string, appearance: string) => {
    setIsLoading(true);
    console.log('Generate image for:', name, 'with appearance:', appearance);

    // TODO: Call your backend API to generate image
    // Example:
    // try {
    //   const response = await api.generateCharacterImage({
    //     name,
    //     appearance
    //   });
    //   setSelectedCharacter(prev => prev ? { ...prev, imageUrl: response.imageUrl } : prev);
    // } catch (error) {
    //   console.error('Failed to generate image:', error);
    // } finally {
    //   setIsLoading(false);
    // }

    setIsLoading(false);
  };

  return (
    <div className="h-screen p-8 bg-bg-dark">
      <CharacterList
        characters={characters}
        onAdd={handleAddCharacter}
        onEdit={handleEditCharacter}
        onDelete={handleDeleteCharacter}
      />

      <CharacterEditor
        character={selectedCharacter}
        isOpen={isEditorOpen}
        onCancel={() => {
          setIsEditorOpen(false);
          setSelectedCharacter(undefined);
        }}
        onSave={handleSaveCharacter}
        onGenerate={handleGenerateField}
        onGenerateImage={handleGenerateImage}
        isLoading={isLoading}
      />
    </div>
  );
};
