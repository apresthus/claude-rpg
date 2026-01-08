#pragma once
#include <string>
#include <string_view>

namespace rpg {

struct GeminiImageResponse {
    std::string image_data;  // base64 encoded
    std::string mime_type;
    bool success = false;
    std::string error;
};

class GeminiAPI {
public:
    GeminiAPI();
    ~GeminiAPI() = default;

    GeminiImageResponse generate_image(std::string_view prompt);

    void set_api_key(const std::string& key) { api_key_ = key; }

private:
    std::string api_key_;
    std::string model_ = "gemini-2.0-flash-exp-image-generation";
};

}
