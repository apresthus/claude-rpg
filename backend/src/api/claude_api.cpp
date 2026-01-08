#include "claude_api.h"
#include "../util/json.h"
#include "../util/file_utils.h"
#include <curl/curl.h>
#include <cstring>

namespace rpg {

namespace {
    size_t write_callback(char* ptr, size_t size, size_t nmemb, std::string* data) {
        data->append(ptr, size * nmemb);
        return size * nmemb;
    }

    std::string load_env_value(const std::string& key) {
        // Try .env file first
        std::string env_content = file::read_file(".env");
        if (!env_content.empty()) {
            std::string search = key + "=";
            size_t pos = env_content.find(search);
            if (pos != std::string::npos) {
                size_t start = pos + search.size();
                size_t end = env_content.find('\n', start);
                if (end == std::string::npos) end = env_content.size();
                std::string value = env_content.substr(start, end - start);
                // Trim whitespace
                while (!value.empty() && (value.back() == ' ' || value.back() == '\r'))
                    value.pop_back();
                if (!value.empty()) return value;
            }
        }
        // Fall back to environment variable
        const char* val = std::getenv(key.c_str());
        return val ? val : "";
    }
}

ClaudeAPI::ClaudeAPI() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    api_key_ = load_env_value("ANTHROPIC_API_KEY");
}

ClaudeAPI::~ClaudeAPI() {
    curl_global_cleanup();
}

ClaudeResponse ClaudeAPI::send_message(std::string_view system_prompt,
                                        std::string_view user_message) {
    ClaudeResponse response;

    if (api_key_.empty()) {
        response.error = "ANTHROPIC_API_KEY not set";
        return response;
    }

    CURL* curl = curl_easy_init();
    if (!curl) {
        response.error = "Failed to initialize curl";
        return response;
    }

    // Build JSON payload
    json::JsonBuilder builder(4096);
    builder.begin_object();
    builder.kv_string("model", model_);
    builder.kv_int("max_tokens", max_tokens_);
    builder.kv_string("system", system_prompt);
    builder.key("messages");
    builder.begin_array();
    builder.begin_object();
    builder.kv_string("role", "user");
    builder.kv_string("content", user_message);
    builder.end_object();
    builder.end_array();
    builder.end_object();

    std::string response_data;

    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    std::string auth_header = "x-api-key: " + api_key_;
    headers = curl_slist_append(headers, auth_header.c_str());
    headers = curl_slist_append(headers, "anthropic-version: 2023-06-01");

    curl_easy_setopt(curl, CURLOPT_URL, "https://api.anthropic.com/v1/messages");
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

    // Parse response
    auto content_array = json::extract_object(response_data, "content");
    if (!content_array.empty()) {
        auto text = json::extract_string(content_array, "text");
        response.content = json::unescape(text);
        response.success = true;
    }

    auto usage = json::extract_object(response_data, "usage");
    if (!usage.empty()) {
        response.input_tokens = static_cast<int>(json::extract_int(usage, "input_tokens"));
        response.output_tokens = static_cast<int>(json::extract_int(usage, "output_tokens"));
    }

    if (!response.success) {
        auto error = json::extract_object(response_data, "error");
        if (!error.empty()) {
            response.error = std::string(json::extract_string(error, "message"));
        } else {
            response.error = "Unknown error parsing response";
        }
    }

    return response;
}

}
