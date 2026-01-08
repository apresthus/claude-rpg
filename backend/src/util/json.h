#pragma once
#include <string>
#include <string_view>
#include <charconv>
#include <cstring>

namespace rpg { namespace json {

constexpr size_t TYPICAL_RESPONSE_SIZE = 8192;

inline std::string_view extract_string(std::string_view json, std::string_view key) {
    char pattern[128];
    if (key.size() + 4 > sizeof(pattern)) return {};
    size_t pos = 0;
    pattern[pos++] = '"';
    for (char c : key) pattern[pos++] = c;
    pattern[pos++] = '"'; pattern[pos++] = ':'; pattern[pos] = '\0';
    size_t key_pos = json.find(pattern);
    if (key_pos == std::string_view::npos) return {};
    size_t vs = key_pos + pos;
    while (vs < json.size() && (json[vs] == ' ' || json[vs] == '\t')) ++vs;
    if (vs >= json.size() || json[vs] != '"') return {};
    ++vs;
    size_t ve = vs;
    while (ve < json.size() && json[ve] != '"') {
        if (json[ve] == '\\' && ve + 1 < json.size()) ve += 2;
        else ++ve;
    }
    return json.substr(vs, ve - vs);
}

inline int64_t extract_int(std::string_view json, std::string_view key, int64_t def = 0) {
    char pattern[128];
    if (key.size() + 4 > sizeof(pattern)) return def;
    size_t pos = 0;
    pattern[pos++] = '"';
    for (char c : key) pattern[pos++] = c;
    pattern[pos++] = '"'; pattern[pos++] = ':'; pattern[pos] = '\0';
    size_t key_pos = json.find(pattern);
    if (key_pos == std::string_view::npos) return def;
    size_t vs = key_pos + pos;
    while (vs < json.size() && (json[vs] == ' ' || json[vs] == '\t')) ++vs;
    int64_t result = def;
    std::from_chars(json.data() + vs, json.data() + json.size(), result);
    return result;
}

inline std::string_view extract_object(std::string_view json, std::string_view key) {
    char pattern[128];
    if (key.size() + 4 > sizeof(pattern)) return {};
    size_t pos = 0;
    pattern[pos++] = '"';
    for (char c : key) pattern[pos++] = c;
    pattern[pos++] = '"'; pattern[pos++] = ':'; pattern[pos] = '\0';
    size_t key_pos = json.find(pattern);
    if (key_pos == std::string_view::npos) return {};
    size_t vs = key_pos + pos;
    while (vs < json.size() && (json[vs] == ' ' || json[vs] == '\t' || json[vs] == '\n' || json[vs] == '\r')) ++vs;
    if (vs >= json.size()) return {};
    char open = json[vs], close;
    if (open == '{') close = '}'; else if (open == '[') close = ']'; else return {};
    int depth = 1; size_t ve = vs + 1; bool in_str = false, esc = false;
    while (ve < json.size() && depth > 0) {
        char c = json[ve];
        if (esc) esc = false;
        else if (c == '\\' && in_str) esc = true;
        else if (c == '"') in_str = !in_str;
        else if (!in_str) { if (c == open) ++depth; else if (c == close) --depth; }
        ++ve;
    }
    return json.substr(vs, ve - vs);
}

class JsonBuilder {
public:
    explicit JsonBuilder(size_t rs = TYPICAL_RESPONSE_SIZE) { buf_.reserve(rs); }
    void clear() { buf_.clear(); }
    void begin_object() { buf_ += '{'; }
    void end_object() { if (!buf_.empty() && buf_.back() == ',') buf_.back() = '}'; else buf_ += '}'; }
    void begin_array() { buf_ += '['; }
    void end_array() { if (!buf_.empty() && buf_.back() == ',') buf_.back() = ']'; else buf_ += ']'; }
    void key(std::string_view k) { buf_ += '"'; esc(k); buf_ += "\":"; }
    void value_string(std::string_view v) { buf_ += '"'; esc(v); buf_ += "\","; }
    void value_int(int64_t v) { char n[32]; auto [p,e] = std::to_chars(n, n+32, v); buf_.append(n, p-n); buf_ += ','; }
    void value_bool(bool v) { buf_ += v ? "true," : "false,"; }
    void value_raw(std::string_view v) { buf_ += v; buf_ += ','; }
    void kv_string(std::string_view k, std::string_view v) { key(k); value_string(v); }
    void kv_int(std::string_view k, int64_t v) { key(k); value_int(v); }
    std::string& str() { return buf_; }
    const std::string& str() const { return buf_; }
private:
    void esc(std::string_view s) {
        for (char c : s) {
            if (c == '"') buf_ += "\\\"";
            else if (c == '\\') buf_ += "\\\\";
            else if (c == '\n') buf_ += "\\n";
            else if (c == '\r') buf_ += "\\r";
            else if (c == '\t') buf_ += "\\t";
            else buf_ += c;
        }
    }
    std::string buf_;
};

inline std::string unescape(std::string_view s) {
    std::string r; r.reserve(s.size());
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '\\' && i+1 < s.size()) { ++i;
            if (s[i] == 'n') r += '\n';
            else if (s[i] == 'r') r += '\r';
            else if (s[i] == 't') r += '\t';
            else if (s[i] == 'u' && i+4 < s.size()) { i += 4; r += '?'; }
            else r += s[i];
        } else r += s[i];
    }
    return r;
}

}}
