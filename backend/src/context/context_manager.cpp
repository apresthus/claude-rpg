#include "context_manager.h"
#include "../util/file_utils.h"
#include "../util/json.h"
#include <sys/stat.h>
#include <cstring>

namespace rpg {

namespace {
    void create_dirs(const std::string& path) {
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
}

ContextManager::ContextManager(const std::string& campaign_dir)
    : campaign_dir_(campaign_dir) {
    create_dirs(campaign_dir_);
}

std::string ContextManager::build_full_context() const {
    std::string ctx;
    ctx.reserve(16384);

    ctx += "=== PLOT STATE (SECRET) ===\n";
    ctx += file::read_file(plot_path());
    ctx += "\n\n=== WORLD & NPC KNOWLEDGE ===\n";
    ctx += file::read_file(context_path());
    ctx += "\n\n=== PLAYER STATE (VISIBLE TO PLAYER) ===\n";
    ctx += file::read_file(player_path());

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
        else continue;

        // For now, append the update content
        std::string current = file::read_file(path);
        current += "\n" + update.content;
        file::write_file(path, current);
    }
}

void ContextManager::init_new_campaign(const std::string& player_name,
                                        const std::string& player_class) {
    // Initialize plot.md
    std::string plot = R"(# Current Arc
The adventure begins...

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

    // Initialize player.md
    std::string player = "# Character\nName: " + player_name + "\nClass: " + player_class + R"(

# Inventory
- Basic supplies

# Quest Log
(No quests yet)

# Notes
(No notes yet)
)";
    file::write_file(player_path(), player);

    // Initialize empty history
    file::write_file(history_path(), "[]");
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

}
