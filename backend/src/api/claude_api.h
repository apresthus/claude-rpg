#pragma once
#include <string>
#include <string_view>

namespace rpg {

struct ClaudeResponse {
    std::string content;
    int input_tokens = 0;
    int output_tokens = 0;
    bool success = false;
    std::string error;
};

class ClaudeAPI {
public:
    ClaudeAPI();
    ~ClaudeAPI();

    ClaudeResponse send_message(std::string_view system_prompt,
                                 std::string_view user_message);

    void set_api_key(const std::string& key) { api_key_ = key; }
    void set_model(const std::string& model) { model_ = model; }
    void set_max_tokens(int tokens) { max_tokens_ = tokens; }

private:
    std::string api_key_;
    std::string model_ = "claude-sonnet-4-20250514";
    int max_tokens_ = 4096;
};

}
