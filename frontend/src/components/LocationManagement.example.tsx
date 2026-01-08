/**
 * Example usage of Location Management Components
 *
 * This file demonstrates how to integrate the LocationList and LocationEditor
 * components into your application.
 */

import React, { useState } from 'react';
import { Location } from '../types/game';
import { LocationList } from './LocationList';
import { LocationEditor } from './LocationEditor';

export const LocationManagementExample: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle adding a new location
  const handleAddLocation = () => {
    setSelectedLocation(undefined);
    setIsEditorOpen(true);
  };

  // Handle editing an existing location
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditorOpen(true);
  };

  // Handle saving location (create or update)
  const handleSaveLocation = (locationData: Partial<Location>) => {
    setLocations((prev) => {
      if (selectedLocation) {
        // Update existing
        const updated = prev.map((l) =>
          l.id === selectedLocation.id ? { ...l, ...locationData } : l
        );
        return updated;
      } else {
        // Add new
        const newLocation: Location = {
          id: `loc-${Date.now()}`,
          name: locationData.name || '',
          type: locationData.type,
          district: locationData.district,
          description: locationData.description,
          atmosphere: locationData.atmosphere,
          notableFeatures: locationData.notableFeatures,
          npcsPresent: locationData.npcsPresent,
          imageUrl: locationData.imageUrl,
        };
        return [...prev, newLocation];
      }
    });
    setIsEditorOpen(false);
    setSelectedLocation(undefined);
  };

  // Handle deleting location
  const handleDeleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // Handle field generation (connect to your API)
  const handleGenerateField = async (
    field: string,
    name: string,
    existingData: Partial<Location>
  ) => {
    setIsLoading(true);
    console.log('Generate field:', field, 'for location:', name, existingData);

    // TODO: Call your backend API to generate content
    // Example:
    // try {
    //   const response = await api.generateLocationField({
    //     field,
    //     name,
    //     existingData
    //   });
    //   setSelectedLocation(prev => prev ? { ...prev, [field]: response.content } : prev);
    // } catch (error) {
    //   console.error('Failed to generate field:', error);
    // } finally {
    //   setIsLoading(false);
    // }

    setIsLoading(false);
  };

  // Handle image generation (connect to your API)
  const handleGenerateImage = async (name: string, description: string) => {
    setIsLoading(true);
    console.log('Generate image for:', name, 'with description:', description);

    // TODO: Call your backend API to generate image
    // Example:
    // try {
    //   const response = await api.generateLocationImage({
    //     name,
    //     description
    //   });
    //   setSelectedLocation(prev => prev ? { ...prev, imageUrl: response.imageUrl } : prev);
    // } catch (error) {
    //   console.error('Failed to generate image:', error);
    // } finally {
    //   setIsLoading(false);
    // }

    setIsLoading(false);
  };

  return (
    <div className="h-screen p-8 bg-bg-dark">
      <LocationList
        locations={locations}
        onAdd={handleAddLocation}
        onEdit={handleEditLocation}
        onDelete={handleDeleteLocation}
      />

      <LocationEditor
        location={selectedLocation}
        isOpen={isEditorOpen}
        onCancel={() => {
          setIsEditorOpen(false);
          setSelectedLocation(undefined);
        }}
        onSave={handleSaveLocation}
        onGenerate={handleGenerateField}
        onGenerateImage={handleGenerateImage}
        isLoading={isLoading}
      />
    </div>
  );
};
