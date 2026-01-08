#include "markdown_parser.h"
#include <algorithm>
#include <cctype>
#include <sstream>

namespace rpg {

std::string MarkdownParser::to_id(std::string_view name) {
    std::string id;
    id.reserve(name.size());
    for (char c : name) {
        if (std::isalnum(static_cast<unsigned char>(c))) {
            id += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        } else if (c == ' ' || c == '-') {
            if (!id.empty() && id.back() != '_') {
                id += '_';
            }
        }
    }
    while (!id.empty() && id.back() == '_') id.pop_back();
    return id;
}

std::vector<std::string_view> MarkdownParser::split_by_h2(std::string_view markdown) const {
    std::vector<std::string_view> sections;
    size_t pos = 0;
    size_t start = std::string_view::npos;

    while (pos < markdown.size()) {
        // Find "## " at start of line
        if ((pos == 0 || markdown[pos - 1] == '\n') &&
            pos + 3 < markdown.size() &&
            markdown[pos] == '#' && markdown[pos + 1] == '#' && markdown[pos + 2] == ' ') {

            if (start != std::string_view::npos) {
                sections.push_back(markdown.substr(start, pos - start));
            }
            start = pos;
        }
        ++pos;
    }

    if (start != std::string_view::npos) {
        sections.push_back(markdown.substr(start));
    }

    return sections;
}

std::string_view MarkdownParser::extract_section(std::string_view content,
                                                   std::string_view header) const {
    std::string pattern = "# " + std::string(header) + "\n";
    size_t pos = content.find(pattern);
    if (pos == std::string_view::npos) return {};

    size_t start = pos + pattern.size();
    size_t end = content.find("\n# ", start);
    if (end == std::string_view::npos) end = content.size();

    return content.substr(start, end - start);
}

std::string_view MarkdownParser::extract_subsection(std::string_view content,
                                                      std::string_view header) const {
    std::string pattern = "### " + std::string(header) + "\n";
    size_t pos = content.find(pattern);
    if (pos == std::string_view::npos) {
        // Try without newline (might be end of file)
        pattern = "### " + std::string(header);
        pos = content.find(pattern);
        if (pos == std::string_view::npos) return {};
    }

    size_t start = pos + pattern.size();
    while (start < content.size() && content[start] == '\n') ++start;

    // Find next ### or ## or end
    size_t end = start;
    while (end < content.size()) {
        if (content[end] == '\n' && end + 1 < content.size()) {
            if ((content[end + 1] == '#' && end + 2 < content.size() && content[end + 2] == '#') ||
                (content[end + 1] == '#' && end + 2 < content.size() && content[end + 2] == ' ')) {
                break;
            }
        }
        ++end;
    }

    // Trim trailing whitespace
    while (end > start && (content[end - 1] == '\n' || content[end - 1] == ' ')) --end;

    return content.substr(start, end - start);
}

std::string_view MarkdownParser::extract_basic_info_field(std::string_view basic_info,
                                                            std::string_view field) const {
    std::string pattern = "**" + std::string(field) + "**:";
    size_t pos = basic_info.find(pattern);
    if (pos == std::string_view::npos) return {};

    size_t start = pos + pattern.size();
    while (start < basic_info.size() && basic_info[start] == ' ') ++start;

    size_t end = basic_info.find('\n', start);
    if (end == std::string_view::npos) end = basic_info.size();

    return basic_info.substr(start, end - start);
}

std::string_view MarkdownParser::extract_image_path(std::string_view content) const {
    // Look for ![...](path)
    size_t pos = content.find("![");
    if (pos == std::string_view::npos) return {};

    size_t paren_start = content.find("](", pos);
    if (paren_start == std::string_view::npos) return {};

    size_t path_start = paren_start + 2;
    size_t path_end = content.find(')', path_start);
    if (path_end == std::string_view::npos) return {};

    return content.substr(path_start, path_end - path_start);
}

std::vector<Character> MarkdownParser::parse_characters(std::string_view markdown) const {
    std::vector<Character> characters;

    auto sections = split_by_h2(markdown);
    for (auto section : sections) {
        Character c;

        // Extract name from "## Name"
        size_t name_start = section.find("## ");
        if (name_start == std::string_view::npos) continue;
        name_start += 3;
        size_t name_end = section.find('\n', name_start);
        if (name_end == std::string_view::npos) name_end = section.size();
        c.name = std::string(section.substr(name_start, name_end - name_start));
        c.id = to_id(c.name);

        auto basic_info = extract_subsection(section, "Basic Info");
        c.role = std::string(extract_basic_info_field(basic_info, "Role"));
        c.first_encountered = std::string(extract_basic_info_field(basic_info, "First Encountered"));

        c.appearance = std::string(extract_subsection(section, "Appearance"));
        c.background = std::string(extract_subsection(section, "Background"));
        c.motivations = std::string(extract_subsection(section, "Motivations"));
        c.personality = std::string(extract_subsection(section, "Personality"));

        auto knowledge = extract_subsection(section, "Knowledge");
        c.knows = std::string(extract_basic_info_field(knowledge, "Knows"));
        c.doesnt_know = std::string(extract_basic_info_field(knowledge, "Doesn't know"));

        auto image_section = extract_subsection(section, "Image");
        c.image_path = std::string(extract_image_path(image_section));

        characters.push_back(std::move(c));
    }

    return characters;
}

std::vector<Location> MarkdownParser::parse_locations(std::string_view markdown) const {
    std::vector<Location> locations;

    auto sections = split_by_h2(markdown);
    for (auto section : sections) {
        Location loc;

        // Extract name from "## Name"
        size_t name_start = section.find("## ");
        if (name_start == std::string_view::npos) continue;
        name_start += 3;
        size_t name_end = section.find('\n', name_start);
        if (name_end == std::string_view::npos) name_end = section.size();
        loc.name = std::string(section.substr(name_start, name_end - name_start));
        loc.id = to_id(loc.name);

        auto basic_info = extract_subsection(section, "Basic Info");
        loc.type = std::string(extract_basic_info_field(basic_info, "Type"));
        loc.district = std::string(extract_basic_info_field(basic_info, "District"));

        loc.description = std::string(extract_subsection(section, "Description"));
        loc.atmosphere = std::string(extract_subsection(section, "Atmosphere"));
        loc.notable_features = std::string(extract_subsection(section, "Notable Features"));
        loc.npcs_present = std::string(extract_subsection(section, "NPCs Present"));

        auto image_section = extract_subsection(section, "Image");
        loc.image_path = std::string(extract_image_path(image_section));

        locations.push_back(std::move(loc));
    }

    return locations;
}

PlayerProfile MarkdownParser::parse_player_profile(std::string_view markdown) const {
    PlayerProfile profile;

    auto extract_multi = [&](std::string_view header) -> std::string {
        std::string pattern = "# " + std::string(header) + "\n";
        size_t pos = markdown.find(pattern);
        if (pos == std::string_view::npos) return {};

        size_t start = pos + pattern.size();
        size_t end = markdown.find("\n# ", start);
        if (end == std::string_view::npos) end = markdown.size();

        std::string_view content = markdown.substr(start, end - start);
        // Trim
        while (!content.empty() && content.back() == '\n') {
            content = content.substr(0, content.size() - 1);
        }
        return std::string(content);
    };

    // Parse Character section for name and role
    auto char_section = extract_section(markdown, "Character");
    size_t name_pos = char_section.find("Name:");
    if (name_pos != std::string_view::npos) {
        size_t start = name_pos + 5;
        while (start < char_section.size() && char_section[start] == ' ') ++start;
        size_t end = char_section.find('\n', start);
        if (end == std::string_view::npos) end = char_section.size();
        profile.name = std::string(char_section.substr(start, end - start));
    }

    size_t role_pos = char_section.find("Role:");
    if (role_pos != std::string_view::npos) {
        size_t start = role_pos + 5;
        while (start < char_section.size() && char_section[start] == ' ') ++start;
        size_t end = char_section.find('\n', start);
        if (end == std::string_view::npos) end = char_section.size();
        profile.role = std::string(char_section.substr(start, end - start));
    }

    profile.appearance = extract_multi("Appearance");
    profile.background = extract_multi("Background");
    profile.personality = extract_multi("Personality");
    profile.goals = extract_multi("Goals");
    profile.skills = extract_multi("Skills");
    profile.inventory = extract_multi("Inventory");
    profile.quest_log = extract_multi("Quest Log");
    profile.notes = extract_multi("Notes");
    profile.relationships = extract_multi("Relationships");

    auto image_section = extract_multi("Image");
    profile.image_path = std::string(extract_image_path(image_section));

    return profile;
}

std::string MarkdownParser::serialize_characters(const std::vector<Character>& chars) const {
    std::ostringstream out;
    out << "# Characters\n\n";

    for (const auto& c : chars) {
        out << "## " << c.name << "\n";
        out << "### Basic Info\n";
        if (!c.role.empty()) out << "- **Role**: " << c.role << "\n";
        if (!c.first_encountered.empty()) out << "- **First Encountered**: " << c.first_encountered << "\n";
        out << "\n";

        if (!c.appearance.empty()) {
            out << "### Appearance\n" << c.appearance << "\n\n";
        }
        if (!c.background.empty()) {
            out << "### Background\n" << c.background << "\n\n";
        }
        if (!c.motivations.empty()) {
            out << "### Motivations\n" << c.motivations << "\n\n";
        }
        if (!c.personality.empty()) {
            out << "### Personality\n" << c.personality << "\n\n";
        }
        if (!c.knows.empty() || !c.doesnt_know.empty()) {
            out << "### Knowledge\n";
            if (!c.knows.empty()) out << "- **Knows**: " << c.knows << "\n";
            if (!c.doesnt_know.empty()) out << "- **Doesn't know**: " << c.doesnt_know << "\n";
            out << "\n";
        }
        if (!c.image_path.empty()) {
            out << "### Image\n![" << c.name << "](" << c.image_path << ")\n\n";
        }
        out << "---\n\n";
    }

    return out.str();
}

std::string MarkdownParser::serialize_locations(const std::vector<Location>& locs) const {
    std::ostringstream out;
    out << "# Locations\n\n";

    for (const auto& loc : locs) {
        out << "## " << loc.name << "\n";
        out << "### Basic Info\n";
        if (!loc.type.empty()) out << "- **Type**: " << loc.type << "\n";
        if (!loc.district.empty()) out << "- **District**: " << loc.district << "\n";
        out << "\n";

        if (!loc.description.empty()) {
            out << "### Description\n" << loc.description << "\n\n";
        }
        if (!loc.atmosphere.empty()) {
            out << "### Atmosphere\n" << loc.atmosphere << "\n\n";
        }
        if (!loc.notable_features.empty()) {
            out << "### Notable Features\n" << loc.notable_features << "\n\n";
        }
        if (!loc.npcs_present.empty()) {
            out << "### NPCs Present\n" << loc.npcs_present << "\n\n";
        }
        if (!loc.image_path.empty()) {
            out << "### Image\n![" << loc.name << "](" << loc.image_path << ")\n\n";
        }
        out << "---\n\n";
    }

    return out.str();
}

std::string MarkdownParser::serialize_player_profile(const PlayerProfile& profile) const {
    std::ostringstream out;

    out << "# Character\n";
    out << "Name: " << profile.name << "\n";
    if (!profile.role.empty()) out << "Role: " << profile.role << "\n";
    out << "\n";

    if (!profile.appearance.empty()) {
        out << "# Appearance\n" << profile.appearance << "\n\n";
    }
    if (!profile.background.empty()) {
        out << "# Background\n" << profile.background << "\n\n";
    }
    if (!profile.personality.empty()) {
        out << "# Personality\n" << profile.personality << "\n\n";
    }
    if (!profile.goals.empty()) {
        out << "# Goals\n" << profile.goals << "\n\n";
    }
    if (!profile.skills.empty()) {
        out << "# Skills\n" << profile.skills << "\n\n";
    }
    if (!profile.inventory.empty()) {
        out << "# Inventory\n" << profile.inventory << "\n\n";
    } else {
        out << "# Inventory\n(No items)\n\n";
    }
    if (!profile.quest_log.empty()) {
        out << "# Quest Log\n" << profile.quest_log << "\n\n";
    } else {
        out << "# Quest Log\n(No quests yet)\n\n";
    }
    if (!profile.notes.empty()) {
        out << "# Notes\n" << profile.notes << "\n\n";
    } else {
        out << "# Notes\n(No notes yet)\n\n";
    }
    if (!profile.relationships.empty()) {
        out << "# Relationships\n" << profile.relationships << "\n\n";
    }
    if (!profile.image_path.empty()) {
        out << "# Image\n![Avatar](" << profile.image_path << ")\n";
    }

    return out.str();
}

std::optional<Character> MarkdownParser::find_character(const std::vector<Character>& chars,
                                                          std::string_view id) const {
    for (const auto& c : chars) {
        if (c.id == id) return c;
    }
    return std::nullopt;
}

std::optional<Location> MarkdownParser::find_location(const std::vector<Location>& locs,
                                                        std::string_view id) const {
    for (const auto& loc : locs) {
        if (loc.id == id) return loc;
    }
    return std::nullopt;
}

}
