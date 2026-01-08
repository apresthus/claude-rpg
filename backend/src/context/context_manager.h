#pragma once
#include <string>
#include <string_view>
#include <vector>

namespace rpg {

struct ContextUpdate {
    std::string filename;
    std::string content;
};

class ContextManager {
public:
    ContextManager(const std::string& campaign_dir = "campaigns/active");

    std::string build_full_context() const;
    std::string get_player_state() const;
    std::string get_system_prompt() const;

    void apply_updates(const std::vector<ContextUpdate>& updates);
    void init_new_campaign(const std::string& player_name, const std::string& player_role);

    void append_history(const std::string& player_input, const std::string& gm_response);
    std::string get_history() const;

    // Characters management
    std::string get_characters() const;
    void save_characters(const std::string& content);

    // Locations management
    std::string get_locations() const;
    void save_locations(const std::string& content);

    // Player profile management
    void save_player_state(const std::string& content);

    // Image management
    bool save_image(const std::string& category, const std::string& id,
                    const std::string& base64_data, const std::string& mime_type);
    std::string get_image_path(const std::string& category, const std::string& id) const;
    bool image_exists(const std::string& category, const std::string& id) const;

    // Path accessors (for serving images)
    std::string images_dir() const { return campaign_dir_ + "/images"; }
    const std::string& campaign_dir() const { return campaign_dir_; }

private:
    std::string campaign_dir_;
    std::string plot_path() const { return campaign_dir_ + "/plot.md"; }
    std::string context_path() const { return campaign_dir_ + "/context.md"; }
    std::string player_path() const { return campaign_dir_ + "/player.md"; }
    std::string characters_path() const { return campaign_dir_ + "/characters.md"; }
    std::string locations_path() const { return campaign_dir_ + "/locations.md"; }
    std::string history_path() const { return campaign_dir_ + "/history.json"; }

    void create_dirs(const std::string& path);
};

}
