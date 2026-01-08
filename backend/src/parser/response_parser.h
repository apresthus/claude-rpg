#pragma once
#include <string>
#include <string_view>
#include <vector>
#include "../context/context_manager.h"

namespace rpg {

class ResponseParser {
public:
    std::string extract_narrative(std::string_view response) const;
    std::vector<ContextUpdate> extract_updates(std::string_view response) const;

private:
    std::string_view find_section(std::string_view response,
                                   std::string_view start_tag,
                                   std::string_view end_tag) const;
};

}
