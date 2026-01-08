#include "gemini_api.h"
#include "../util/json.h"
#include "../util/file_utils.h"
#include <curl/curl.h>

namespace rpg {

namespace {
    size_t write_callback(char* ptr, size_t size, size_t nmemb, std::string* data) {
        data->append(ptr, size * nmemb);
        return size * nmemb;
    }

    std::string load_env_value(const std::string& key) {
        std::string env_content = file::read_file(".env");
        if (!env_content.empty()) {
            std::string search = key + "=";
            size_t pos = env_content.find(search);
            if (pos != std::string::npos) {
                size_t start = pos + search.size();
                size_t end = env_content.find('\n', start);
                if (end == std::string::npos) end = env_content.size();
                std::string value = env_content.substr(start, end - start);
                while (!value.empty() && (value.back() == ' ' || value.back() == '\r'))
                    value.pop_back();
                if (!value.empty()) return value;
            }
        }
        const char* val = std::getenv(key.c_str());
        return val ? val : "";
    }
}

GeminiAPI::GeminiAPI() {
    api_key_ = load_env_value("GEMINI_API_KEY");
}

GeminiImageResponse GeminiAPI::generate_image(std::string_view prompt) {
    GeminiImageResponse response;

    if (api_key_.empty()) {
        response.error = "GEMINI_API_KEY not set";
        return response;
    }

    CURL* curl = curl_easy_init();
    if (!curl) {
        response.error = "Failed to initialize curl";
        return response;
    }

    // Build JSON payload for Gemini image generation
    json::JsonBuilder builder(2048);
    builder.begin_object();
    builder.key("contents");
    builder.begin_array();
    builder.begin_object();
    builder.key("parts");
    builder.begin_array();
    builder.begin_object();
    builder.kv_string("text", prompt);
    builder.end_object();
    builder.end_array();
    builder.end_object();
    builder.end_array();
    builder.key("generationConfig");
    builder.begin_object();
    builder.kv_string("responseModalities", "IMAGE");
    builder.end_object();
    builder.end_object();

    std::string response_data;
    std::string url = "https://generativelanguage.googleapis.com/v1beta/models/" +
                      model_ + ":generateContent?key=" + api_key_;

    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, builder.str().c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response_data);

    CURLcode res = curl_easy_perform(curl);

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK) {
        response.error = curl_easy_strerror(res);
        return response;
    }

    // Parse response - structure is:
    // { "candidates": [{ "content": { "parts": [{ "inlineData": { "mimeType": "...", "data": "..." } }] } }] }
    auto candidates = json::extract_object(response_data, "candidates");
    if (candidates.empty()) {
        auto error = json::extract_object(response_data, "error");
        if (!error.empty()) {
            response.error = std::string(json::extract_string(error, "message"));
        } else {
            response.error = "No candidates in response";
        }
        return response;
    }

    auto content = json::extract_object(candidates, "content");
    if (content.empty()) {
        response.error = "No content in response";
        return response;
    }

    auto parts = json::extract_object(content, "parts");
    if (parts.empty()) {
        response.error = "No parts in response";
        return response;
    }

    auto inline_data = json::extract_object(parts, "inlineData");
    if (inline_data.empty()) {
        response.error = "No inlineData in response";
        return response;
    }

    response.mime_type = std::string(json::extract_string(inline_data, "mimeType"));
    response.image_data = std::string(json::extract_string(inline_data, "data"));

    if (!response.image_data.empty()) {
        response.success = true;
    } else {
        response.error = "No image data in response";
    }

    return response;
}

}
