#pragma once
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace rpg {

struct Character {
    std::string id;
    std::string name;
    std::string role;
    std::string first_encountered;
    std::string appearance;
    std::string background;
    std::string motivations;
    std::string personality;
    std::string knows;
    std::string doesnt_know;
    std::string image_path;
};

struct Location {
    std::string id;
    std::string name;
    std::string type;
    std::string district;
    std::string description;
    std::string atmosphere;
    std::string notable_features;
    std::string npcs_present;
    std::string image_path;
};

struct PlayerProfile {
    std::string name;
    std::string role;
    std::string appearance;
    std::string background;
    std::string personality;
    std::string goals;
    std::string skills;
    std::string inventory;
    std::string quest_log;
    std::string notes;
    std::string relationships;
    std::string image_path;
};

class MarkdownParser {
public:
    std::vector<Character> parse_characters(std::string_view markdown) const;
    std::vector<Location> parse_locations(std::string_view markdown) const;
    PlayerProfile parse_player_profile(std::string_view markdown) const;

    std::string serialize_characters(const std::vector<Character>& chars) const;
    std::string serialize_locations(const std::vector<Location>& locs) const;
    std::string serialize_player_profile(const PlayerProfile& profile) const;

    std::optional<Character> find_character(const std::vector<Character>& chars,
                                             std::string_view id) const;
    std::optional<Location> find_location(const std::vector<Location>& locs,
                                           std::string_view id) const;

    static std::string to_id(std::string_view name);

private:
    std::string_view extract_section(std::string_view content,
                                      std::string_view header) const;
    std::string_view extract_subsection(std::string_view content,
                                         std::string_view header) const;
    std::string_view extract_basic_info_field(std::string_view basic_info,
                                               std::string_view field) const;
    std::string_view extract_image_path(std::string_view content) const;
    std::vector<std::string_view> split_by_h2(std::string_view markdown) const;
};

}
