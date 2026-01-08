# Character & Location Management Components

A complete set of React components for managing characters and locations in the Claude RPG frontend. Built with TypeScript, Tailwind CSS, and a modern slate/cyan color scheme.

## Components Overview

### 1. Modal (`Modal.tsx`)
A reusable modal wrapper with backdrop, animation, and keyboard support.

**Features:**
- Glassmorphic design with backdrop blur
- ESC key to close
- Click outside to dismiss
- Scale-in animation
- Four size variants: sm, md, lg, xl
- Prevents body scroll when open

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

### 2. CharacterList (`CharacterList.tsx`)
Displays a grid of character cards with images and key info.

**Features:**
- Responsive grid layout (1-3 columns)
- Empty state with visual prompt
- Hover effects and scale animation
- Character image or initial fallback
- "+ Add Character" button

**Props:**
```typescript
interface CharacterListProps {
  characters: Character[];
  onSelectCharacter: (character: Character | null) => void;
}
```

### 3. CharacterEditor (`CharacterEditor.tsx`)
Modal form for creating and editing characters.

**Features:**
- Full character profile editing
- Auto-generate buttons for AI content generation
- Image generation support
- Image preview section
- Save/Cancel/Delete actions
- Form validation
- Loading states for generation

**Props:**
```typescript
interface CharacterEditorProps {
  character: Character | null;  // null = new character
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete?: (id: string) => void;
  onGenerate?: (field: string, currentData: Partial<Character>) => void;
  onGenerateImage?: (character: Partial<Character>) => void;
}
```

**Form Fields:**
- Name (required)
- Role
- Appearance (with auto-generate)
- Background (with auto-generate)
- Motivations (with auto-generate)
- Personality (with auto-generate)
- Knows (with auto-generate)
- Doesn't Know (with auto-generate)

### 4. LocationList (`LocationList.tsx`)
Displays a grid of location cards with images and details.

**Features:**
- Responsive grid layout
- Empty state with map icon
- Location type and district badges
- Hover effects
- "+ Add Location" button

**Props:**
```typescript
interface LocationListProps {
  locations: Location[];
  onSelectLocation: (location: Location | null) => void;
}
```

### 5. LocationEditor (`LocationEditor.tsx`)
Modal form for creating and editing locations.

**Features:**
- Full location details editing
- Auto-generate buttons for descriptions
- Image generation support
- Image preview
- Three-column name/type/district layout
- Save/Cancel/Delete actions

**Props:**
```typescript
interface LocationEditorProps {
  location: Location | null;  // null = new location
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: Location) => void;
  onDelete?: (id: string) => void;
  onGenerate?: (field: string, currentData: Partial<Location>) => void;
  onGenerateImage?: (location: Partial<Location>) => void;
}
```

**Form Fields:**
- Name (required)
- Type
- District
- Description (with auto-generate)
- Atmosphere (with auto-generate)
- Notable Features (with auto-generate)
- NPCs Present (with auto-generate)

## Installation

All components are already in `/frontend/src/components/`. Import them:

```typescript
import {
  CharacterList,
  CharacterEditor,
  LocationList,
  LocationEditor,
  Modal
} from '@/components';
```

## Usage Examples

### Character Management

See `CharacterManagement.example.tsx` for a complete example.

```typescript
import { useState } from 'react';
import { Character } from '@/types/game';
import { CharacterList, CharacterEditor } from '@/components';

function CharacterManagement() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (char: Character | null) => {
    setSelected(char);
    setIsOpen(true);
  };

  const handleSave = (char: Character) => {
    setCharacters(prev => {
      const idx = prev.findIndex(c => c.id === char.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = char;
        return updated;
      }
      return [...prev, char];
    });
  };

  const handleDelete = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  return (
    <>
      <CharacterList
        characters={characters}
        onSelectCharacter={handleSelect}
      />
      <CharacterEditor
        character={selected}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
```

### Location Management

See `LocationManagement.example.tsx` for a complete example.

```typescript
import { useState } from 'react';
import { Location } from '@/types/game';
import { LocationList, LocationEditor } from '@/components';

function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Similar pattern to CharacterManagement...
}
```

### Integrating AI Generation

Connect the generation callbacks to your backend API:

```typescript
const handleGenerateField = async (field: string, data: Partial<Character>) => {
  try {
    const response = await fetch('/api/generate-character-field', {
      method: 'POST',
      body: JSON.stringify({ field, character: data }),
    });
    const result = await response.json();

    // Update the character with generated content
    setSelected(prev => ({
      ...prev!,
      [field]: result.content,
    }));
  } catch (error) {
    console.error('Generation failed:', error);
  }
};

const handleGenerateImage = async (character: Partial<Character>) => {
  try {
    const response = await fetch('/api/generate-character-image', {
      method: 'POST',
      body: JSON.stringify({ character }),
    });
    const result = await response.json();

    setSelected(prev => ({
      ...prev!,
      imageUrl: result.imageUrl,
    }));
  } catch (error) {
    console.error('Image generation failed:', error);
  }
};

<CharacterEditor
  character={selected}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={handleSave}
  onDelete={handleDelete}
  onGenerate={handleGenerateField}
  onGenerateImage={handleGenerateImage}
/>
```

## Styling

All components use the existing theme from `styles/theme.css` and `styles/globals.css`:

- **Colors:** Slate backgrounds, cyan/emerald accents
- **Glass effects:** `.glass` and `.glass-elevated` classes
- **Borders:** `border-cyan-500/30` with 30% opacity
- **Rounded corners:** `rounded-xl` and `rounded-2xl`
- **Shadows:** Custom cyan glow on hover
- **Animations:** Scale-in for modals, smooth transitions throughout

## Accessibility

- All buttons have proper hover/focus states
- Modals trap focus and support ESC key
- Forms include proper labels and validation
- Empty states provide clear guidance
- Color contrast meets WCAG 2.1 AA standards

## TypeScript

All components are fully typed. See `types/game.ts` for complete type definitions:

```typescript
interface Character {
  id: string;
  name: string;
  role?: string;
  appearance?: string;
  background?: string;
  motivations?: string;
  personality?: string;
  knows?: string;
  doesntKnow?: string;
  imageUrl?: string;
}

interface Location {
  id: string;
  name: string;
  type?: string;
  district?: string;
  description?: string;
  atmosphere?: string;
  notableFeatures?: string;
  npcsPresent?: string;
  imageUrl?: string;
}
```

## Design Philosophy

These components follow modern front-end best practices:

1. **Composability:** Small, focused components that work together
2. **Controlled components:** Parent manages all state
3. **Callbacks for side effects:** No internal API calls
4. **Progressive enhancement:** Works without JS generation features
5. **Visual hierarchy:** Clear information architecture
6. **Micro-interactions:** Subtle animations guide user attention
7. **Consistent design language:** Matches existing app theme

## File Structure

```
frontend/src/components/
├── Modal.tsx                           # Reusable modal wrapper
├── CharacterList.tsx                   # Character grid view
├── CharacterEditor.tsx                 # Character form
├── LocationList.tsx                    # Location grid view
├── LocationEditor.tsx                  # Location form
├── CharacterManagement.example.tsx     # Usage example
├── LocationManagement.example.tsx      # Usage example
├── index.ts                            # Barrel exports
└── README.md                           # This file
```

## Future Enhancements

Potential improvements:

- Search/filter functionality in list views
- Bulk operations (delete multiple, export)
- Drag-and-drop reordering
- Tag/category system
- Advanced image cropping/editing
- Relationship mapping between characters
- Location-to-character associations
- Export to PDF or markdown

---

Built with precision and attention to detail for the Claude RPG project.
