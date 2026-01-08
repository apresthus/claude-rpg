#include "routes.h"
#include "../util/json.h"

namespace rpg {

Routes::Routes() : context_("campaigns/active") {}

void Routes::handle_message(const httplib::Request& req, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Content-Type", "application/json");

    auto message = json::extract_string(req.body, "message");
    if (message.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing message"})", "application/json");
        return;
    }

    std::string system_prompt = context_.get_system_prompt();
    std::string context = context_.build_full_context();
    std::string full_prompt = system_prompt + "\n\n" + context + "\n\nPlayer says: " + std::string(message);

    auto response = claude_.send_message(system_prompt, full_prompt);

    if (!response.success) {
        res.status = 500;
        json::JsonBuilder err;
        err.begin_object();
        err.kv_string("error", response.error);
        err.end_object();
        res.set_content(err.str(), "application/json");
        return;
    }

    std::string narrative = parser_.extract_narrative(response.content);
    auto updates = parser_.extract_updates(response.content);
    context_.apply_updates(updates);
    context_.append_history(std::string(message), narrative);

    json::JsonBuilder result;
    result.begin_object();
    result.kv_string("narrative", narrative);
    result.key("playerState");
    result.value_raw(R"({"updated":true})");
    result.end_object();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_get_player(const httplib::Request&, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Content-Type", "application/json");

    std::string player_md = context_.get_player_state();

    json::JsonBuilder result;
    result.begin_object();
    result.kv_string("content", player_md);
    result.end_object();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_add_note(const httplib::Request& req, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Content-Type", "application/json");

    auto note = json::extract_string(req.body, "note");
    if (note.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing note"})", "application/json");
        return;
    }

    // Add note to player.md via context update
    std::vector<ContextUpdate> updates;
    updates.push_back({"player.md", "\n- " + std::string(note)});
    context_.apply_updates(updates);

    res.set_content(R"({"success":true})", "application/json");
}

void Routes::handle_new_campaign(const httplib::Request& req, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Content-Type", "application/json");

    // campaignName is reserved for future multi-campaign support
    (void)json::extract_string(req.body, "campaignName");
    auto player_name = json::extract_string(req.body, "playerName");
    auto player_class = json::extract_string(req.body, "playerClass");

    context_.init_new_campaign(std::string(player_name), std::string(player_class));

    res.set_content(R"({"success":true})", "application/json");
}

void Routes::handle_get_history(const httplib::Request&, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Content-Type", "application/json");

    std::string history = context_.get_history();
    if (history.empty()) history = "[]";

    res.set_content(history, "application/json");
}

}
