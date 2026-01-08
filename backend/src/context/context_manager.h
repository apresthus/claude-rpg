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
    void init_new_campaign(const std::string& player_name, const std::string& player_class);

    void append_history(const std::string& player_input, const std::string& gm_response);
    std::string get_history() const;

private:
    std::string campaign_dir_;
    std::string plot_path() const { return campaign_dir_ + "/plot.md"; }
    std::string context_path() const { return campaign_dir_ + "/context.md"; }
    std::string player_path() const { return campaign_dir_ + "/player.md"; }
    std::string history_path() const { return campaign_dir_ + "/history.json"; }
};

}
