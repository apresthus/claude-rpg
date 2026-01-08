#include "routes.h"
#include "../util/json.h"
#include "../util/file_utils.h"
#include <fstream>
#include <algorithm>

namespace rpg {

Routes::Routes() : context_("campaigns/active") {}

void Routes::set_cors_headers(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Content-Type", "application/json");
}

std::string Routes::build_character_json(const Character& c) const {
    json::JsonBuilder j;
    j.begin_object();
    j.kv_string("id", c.id);
    j.kv_string("name", c.name);
    j.kv_string("role", c.role);
    j.kv_string("firstEncountered", c.first_encountered);
    j.kv_string("appearance", c.appearance);
    j.kv_string("background", c.background);
    j.kv_string("motivations", c.motivations);
    j.kv_string("personality", c.personality);
    j.kv_string("knows", c.knows);
    j.kv_string("doesntKnow", c.doesnt_know);
    j.kv_string("imagePath", c.image_path);
    // Add image URL if exists
    std::string img_path = context_.get_image_path("characters", c.id);
    if (!img_path.empty()) {
        j.kv_string("imageUrl", "/api/images/characters/" + c.id);
    }
    j.end_object();
    return j.str();
}

std::string Routes::build_location_json(const Location& loc) const {
    json::JsonBuilder j;
    j.begin_object();
    j.kv_string("id", loc.id);
    j.kv_string("name", loc.name);
    j.kv_string("type", loc.type);
    j.kv_string("district", loc.district);
    j.kv_string("description", loc.description);
    j.kv_string("atmosphere", loc.atmosphere);
    j.kv_string("notableFeatures", loc.notable_features);
    j.kv_string("npcsPresent", loc.npcs_present);
    j.kv_string("imagePath", loc.image_path);
    std::string img_path = context_.get_image_path("locations", loc.id);
    if (!img_path.empty()) {
        j.kv_string("imageUrl", "/api/images/locations/" + loc.id);
    }
    j.end_object();
    return j.str();
}

Character Routes::parse_character_json(std::string_view json_str) const {
    Character c;
    c.name = std::string(json::extract_string(json_str, "name"));
    c.id = MarkdownParser::to_id(c.name);
    c.role = std::string(json::extract_string(json_str, "role"));
    c.first_encountered = std::string(json::extract_string(json_str, "firstEncountered"));
    c.appearance = std::string(json::extract_string(json_str, "appearance"));
    c.background = std::string(json::extract_string(json_str, "background"));
    c.motivations = std::string(json::extract_string(json_str, "motivations"));
    c.personality = std::string(json::extract_string(json_str, "personality"));
    c.knows = std::string(json::extract_string(json_str, "knows"));
    c.doesnt_know = std::string(json::extract_string(json_str, "doesntKnow"));
    c.image_path = std::string(json::extract_string(json_str, "imagePath"));
    return c;
}

Location Routes::parse_location_json(std::string_view json_str) const {
    Location loc;
    loc.name = std::string(json::extract_string(json_str, "name"));
    loc.id = MarkdownParser::to_id(loc.name);
    loc.type = std::string(json::extract_string(json_str, "type"));
    loc.district = std::string(json::extract_string(json_str, "district"));
    loc.description = std::string(json::extract_string(json_str, "description"));
    loc.atmosphere = std::string(json::extract_string(json_str, "atmosphere"));
    loc.notable_features = std::string(json::extract_string(json_str, "notableFeatures"));
    loc.npcs_present = std::string(json::extract_string(json_str, "npcsPresent"));
    loc.image_path = std::string(json::extract_string(json_str, "imagePath"));
    return loc;
}

void Routes::handle_message(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

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
    set_cors_headers(res);
    std::string player_md = context_.get_player_state();

    json::JsonBuilder result;
    result.begin_object();
    result.kv_string("content", player_md);
    // Add image URL if exists
    std::string img_path = context_.get_image_path("player", "avatar");
    if (!img_path.empty()) {
        result.kv_string("imageUrl", "/api/images/player/avatar");
    }
    result.end_object();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_update_player(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    auto content = json::extract_string(req.body, "content");
    if (content.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing content"})", "application/json");
        return;
    }

    context_.save_player_state(std::string(content));
    res.set_content(R"({"success":true})", "application/json");
}

void Routes::handle_add_note(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    auto note = json::extract_string(req.body, "note");
    if (note.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing note"})", "application/json");
        return;
    }

    std::vector<ContextUpdate> updates;
    updates.push_back({"player.md", "\n- " + std::string(note)});
    context_.apply_updates(updates);

    res.set_content(R"({"success":true})", "application/json");
}

void Routes::handle_player_image(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    auto image_data = json::extract_string(req.body, "imageData");
    auto mime_type = json::extract_string(req.body, "mimeType");

    if (image_data.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing imageData"})", "application/json");
        return;
    }

    std::string mime = mime_type.empty() ? "image/png" : std::string(mime_type);
    bool saved = context_.save_image("player", "avatar", std::string(image_data), mime);

    if (saved) {
        json::JsonBuilder result;
        result.begin_object();
        result.kv_string("success", "true");
        result.kv_string("imageUrl", "/api/images/player/avatar");
        result.end_object();
        res.set_content(result.str(), "application/json");
    } else {
        res.status = 500;
        res.set_content(R"({"error":"Failed to save image"})", "application/json");
    }
}

void Routes::handle_new_campaign(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    (void)json::extract_string(req.body, "campaignName");
    auto player_name = json::extract_string(req.body, "playerName");
    auto player_role = json::extract_string(req.body, "playerRole");

    // Fall back to playerClass for backwards compatibility
    if (player_role.empty()) {
        player_role = json::extract_string(req.body, "playerClass");
    }

    context_.init_new_campaign(std::string(player_name), std::string(player_role));

    res.set_content(R"({"success":true})", "application/json");
}

void Routes::handle_get_history(const httplib::Request&, httplib::Response& res) {
    set_cors_headers(res);
    std::string history = context_.get_history();
    if (history.empty()) history = "[]";
    res.set_content(history, "application/json");
}

// Characters CRUD

void Routes::handle_get_characters(const httplib::Request&, httplib::Response& res) {
    set_cors_headers(res);

    std::string md = context_.get_characters();
    auto chars = md_parser_.parse_characters(md);

    json::JsonBuilder result;
    result.begin_array();
    for (const auto& c : chars) {
        result.value_raw(build_character_json(c));
    }
    result.end_array();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_get_character(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string id = req.matches[1];
    std::string md = context_.get_characters();
    auto chars = md_parser_.parse_characters(md);

    auto found = md_parser_.find_character(chars, id);
    if (!found) {
        res.status = 404;
        res.set_content(R"({"error":"Character not found"})", "application/json");
        return;
    }

    res.set_content(build_character_json(*found), "application/json");
}

void Routes::handle_create_character(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    Character c = parse_character_json(req.body);
    if (c.name.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing character name"})", "application/json");
        return;
    }

    std::string md = context_.get_characters();
    auto chars = md_parser_.parse_characters(md);

    // Check for duplicate
    if (md_parser_.find_character(chars, c.id)) {
        res.status = 409;
        res.set_content(R"({"error":"Character already exists"})", "application/json");
        return;
    }

    chars.push_back(c);
    context_.save_characters(md_parser_.serialize_characters(chars));

    res.set_content(build_character_json(c), "application/json");
}

void Routes::handle_update_character(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string id = req.matches[1];
    std::string md = context_.get_characters();
    auto chars = md_parser_.parse_characters(md);

    auto it = std::find_if(chars.begin(), chars.end(),
                           [&id](const Character& c) { return c.id == id; });

    if (it == chars.end()) {
        res.status = 404;
        res.set_content(R"({"error":"Character not found"})", "application/json");
        return;
    }

    Character updated = parse_character_json(req.body);
    updated.id = id;  // Preserve original ID
    if (updated.name.empty()) updated.name = it->name;
    *it = updated;

    context_.save_characters(md_parser_.serialize_characters(chars));
    res.set_content(build_character_json(updated), "application/json");
}

void Routes::handle_delete_character(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string id = req.matches[1];
    std::string md = context_.get_characters();
    auto chars = md_parser_.parse_characters(md);

    auto it = std::find_if(chars.begin(), chars.end(),
                           [&id](const Character& c) { return c.id == id; });

    if (it == chars.end()) {
        res.status = 404;
        res.set_content(R"({"error":"Character not found"})", "application/json");
        return;
    }

    chars.erase(it);
    context_.save_characters(md_parser_.serialize_characters(chars));

    res.set_content(R"({"success":true})", "application/json");
}

// Locations CRUD

void Routes::handle_get_locations(const httplib::Request&, httplib::Response& res) {
    set_cors_headers(res);

    std::string md = context_.get_locations();
    auto locs = md_parser_.parse_locations(md);

    json::JsonBuilder result;
    result.begin_array();
    for (const auto& loc : locs) {
        result.value_raw(build_location_json(loc));
    }
    result.end_array();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_get_location(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string id = req.matches[1];
    std::string md = context_.get_locations();
    auto locs = md_parser_.parse_locations(md);

    auto found = md_parser_.find_location(locs, id);
    if (!found) {
        res.status = 404;
        res.set_content(R"({"error":"Location not found"})", "application/json");
        return;
    }

    res.set_content(build_location_json(*found), "application/json");
}

void Routes::handle_create_location(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    Location loc = parse_location_json(req.body);
    if (loc.name.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing location name"})", "application/json");
        return;
    }

    std::string md = context_.get_locations();
    auto locs = md_parser_.parse_locations(md);

    if (md_parser_.find_location(locs, loc.id)) {
        res.status = 409;
        res.set_content(R"({"error":"Location already exists"})", "application/json");
        return;
    }

    locs.push_back(loc);
    context_.save_locations(md_parser_.serialize_locations(locs));

    res.set_content(build_location_json(loc), "application/json");
}

void Routes::handle_update_location(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string id = req.matches[1];
    std::string md = context_.get_locations();
    auto locs = md_parser_.parse_locations(md);

    auto it = std::find_if(locs.begin(), locs.end(),
                           [&id](const Location& l) { return l.id == id; });

    if (it == locs.end()) {
        res.status = 404;
        res.set_content(R"({"error":"Location not found"})", "application/json");
        return;
    }

    Location updated = parse_location_json(req.body);
    updated.id = id;
    if (updated.name.empty()) updated.name = it->name;
    *it = updated;

    context_.save_locations(md_parser_.serialize_locations(locs));
    res.set_content(build_location_json(updated), "application/json");
}

void Routes::handle_delete_location(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    std::string id = req.matches[1];
    std::string md = context_.get_locations();
    auto locs = md_parser_.parse_locations(md);

    auto it = std::find_if(locs.begin(), locs.end(),
                           [&id](const Location& l) { return l.id == id; });

    if (it == locs.end()) {
        res.status = 404;
        res.set_content(R"({"error":"Location not found"})", "application/json");
        return;
    }

    locs.erase(it);
    context_.save_locations(md_parser_.serialize_locations(locs));

    res.set_content(R"({"success":true})", "application/json");
}

// AI Generation

void Routes::handle_generate_character(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    auto name = json::extract_string(req.body, "name");

    if (name.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing character name"})", "application/json");
        return;
    }

    // Build prompt for Claude to generate character details
    std::string prompt = "Generate detailed content for a character in an interactive fiction story.\n\n";
    prompt += "Character name: " + std::string(name) + "\n\n";

    // Include any existing data
    auto existing = json::extract_string(req.body, "existing");
    if (!existing.empty()) {
        prompt += "Existing character details:\n" + std::string(existing) + "\n\n";
    }

    // Include world context
    std::string world_context = file::read_file(context_.campaign_dir() + "/context.md");
    if (!world_context.empty()) {
        prompt += "Current world context:\n" + world_context + "\n\n";
    }

    prompt += "Generate the following sections in a creative, detailed way. ";
    prompt += "Format each section exactly as shown:\n\n";
    prompt += "[APPEARANCE]\nDescribe physical appearance in 2-3 sentences.\n[/APPEARANCE]\n\n";
    prompt += "[BACKGROUND]\nWrite a brief backstory in 2-3 sentences.\n[/BACKGROUND]\n\n";
    prompt += "[MOTIVATIONS]\nList 2-3 key motivations as bullet points.\n[/MOTIVATIONS]\n\n";
    prompt += "[PERSONALITY]\nDescribe personality traits in 2-3 sentences.\n[/PERSONALITY]\n";

    auto response = claude_.send_message("You are a creative writing assistant.", prompt);

    if (!response.success) {
        res.status = 500;
        json::JsonBuilder err;
        err.begin_object();
        err.kv_string("error", response.error);
        err.end_object();
        res.set_content(err.str(), "application/json");
        return;
    }

    // Parse generated content
    auto extract_section = [&](const std::string& tag) -> std::string {
        std::string start_tag = "[" + tag + "]";
        std::string end_tag = "[/" + tag + "]";
        size_t start = response.content.find(start_tag);
        if (start == std::string::npos) return "";
        start += start_tag.size();
        size_t end = response.content.find(end_tag, start);
        if (end == std::string::npos) return "";
        std::string content = response.content.substr(start, end - start);
        // Trim whitespace
        while (!content.empty() && (content.front() == '\n' || content.front() == ' '))
            content.erase(0, 1);
        while (!content.empty() && (content.back() == '\n' || content.back() == ' '))
            content.pop_back();
        return content;
    };

    json::JsonBuilder result;
    result.begin_object();
    result.kv_string("appearance", extract_section("APPEARANCE"));
    result.kv_string("background", extract_section("BACKGROUND"));
    result.kv_string("motivations", extract_section("MOTIVATIONS"));
    result.kv_string("personality", extract_section("PERSONALITY"));
    result.end_object();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_generate_location(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    auto name = json::extract_string(req.body, "name");

    if (name.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing location name"})", "application/json");
        return;
    }

    std::string prompt = "Generate detailed content for a location in an interactive fiction story.\n\n";
    prompt += "Location name: " + std::string(name) + "\n\n";

    auto existing = json::extract_string(req.body, "existing");
    if (!existing.empty()) {
        prompt += "Existing location details:\n" + std::string(existing) + "\n\n";
    }

    std::string world_context = file::read_file(context_.campaign_dir() + "/context.md");
    if (!world_context.empty()) {
        prompt += "Current world context:\n" + world_context + "\n\n";
    }

    prompt += "Generate the following sections in a creative, detailed way. ";
    prompt += "Format each section exactly as shown:\n\n";
    prompt += "[DESCRIPTION]\nDescribe the location in 2-3 vivid sentences.\n[/DESCRIPTION]\n\n";
    prompt += "[ATMOSPHERE]\nDescribe the sensory experience (sights, sounds, smells) in 2-3 sentences.\n[/ATMOSPHERE]\n\n";
    prompt += "[NOTABLE_FEATURES]\nList 3-4 interesting features as bullet points.\n[/NOTABLE_FEATURES]\n";

    auto response = claude_.send_message("You are a creative writing assistant.", prompt);

    if (!response.success) {
        res.status = 500;
        json::JsonBuilder err;
        err.begin_object();
        err.kv_string("error", response.error);
        err.end_object();
        res.set_content(err.str(), "application/json");
        return;
    }

    auto extract_section = [&](const std::string& tag) -> std::string {
        std::string start_tag = "[" + tag + "]";
        std::string end_tag = "[/" + tag + "]";
        size_t start = response.content.find(start_tag);
        if (start == std::string::npos) return "";
        start += start_tag.size();
        size_t end = response.content.find(end_tag, start);
        if (end == std::string::npos) return "";
        std::string content = response.content.substr(start, end - start);
        while (!content.empty() && (content.front() == '\n' || content.front() == ' '))
            content.erase(0, 1);
        while (!content.empty() && (content.back() == '\n' || content.back() == ' '))
            content.pop_back();
        return content;
    };

    json::JsonBuilder result;
    result.begin_object();
    result.kv_string("description", extract_section("DESCRIPTION"));
    result.kv_string("atmosphere", extract_section("ATMOSPHERE"));
    result.kv_string("notableFeatures", extract_section("NOTABLE_FEATURES"));
    result.end_object();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_generate_image(const httplib::Request& req, httplib::Response& res) {
    set_cors_headers(res);

    auto prompt = json::extract_string(req.body, "prompt");
    auto category = json::extract_string(req.body, "category");
    auto id = json::extract_string(req.body, "id");

    if (prompt.empty()) {
        res.status = 400;
        res.set_content(R"({"error":"Missing prompt"})", "application/json");
        return;
    }

    // Generate image via Gemini
    auto response = gemini_.generate_image(prompt);

    if (!response.success) {
        res.status = 500;
        json::JsonBuilder err;
        err.begin_object();
        err.kv_string("error", response.error);
        err.end_object();
        res.set_content(err.str(), "application/json");
        return;
    }

    // If category and id provided, save the image
    std::string image_url;
    if (!category.empty() && !id.empty()) {
        bool saved = context_.save_image(std::string(category), std::string(id),
                                          response.image_data, response.mime_type);
        if (saved) {
            image_url = "/api/images/" + std::string(category) + "/" + std::string(id);
        }
    }

    json::JsonBuilder result;
    result.begin_object();
    result.kv_string("imageData", response.image_data);
    result.kv_string("mimeType", response.mime_type);
    if (!image_url.empty()) {
        result.kv_string("imageUrl", image_url);
    }
    result.end_object();

    res.set_content(result.str(), "application/json");
}

void Routes::handle_get_image(const httplib::Request& req, httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");

    std::string category = req.matches[1];
    std::string id = req.matches[2];

    std::string path = context_.get_image_path(category, id);
    if (path.empty()) {
        res.status = 404;
        res.set_content("Image not found", "text/plain");
        return;
    }

    // Determine content type
    std::string content_type = "image/png";
    if (path.find(".jpg") != std::string::npos || path.find(".jpeg") != std::string::npos) {
        content_type = "image/jpeg";
    } else if (path.find(".webp") != std::string::npos) {
        content_type = "image/webp";
    }

    // Read and serve the file
    std::ifstream file(path, std::ios::binary);
    if (!file) {
        res.status = 500;
        res.set_content("Failed to read image", "text/plain");
        return;
    }

    std::string content((std::istreambuf_iterator<char>(file)),
                        std::istreambuf_iterator<char>());

    res.set_content(content, content_type);
}

}
