#include "response_parser.h"
#include <cstring>

namespace rpg {

std::string_view ResponseParser::find_section(std::string_view response,
                                               std::string_view start_tag,
                                               std::string_view end_tag) const {
    size_t start = response.find(start_tag);
    if (start == std::string_view::npos) return {};

    start += start_tag.size();
    size_t end = response.find(end_tag, start);
    if (end == std::string_view::npos) return {};

    // Trim whitespace
    while (start < end && (response[start] == '\n' || response[start] == '\r')) ++start;
    while (end > start && (response[end-1] == '\n' || response[end-1] == '\r')) --end;

    return response.substr(start, end - start);
}

std::string ResponseParser::extract_narrative(std::string_view response) const {
    auto narrative = find_section(response, "[NARRATIVE]", "[/NARRATIVE]");
    return std::string(narrative);
}

std::vector<ContextUpdate> ResponseParser::extract_updates(std::string_view response) const {
    std::vector<ContextUpdate> updates;

    const char* update_files[] = {"plot.md", "context.md", "player.md"};

    for (const char* filename : update_files) {
        std::string start_tag = "[UPDATE:";
        start_tag += filename;
        start_tag += "]";
        std::string end_tag = "[/UPDATE]";

        auto content = find_section(response, start_tag, end_tag);
        if (!content.empty()) {
            updates.push_back({filename, std::string(content)});
        }
    }

    return updates;
}

}
