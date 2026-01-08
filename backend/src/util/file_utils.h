#pragma once
#include <string>
#include <fstream>
#include <sstream>

namespace rpg { namespace file {

inline std::string read_file(const std::string& path) {
    std::ifstream f(path);
    if (!f) return {};
    std::stringstream ss;
    ss << f.rdbuf();
    return ss.str();
}

inline bool write_file(const std::string& path, const std::string& content) {
    std::ofstream f(path);
    if (!f) return false;
    f << content;
    return true;
}

inline bool file_exists(const std::string& path) {
    std::ifstream f(path);
    return f.good();
}

}}
