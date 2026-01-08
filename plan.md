# Claude RPG Framework - Implementation Plan

## Overview
A C++ backend with React web frontend that enables immersive roleplay with Claude. The system maintains persistent context files that track plot developments, character knowledge, and player state. The key innovation is that Claude can generate and reference "secret" plot information that creates genuine surprises for the player.

**Stack:**
- Backend: C++ with cpp-httplib (embedded HTTP server) + libcurl (Claude API)
- Frontend: React with vibrant/colorful modern gaming UI
- Persistence: Markdown files for human-readable game state
- Single binary serves both API and static frontend files

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (Vite)                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  Chat Panel    │  │  Side Panel    │  │   Top Bar      │    │
│  │  - Messages    │  │  - Inventory   │  │   - Campaign   │    │
│  │  - Input       │  │  - Quest Log   │  │   - Settings   │    │
│  │  - Typing ind. │  │  - Character   │  │   - New Game   │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   C++ Backend (cpp-httplib)                      │
│                                                                  │
│  Endpoints:                                                      │
│  POST /api/message     - Send player input, get narrative       │
│  GET  /api/player      - Get player.md contents                 │
│  POST /api/player/note - Add player note                        │
│  POST /api/campaign/new - Start new campaign                    │
│  GET  /api/history     - Get conversation history               │
│  GET  /static/*        - Serve React build files                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ HTTP Server  │  │ Context Mgr  │  │ Claude API   │          │
│  │ (cpp-httplib)│  │              │  │ (libcurl)    │          │
│  └──────────────┘  └──────┬───────┘  └──────────────┘          │
└──────────────────────────────┼──────────────────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
         ┌──────────┐   ┌──────────┐   ┌──────────┐
         │ plot.md  │   │context.md│   │player.md │
         │ (SECRET) │   │(chars)   │   │(visible) │
         └──────────┘   └──────────┘   └──────────┘
```

## Project Structure

```
claude-rpg/
├── backend/
│   ├── src/
│   │   ├── main.cpp              # Entry point, HTTP server setup
│   │   ├── api/
│   │   │   ├── claude_api.h      # Claude API wrapper
│   │   │   └── claude_api.cpp    # libcurl HTTP calls
│   │   ├── server/
│   │   │   ├── routes.h          # Route handlers
│   │   │   └── routes.cpp        # REST endpoint implementations
│   │   ├── context/
│   │   │   ├── context_manager.h # Context file management
│   │   │   └── context_manager.cpp
│   │   ├── parser/
│   │   │   ├── response_parser.h # Parse Claude responses
│   │   │   └── response_parser.cpp
│   │   └── util/
│   │       ├── json.h            # Simple JSON helpers
│   │       └── file_utils.h
│   ├── lib/
│   │   └── httplib.h             # cpp-httplib (header-only)
│   ├── prompts/
│   │   └── system_prompt.md      # GM instructions for Claude
│   └── Makefile
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx     # Main narrative/chat area
│   │   │   ├── MessageBubble.tsx # Individual message display
│   │   │   ├── InputBar.tsx      # Player input with send button
│   │   │   ├── SidePanel.tsx     # Inventory/quests/character
│   │   │   ├── InventoryView.tsx # Item grid with icons
│   │   │   ├── QuestLog.tsx      # Quest list with checkboxes
│   │   │   └── TopBar.tsx        # Campaign controls
│   │   ├── hooks/
│   │   │   ├── useGameState.ts   # Game state management
│   │   │   └── useApi.ts         # API call hooks
│   │   ├── styles/
│   │   │   ├── globals.css       # Global styles, CSS variables
│   │   │   └── theme.css         # Color palette, gradients
│   │   └── types/
│   │       └── game.ts           # TypeScript interfaces
│   ├── public/
│   │   └── favicon.ico
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── campaigns/
│   └── active/
│       ├── plot.md               # Secret storylines
│       ├── context.md            # Character knowledge
│       ├── player.md             # Player state
│       └── history.json          # Conversation history
│
└── Readme.md
```

## Frontend Design (Vibrant/Colorful Gaming Aesthetic)

### Color Palette
```css
:root {
  /* Primary gradient - purple to blue */
  --primary-start: #7c3aed;
  --primary-end: #2563eb;

  /* Accent colors */
  --accent-gold: #fbbf24;
  --accent-emerald: #10b981;
  --accent-rose: #f43f5e;
  --accent-cyan: #06b6d4;

  /* Backgrounds */
  --bg-dark: #0f0f1a;
  --bg-card: #1a1a2e;
  --bg-elevated: #252540;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
}
```

### UI Components

**Chat Panel** (center, 60% width)
- Dark glass-morphism background with subtle gradient border
- Messages appear with smooth slide-in animation
- GM messages have purple gradient accent on left edge
- Player messages right-aligned with blue gradient
- Typewriter effect for incoming narrative
- Glowing input field with gradient focus ring

**Side Panel** (right, 35% width, collapsible)
- Tabbed interface: Inventory | Quests | Character
- **Inventory**: Grid of item cards with colorful icons, hover effects
- **Quests**: Checklist with animated completion states
- **Character**: Stats, name, class with editable fields
- Glassmorphism cards with gradient borders

**Top Bar**
- Campaign name with edit button
- "New Campaign" button with sparkle animation
- Settings gear icon
- Gradient accent line below

### Visual Effects
- Subtle particle background (floating motes of light)
- Smooth transitions on all interactive elements
- Glow effects on buttons and interactive elements
- Success/failure toast notifications with icons

## Backend Components

### 1. HTTP Server (`main.cpp`)
```cpp
#include "httplib.h"

int main() {
    httplib::Server svr;

    // Serve React build
    svr.set_mount_point("/", "./frontend/dist");

    // API routes
    svr.Post("/api/message", handle_message);
    svr.Get("/api/player", handle_get_player);
    svr.Post("/api/player/note", handle_add_note);
    svr.Post("/api/campaign/new", handle_new_campaign);
    svr.Get("/api/history", handle_get_history);

    printf("Server running at http://localhost:8080\n");
    svr.listen("0.0.0.0", 8080);

    return 0;
}
```

### 2. Route Handlers (`routes.cpp`)
```cpp
void handle_message(const Request& req, Response& res) {
    // Parse JSON body
    auto player_input = parse_json(req.body)["message"];

    // Load context files
    auto context = context_manager.build_full_context();

    // Call Claude API
    auto response = claude_api.send_message(context, player_input);

    // Parse response
    auto narrative = parser.extract_narrative(response);
    auto updates = parser.extract_updates(response);

    // Apply updates to context files
    context_manager.apply_updates(updates);

    // Save to history
    history_manager.append(player_input, narrative);

    // Return narrative + updated player state
    res.set_content(json_response(narrative, player_state), "application/json");
}
```

### 3. Claude API Wrapper (`claude_api.cpp`)
```cpp
struct ClaudeResponse {
    std::string content;
    int input_tokens;
    int output_tokens;
};

ClaudeResponse send_message(const std::string& system_prompt,
                            const std::string& context,
                            const std::string& user_input) {
    // Build JSON payload
    // POST to https://api.anthropic.com/v1/messages
    // Parse response
}
```

### 4. Context Files Format

**plot.md** (SECRET - never sent to frontend)
```markdown
# Current Arc
The merchant guild is secretly controlled by a vampire lord...

# Planted Seeds
- The innkeeper mentioned a "pale stranger" - foreshadowing
- Player accepted a quest that will lead them to the vampire's lair

# Future Twists
- If player investigates missing shipments → reveal vampire connection
- The town guard captain is a thrall (reveal when player confronts him)

# Completed Arcs
## The Missing Daughter
Player found her in the abandoned mine. She was being held by goblins.
```

**context.md** (Character knowledge tracking)
```markdown
# NPCs

## Elara (Innkeeper)
- Knows: Local gossip, rumors of pale stranger, player helped with rats
- Doesn't know: Vampire conspiracy, player's true identity
- Disposition: Friendly (+2 from rat quest)

## Captain Varen
- Knows: Is secretly a thrall, player is investigating
- Doesn't know: Player suspects him
- Disposition: Neutral (watching carefully)

# World State
- Time: Day 3, Evening
- Location: Thornwood Village
- Weather: Overcast
```

**player.md** (Sent to frontend)
```markdown
# Character
Name: Aldric
Class: Ranger

# Inventory
- Rusty shortsword
- 15 gold coins
- Letter from merchant guild
- Mysterious key (from innkeeper)

# Quest Log
- [ ] Investigate missing shipments
- [x] Clear rats from Elara's cellar

# Notes
- The innkeeper seemed nervous when I mentioned the shipments
```

### 5. Response Parser
Claude's structured response format:
```
[NARRATIVE]
The innkeeper's eyes dart nervously to the door...
[/NARRATIVE]

[UPDATE:plot.md]
Add to "Planted Seeds":
- Innkeeper knows more than she's letting on
[/UPDATE]

[UPDATE:player.md]
Add to Inventory:
- Mysterious key (from innkeeper)
[/UPDATE]
```

## System Prompt (prompts/system_prompt.md)

```markdown
You are the Game Master for an immersive fantasy RPG. You have access to three context files that persist between messages.

## Your Context Files
1. **plot.md** - SECRET storylines, NPC secrets, planned twists. NEVER reveal this to the player directly. Use this to plan surprises.
2. **context.md** - Character knowledge boundaries. Each NPC has "Knows" and "Doesn't know" sections. NPCs must ONLY act on what they know.
3. **player.md** - Player's character sheet, inventory, quest log, notes. This IS visible to the player.

## Response Format
ALWAYS structure your response EXACTLY like this:

[NARRATIVE]
Your story text here - descriptive, immersive, engaging.
[/NARRATIVE]

[UPDATE:plot.md]
Only if plot state changed - add new seeds, advance arcs, etc.
[/UPDATE]

[UPDATE:context.md]
Only if NPC knowledge or world state changed.
[/UPDATE]

[UPDATE:player.md]
Only if inventory, quests, or notes changed.
[/UPDATE]

## Critical Rules
1. NPCs are NOT omniscient - always check their "Knows" section before writing dialogue
2. Plant seeds in plot.md that you'll reveal later - create genuine surprises
3. When player says "#note: something", add it to player.md Notes section
4. Track all inventory changes - items gained, lost, used
5. Mark quests complete with [x] when resolved
6. Write vivid, atmospheric narrative - this is the player's experience
7. Never mention the context files or your role as GM in the narrative
```

## Implementation Strategy: Custom Agents

This project will leverage two custom agents defined in `.claude/agents/`:

### `dod-performance-architect` (Opus model)
Used for all C++ backend work:
- Design cache-efficient data structures for context management
- Implement the Claude API wrapper with optimal memory handling
- Design the response parser with minimal allocations
- Ensure the HTTP server handles requests efficiently
- Review all backend code for DOD compliance

### `frontend-design-engineer` (Sonnet model)
Used for all React frontend work:
- Design the vibrant/colorful gaming UI with Dribbble-quality visuals
- Implement the chat interface with typewriter effects
- Create the side panel with inventory grid and quest log
- Build smooth animations and micro-interactions
- Ensure responsive design and accessibility

## Implementation Order

**Phase 1: Backend (via dod-performance-architect agent)**
1. Project structure setup, Makefile, cpp-httplib integration
2. Claude API wrapper with cache-friendly data structures
3. Context manager - efficient file I/O and markdown parsing
4. Response parser - zero-copy string handling where possible
5. REST endpoint handlers
6. System prompt creation

**Phase 2: Frontend (via frontend-design-engineer agent)**
1. Vite + React + TypeScript + Tailwind setup
2. Global styles, color palette, CSS variables
3. ChatPanel with message history and typewriter effect
4. InputBar with glowing focus states
5. SidePanel with tabbed interface
6. InventoryView, QuestLog, Character components
7. TopBar with campaign controls
8. Animations, loading states, particle background

**Phase 3: Integration & Polish**
1. Wire frontend to backend API
2. Test full gameplay loop
3. Error handling and edge cases
4. Final visual polish

## Dependencies

**Backend:**
- cpp-httplib (header-only, include directly)
- libcurl (system library)

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS (for utility classes)

## Build & Run

```bash
# Build backend
cd backend && make

# Build frontend
cd frontend && npm install && npm run build

# Run (serves both API and frontend)
./backend/rpg
# Open http://localhost:8080
```

## Verification
1. Build both backend and frontend
2. Start server, open browser to localhost:8080
3. Start new campaign - verify context files created
4. Send a few messages - verify narrative appears with styling
5. Check side panel updates with inventory/quests
6. Restart server - verify history persists
7. Inspect plot.md - verify secrets are being generated (not visible in UI)
