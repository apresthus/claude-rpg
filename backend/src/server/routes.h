#pragma once
#include "httplib.h"
#include "../api/claude_api.h"
#include "../api/gemini_api.h"
#include "../context/context_manager.h"
#include "../parser/response_parser.h"
#include "../parser/markdown_parser.h"
#include <memory>

namespace rpg {

struct RoleplayInfo {
    std::string id;
    std::string name;
    std::string playerName;
    std::string playerRole;
    std::string created;
    std::string lastPlayed;
};

class Routes {
public:
    Routes();

    // Roleplay management
    void handle_get_roleplays(const httplib::Request& req, httplib::Response& res);
    void handle_create_roleplay(const httplib::Request& req, httplib::Response& res);
    void handle_load_roleplay(const httplib::Request& req, httplib::Response& res);
    void handle_delete_roleplay(const httplib::Request& req, httplib::Response& res);
    void handle_get_current_roleplay(const httplib::Request& req, httplib::Response& res);

    // Game messaging
    void handle_message(const httplib::Request& req, httplib::Response& res);
    void handle_get_history(const httplib::Request& req, httplib::Response& res);

    // Player
    void handle_get_player(const httplib::Request& req, httplib::Response& res);
    void handle_update_player(const httplib::Request& req, httplib::Response& res);
    void handle_add_note(const httplib::Request& req, httplib::Response& res);
    void handle_player_image(const httplib::Request& req, httplib::Response& res);

    // Campaign
    void handle_new_campaign(const httplib::Request& req, httplib::Response& res);

    // Characters CRUD
    void handle_get_characters(const httplib::Request& req, httplib::Response& res);
    void handle_get_character(const httplib::Request& req, httplib::Response& res);
    void handle_create_character(const httplib::Request& req, httplib::Response& res);
    void handle_update_character(const httplib::Request& req, httplib::Response& res);
    void handle_delete_character(const httplib::Request& req, httplib::Response& res);

    // Locations CRUD
    void handle_get_locations(const httplib::Request& req, httplib::Response& res);
    void handle_get_location(const httplib::Request& req, httplib::Response& res);
    void handle_create_location(const httplib::Request& req, httplib::Response& res);
    void handle_update_location(const httplib::Request& req, httplib::Response& res);
    void handle_delete_location(const httplib::Request& req, httplib::Response& res);

    // AI Generation
    void handle_generate_character(const httplib::Request& req, httplib::Response& res);
    void handle_generate_location(const httplib::Request& req, httplib::Response& res);
    void handle_generate_image(const httplib::Request& req, httplib::Response& res);

    // Image serving
    void handle_get_image(const httplib::Request& req, httplib::Response& res);

private:
    ClaudeAPI claude_;
    GeminiAPI gemini_;
    std::unique_ptr<ContextManager> context_;
    ResponseParser parser_;
    MarkdownParser md_parser_;

    std::string current_roleplay_id_;
    static constexpr const char* CAMPAIGNS_DIR = "campaigns";
    static constexpr const char* INDEX_FILE = "campaigns/roleplays.json";

    void set_cors_headers(httplib::Response& res);
    std::string build_character_json(const Character& c) const;
    std::string build_location_json(const Location& loc) const;
    Character parse_character_json(std::string_view json) const;
    Location parse_location_json(std::string_view json) const;

    // Roleplay helpers
    std::string generate_roleplay_id();
    std::string roleplay_dir(const std::string& id) const;
    void load_roleplay(const std::string& id);
    void save_roleplays_index(const std::vector<RoleplayInfo>& roleplays);
    std::vector<RoleplayInfo> read_roleplays_index();
    RoleplayInfo read_roleplay_metadata(const std::string& id);
    std::string build_roleplay_json(const RoleplayInfo& info) const;
};

}
