#pragma once
#include "httplib.h"
#include "../api/claude_api.h"
#include "../api/gemini_api.h"
#include "../context/context_manager.h"
#include "../parser/response_parser.h"
#include "../parser/markdown_parser.h"

namespace rpg {

class Routes {
public:
    Routes();

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
    ContextManager context_;
    ResponseParser parser_;
    MarkdownParser md_parser_;

    void set_cors_headers(httplib::Response& res);
    std::string build_character_json(const Character& c) const;
    std::string build_location_json(const Location& loc) const;
    Character parse_character_json(std::string_view json) const;
    Location parse_location_json(std::string_view json) const;
};

}
