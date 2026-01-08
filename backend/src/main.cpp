#include "httplib.h"
#include "server/routes.h"
#include <cstdio>

int main() {
    httplib::Server svr;
    rpg::Routes routes;

    // CORS preflight handler
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204;
    });

    // Game messaging
    svr.Post("/api/message", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_message(req, res);
    });

    svr.Get("/api/history", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_history(req, res);
    });

    // Player
    svr.Get("/api/player", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_player(req, res);
    });

    svr.Put("/api/player", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_update_player(req, res);
    });

    svr.Post("/api/player/note", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_add_note(req, res);
    });

    svr.Post("/api/player/image", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_player_image(req, res);
    });

    // Campaign
    svr.Post("/api/campaign/new", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_new_campaign(req, res);
    });

    // Characters CRUD
    svr.Get("/api/characters", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_characters(req, res);
    });

    svr.Get(R"(/api/characters/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_character(req, res);
    });

    svr.Post("/api/characters", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_create_character(req, res);
    });

    svr.Put(R"(/api/characters/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_update_character(req, res);
    });

    svr.Delete(R"(/api/characters/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_delete_character(req, res);
    });

    // Locations CRUD
    svr.Get("/api/locations", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_locations(req, res);
    });

    svr.Get(R"(/api/locations/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_location(req, res);
    });

    svr.Post("/api/locations", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_create_location(req, res);
    });

    svr.Put(R"(/api/locations/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_update_location(req, res);
    });

    svr.Delete(R"(/api/locations/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_delete_location(req, res);
    });

    // AI Generation
    svr.Post("/api/generate/character", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_generate_character(req, res);
    });

    svr.Post("/api/generate/location", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_generate_location(req, res);
    });

    svr.Post("/api/generate/image", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_generate_image(req, res);
    });

    // Image serving
    svr.Get(R"(/api/images/([^/]+)/([^/]+))", [&routes](const httplib::Request& req, httplib::Response& res) {
        routes.handle_get_image(req, res);
    });

    // Serve React build files
    svr.set_mount_point("/", "./frontend/dist");

    printf("Claude RPG Server running at http://localhost:8080\n");
    printf("Make sure ANTHROPIC_API_KEY and GEMINI_API_KEY are set!\n");

    svr.listen("0.0.0.0", 8080);

    return 0;
}
