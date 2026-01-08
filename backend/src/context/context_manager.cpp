#include "context_manager.h"
#include "../util/file_utils.h"
#include "../util/json.h"
#include <sys/stat.h>
#include <cstring>
#include <ctime>
#include <fstream>

namespace rpg {

void ContextManager::create_dirs(const std::string& path) {
    std::string tmp = path;
    for (size_t i = 1; i < tmp.size(); ++i) {
        if (tmp[i] == '/') {
            tmp[i] = '\0';
            mkdir(tmp.c_str(), 0755);
            tmp[i] = '/';
        }
    }
    mkdir(tmp.c_str(), 0755);
}

ContextManager::ContextManager(const std::string& campaign_dir)
    : campaign_dir_(campaign_dir) {
    create_dirs(campaign_dir_);
}

std::string ContextManager::build_full_context() const {
    std::string ctx;
    ctx.reserve(32768);

    ctx += "=== PLOT STATE (SECRET) ===\n";
    ctx += file::read_file(plot_path());

    ctx += "\n\n=== CHARACTERS ===\n";
    ctx += file::read_file(characters_path());

    ctx += "\n\n=== LOCATIONS ===\n";
    ctx += file::read_file(locations_path());

    ctx += "\n\n=== WORLD & NPC KNOWLEDGE ===\n";
    ctx += file::read_file(context_path());

    ctx += "\n\n=== PLAYER STATE (VISIBLE TO PLAYER) ===\n";
    ctx += file::read_file(player_path());

    // Note if player has an image
    if (image_exists("player", "avatar")) {
        ctx += "\n[Note: The player character has a visual appearance as described in their profile. ";
        ctx += "NPCs should react appropriately to their appearance.]\n";
    }

    return ctx;
}

std::string ContextManager::get_player_state() const {
    return file::read_file(player_path());
}

std::string ContextManager::get_system_prompt() const {
    return file::read_file("backend/prompts/system_prompt.md");
}

void ContextManager::apply_updates(const std::vector<ContextUpdate>& updates) {
    for (const auto& update : updates) {
        std::string path;
        if (update.filename == "plot.md") path = plot_path();
        else if (update.filename == "context.md") path = context_path();
        else if (update.filename == "player.md") path = player_path();
        else if (update.filename == "characters.md") path = characters_path();
        else if (update.filename == "locations.md") path = locations_path();
        else continue;

        // For now, append the update content
        std::string current = file::read_file(path);
        current += "\n" + update.content;
        file::write_file(path, current);
    }
}

std::string ContextManager::get_metadata() const {
    return file::read_file(metadata_path());
}

void ContextManager::save_metadata(const std::string& json_content) {
    file::write_file(metadata_path(), json_content);
}

void ContextManager::update_last_played() {
    std::string meta = get_metadata();
    if (meta.empty()) return;

    // Get current ISO timestamp
    auto now = std::time(nullptr);
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&now));
    std::string timestamp(buf);

    // Find and replace lastPlayed value
    size_t pos = meta.find("\"lastPlayed\"");
    if (pos != std::string::npos) {
        size_t colon = meta.find(':', pos);
        size_t quote1 = meta.find('"', colon);
        size_t quote2 = meta.find('"', quote1 + 1);
        if (quote1 != std::string::npos && quote2 != std::string::npos) {
            meta.replace(quote1 + 1, quote2 - quote1 - 1, timestamp);
            save_metadata(meta);
        }
    }
}

void ContextManager::init_new_campaign(const std::string& roleplay_name,
                                        const std::string& player_name,
                                        const std::string& player_role) {
    // Create images directories
    create_dirs(images_dir() + "/characters");
    create_dirs(images_dir() + "/locations");
    create_dirs(images_dir() + "/player");

    // Initialize plot.md
    std::string plot = R"(# Current Arc
The story begins...

# Planted Seeds
(None yet)

# Future Twists
(To be developed)

# Completed Arcs
(None yet)
)";
    file::write_file(plot_path(), plot);

    // Initialize context.md
    std::string context = R"(# NPCs
(No NPCs encountered yet)

# World State
- Time: Day 1, Morning
- Location: Starting area
- Weather: Clear
)";
    file::write_file(context_path(), context);

    // Initialize player.md with enhanced format
    std::string player = "# Character\nName: " + player_name + "\nRole: " + player_role + R"(

# Appearance
(Not yet described)

# Background
(Not yet written)

# Personality
(Not yet defined)

# Goals
(Not yet set)

# Skills
(Not yet defined)

# Inventory
- Basic supplies

# Quest Log
(No quests yet)

# Notes
(No notes yet)

# Relationships
(No relationships yet)
)";
    file::write_file(player_path(), player);

    // Initialize characters.md
    std::string characters = R"(# Characters

(No characters created yet)
)";
    file::write_file(characters_path(), characters);

    // Initialize locations.md
    std::string locations = R"(# Locations

(No locations created yet)
)";
    file::write_file(locations_path(), locations);

    // Initialize empty history
    file::write_file(history_path(), "[]");

    // Initialize metadata.json
    auto now = std::time(nullptr);
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&now));
    std::string timestamp(buf);

    json::JsonBuilder meta;
    meta.begin_object();
    meta.kv_string("name", roleplay_name);
    meta.kv_string("playerName", player_name);
    meta.kv_string("playerRole", player_role);
    meta.kv_string("created", timestamp);
    meta.kv_string("lastPlayed", timestamp);
    meta.end_object();
    file::write_file(metadata_path(), meta.str());
}

void ContextManager::append_history(const std::string& player_input,
                                     const std::string& gm_response) {
    std::string history = file::read_file(history_path());
    if (history.empty()) history = "[]";

    // Simple JSON array append
    json::JsonBuilder entry;
    entry.begin_object();
    entry.kv_string("player", player_input);
    entry.kv_string("gm", gm_response);
    entry.end_object();

    // Insert before closing bracket
    if (history.size() > 2) {
        history.insert(history.size() - 1, "," + entry.str());
    } else {
        history.insert(history.size() - 1, entry.str());
    }

    file::write_file(history_path(), history);
}

std::string ContextManager::get_history() const {
    return file::read_file(history_path());
}

std::string ContextManager::get_characters() const {
    return file::read_file(characters_path());
}

void ContextManager::save_characters(const std::string& content) {
    file::write_file(characters_path(), content);
}

std::string ContextManager::get_locations() const {
    return file::read_file(locations_path());
}

void ContextManager::save_locations(const std::string& content) {
    file::write_file(locations_path(), content);
}

void ContextManager::save_player_state(const std::string& content) {
    file::write_file(player_path(), content);
}

bool ContextManager::save_image(const std::string& category, const std::string& id,
                                 const std::string& base64_data, const std::string& mime_type) {
    // Determine file extension from mime type
    std::string ext = ".png";
    if (mime_type.find("jpeg") != std::string::npos ||
        mime_type.find("jpg") != std::string::npos) {
        ext = ".jpg";
    } else if (mime_type.find("webp") != std::string::npos) {
        ext = ".webp";
    }

    std::string dir = images_dir() + "/" + category;
    create_dirs(dir);
    std::string path = dir + "/" + id + ext;

    // Decode base64 and write binary file
    // Simple base64 decode
    static const std::string b64_chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    std::string decoded;
    decoded.reserve(base64_data.size() * 3 / 4);

    int val = 0, valb = -8;
    for (char c : base64_data) {
        if (c == '=' || c == '\n' || c == '\r') continue;
        size_t pos = b64_chars.find(c);
        if (pos == std::string::npos) continue;
        val = (val << 6) + static_cast<int>(pos);
        valb += 6;
        if (valb >= 0) {
            decoded.push_back(static_cast<char>((val >> valb) & 0xFF));
            valb -= 8;
        }
    }

    std::ofstream out(path, std::ios::binary);
    if (!out) return false;
    out.write(decoded.data(), static_cast<std::streamsize>(decoded.size()));
    return out.good();
}

std::string ContextManager::get_image_path(const std::string& category, const std::string& id) const {
    // Check for different extensions
    std::vector<std::string> exts = {".png", ".jpg", ".webp"};
    for (const auto& ext : exts) {
        std::string path = images_dir() + "/" + category + "/" + id + ext;
        struct stat st;
        if (stat(path.c_str(), &st) == 0) {
            return path;
        }
    }
    return "";
}

bool ContextManager::image_exists(const std::string& category, const std::string& id) const {
    return !get_image_path(category, id).empty();
}

}
