#pragma once
#include "httplib.h"
#include "../api/claude_api.h"
#include "../context/context_manager.h"
#include "../parser/response_parser.h"

namespace rpg {

class Routes {
public:
    Routes();

    void handle_message(const httplib::Request& req, httplib::Response& res);
    void handle_get_player(const httplib::Request& req, httplib::Response& res);
    void handle_add_note(const httplib::Request& req, httplib::Response& res);
    void handle_new_campaign(const httplib::Request& req, httplib::Response& res);
    void handle_get_history(const httplib::Request& req, httplib::Response& res);

private:
    ClaudeAPI claude_;
    ContextManager context_;
    ResponseParser parser_;
};

}
