#include "httplib.h"
#include "server/routes.h"
#include <cstdio>

int main() {
    httplib::Server svr;
    rpg::Routes routes;

    // CORS preflight handler
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204;
    });

    // API routes
    svr.Post("/api/message", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_message(req, res);
    });

    svr.Get("/api/player", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_player(req, res);
    });

    svr.Post("/api/player/note", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_add_note(req, res);
    });

    svr.Post("/api/campaign/new", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_new_campaign(req, res);
    });

    svr.Get("/api/history", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_history(req, res);
    });

    // Serve React build files
    svr.set_mount_point("/", "./frontend/dist");

    printf("Claude RPG Server running at http://localhost:8080\n");
    printf("Make sure ANTHROPIC_API_KEY is set!\n");

    svr.listen("0.0.0.0", 8080);

    return 0;
}
