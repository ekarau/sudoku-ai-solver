#include "includes.hpp"
#include "db.hpp"
#include "repository.hpp"
#include "json_utils.hpp"

static bool valid_mode(const std::string &m)
{
    return (m == "online" || m == "offline");
}

static bool valid_result(const std::string &r)
{
    return (r == "win" || r == "lose");
}

static bool valid_diff(int d)
{
    return (d >= 1 && d <= 5);
}

static std::optional<int> mode_to_diff(const std::string &mode)
{
    if (mode == "Total")
        return std::nullopt;
    if (mode == "Easy")
        return 1;
    if (mode == "Medium")
        return 2;
    if (mode == "Hard")
        return 3;
    if (mode == "Expert")
        return 4;
    if (mode == "Extreme")
        return 5;
    return std::nullopt;
}

// Static list of all achievements with metadata
struct AchievementMetadata {
    std::string type;
    std::string name;
    std::string icon;
    std::string description;
    int target;
};

static const std::vector<AchievementMetadata> ALL_ACHIEVEMENTS = {
    {"first_win_online", "First Win", "🥇", "Unlocks when you win your first online match.", 1},
    {"speedster_easy", "Speedster I", "⚡", "Unlocks when you finish Easy in 2 minutes or less.", 1},
    {"speedster_medium", "Speedster II", "⚡", "Unlocks when you finish Medium in 4 minutes or less.", 1},
    {"speedster_hard", "Speedster III", "⚡", "Unlocks when you finish Hard in 6 minutes or less.", 1},
    {"speedster_expert", "Speedster IV", "⚡", "Unlocks when you finish Expert in 8 minutes or less.", 1},
    {"speedster_extreme", "Speedster V", "⚡", "Unlocks when you finish Extreme in 10 minutes or less.", 1},
    {"on_fire_5x", "Win Streak I", "🔥", "Unlocks when you reach a 5-win streak.", 5},
    {"on_fire_10x", "Win Streak II", "🔥", "Unlocks when you reach a 10-win streak.", 10},
    {"on_fire_25x", "Win Streak III", "🔥", "Unlocks when you reach a 25-win streak.", 25},
    {"graduate_offline", "Graduate Offline", "🎓", "Unlocks with 20+ wins in all difficulties in Offline mode.", 5},
    {"graduate_online", "Graduate Online", "🎓", "Unlocks with 20+ wins in all difficulties in Online mode.", 5},
    {"star", "Star", "⭐", "Unlocks when you enter Top 50 in the online leaderboard.", 50},
    {"king_easy", "King I", "👑", "Unlocks by reaching Rank #1 on Easy leaderboard.", 1},
    {"king_medium", "King II", "👑", "Unlocks by reaching Rank #1 on Medium leaderboard.", 1},
    {"king_hard", "King III", "👑", "Unlocks by reaching Rank #1 on Hard leaderboard.", 1},
    {"king_expert", "King IV", "👑", "Unlocks by reaching Rank #1 on Expert leaderboard.", 1},
    {"king_extreme", "King V", "👑", "Unlocks by reaching Rank #1 on Extreme leaderboard.", 1}
};

int main()
{
    if (!stats::init_db(10, 2000))
    {
        std::cerr << "stats_service: db init failed\n";
        return 1;
    }

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/stats/healthz")
    ([]()
    {
        crow::json::wvalue j;
        j["status"] = "ok";
        return crow::response(j);
    });

    CROW_ROUTE(app, "/api/stats/report").methods(crow::HTTPMethod::POST)
    ([](const crow::request &req)
    {
        auto body = crow::json::load(req.body);
        if (!body)
            return stats::make_error(400, "invalid json");

        if (!body.has("user_id") || !body.has("username") || !body.has("difficulty")
            || !body.has("mode") || !body.has("result"))
            return stats::make_error(400, "missing fields");

        long long   user_id  = body["user_id"].i();
        std::string username = body["username"].s();
        int         diff     = body["difficulty"].i();
        std::string mode     = body["mode"].s();
        std::string result   = body["result"].s();

        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");
        if (username.empty())
            return stats::make_error(400, "username empty");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");
        if (!valid_mode(mode))
            return stats::make_error(400, "mode must be online/offline");
        if (!valid_result(result))
            return stats::make_error(400, "result must be win/lose");

        std::optional<int> time_sec = std::nullopt;
        if (body.has("time_seconds"))
            time_sec = body["time_seconds"].i();

        if (mode == "offline" && result == "win" && !time_sec.has_value())
            return stats::make_error(400, "time_seconds required for offline win");

        std::string opponent;
        if (body.has("opponent"))
            opponent = body["opponent"].s();

        stats::Bucket b = stats::record_result(user_id, username, diff, mode, result, time_sec, opponent);

        crow::json::wvalue out;
        out["user_id"]    = static_cast<int>(user_id);
        out["username"]   = username;
        out["difficulty"] = diff;
        out["mode"]       = mode;
        out["bucket"]     = stats::bucket_to_json(b);
        return crow::response(200, out);
    });

    CROW_ROUTE(app, "/api/stats/<string>/history")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");

        auto entries = stats::get_match_history(username, 20);
        return crow::response(200, stats::history_to_json(username, entries));
    });

    CROW_ROUTE(app, "/api/stats/leaderboard/<string>")
    ([](const crow::request &req, const std::string &mode)
    {
        if (mode != "Total" && mode != "Easy" && mode != "Medium"
            && mode != "Hard" && mode != "Expert" && mode != "Extreme")
            return stats::make_error(400, "mode must be Total/Easy/Medium/Hard/Expert/Extreme");

        std::string scope = "alltime";
        if (req.url_params.get("scope"))
            scope = req.url_params.get("scope");

        if (scope != "alltime" && scope != "weekly")
            return stats::make_error(400, "scope must be alltime/weekly");

        bool weekly = (scope == "weekly");

        int limit = 100;
        if (req.url_params.get("limit"))
        {
            std::string limit_str = req.url_params.get("limit");
            try
            {
                limit = std::stoi(limit_str);
            }
            catch (...)
            {
                return stats::make_error(400, "limit must be a number");
            }

            if (limit < 0)
                return stats::make_error(400, "limit must be >= 0");
        }

        std::optional<int> diff = mode_to_diff(mode);
        auto entries = stats::get_leaderboard(diff, limit, weekly);

        crow::json::wvalue out;
        out["mode"] = mode;
        out["scope"] = scope;
        out["count"] = static_cast<int>(entries.size());

        if (weekly)
        {
            stats::WeeklyResetInfo info = stats::get_weekly_reset_info();
            out["period_start"] = info.period_start;
            out["next_reset_at"] = info.next_reset_at;
        }

        std::vector<crow::json::wvalue> arr;
        arr.reserve(entries.size());
        for (const auto &e : entries)
        {
            crow::json::wvalue row;
            row["user_id"] = static_cast<int>(e.user_id);
            row["username"] = e.username;
            row["display_name"] = e.username;
            row["wins"] = e.wins;
            row["losses"] = e.losses;
            row["games"] = e.games;
            row["winrate"] = e.winrate;
            row["score"] = e.score;
            arr.push_back(std::move(row));
        }

        out["data"] = std::move(arr);
        return crow::response(200, out);
    });

    CROW_ROUTE(app, "/api/stats/id/<int>/history")
    ([](int user_id)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");

        auto entries = stats::get_match_history_by_id(user_id, 20);
        return crow::response(200, stats::history_to_json(std::to_string(user_id), entries));
    });

    CROW_ROUTE(app, "/api/stats/achievements/id/<int>")
    ([](int user_id)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");

        try {
            auto earned = stats::get_user_achievements_by_id(user_id);
            std::map<std::string, stats::AchievementEntry> earned_map;
            for (const auto& a : earned) {
                earned_map.emplace(a.type, a);
            }

            pqxx::connection conn(stats::get_conn_string());
            pqxx::work tx(conn);

            crow::json::wvalue out;
            out["user_id"] = user_id;
            
            std::vector<crow::json::wvalue> arr;
            int earned_count = 0;

            for (const auto& meta : ALL_ACHIEVEMENTS) {
                int progress = 0;
                int target = meta.target;

                if (earned_map.find(meta.type) == earned_map.end()) {
                    try {
                        if (meta.type == "first_win_online") {
                            pqxx::result res = tx.exec_params(
                                "SELECT SUM(wins) FROM player_stats WHERE user_id=$1 AND mode='online'",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_easy") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=1 AND time_seconds < 120 AND result='win'",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_medium") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=2 AND time_seconds < 240 AND result='win'",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_hard") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=3 AND time_seconds < 360 AND result='win'",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_expert") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=4 AND time_seconds < 480 AND result='win'",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_extreme") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE user_id=$1 AND difficulty=5 AND time_seconds < 600 AND result='win'",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "on_fire_5x" || meta.type == "on_fire_10x" || meta.type == "on_fire_25x") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COALESCE(current_streak, 0) FROM online_win_streaks WHERE user_id=$1",
                                user_id);
                            int current_streak = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            if (meta.type == "on_fire_5x") progress = std::min(current_streak, 5);
                            else if (meta.type == "on_fire_10x") progress = std::min(current_streak, 10);
                            else if (meta.type == "on_fire_25x") progress = std::min(current_streak, 25);
                        }
                        else if (meta.type == "graduate_offline") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(DISTINCT difficulty) FROM player_stats WHERE user_id=$1 AND mode='offline' AND wins >= 20",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 5);
                        }
                        else if (meta.type == "graduate_online") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(DISTINCT difficulty) FROM player_stats WHERE user_id=$1 AND mode='online' AND wins >= 20",
                                user_id);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 5);
                        }
                        else if (meta.type == "star") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM weekly_player_stats WHERE mode='online' AND wins > (SELECT COALESCE(MAX(wins),0) FROM weekly_player_stats WHERE user_id=$1 AND mode='online')",
                                user_id);
                            int rank = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() + 1 : 1000;
                            progress = std::max(0, 51 - rank);
                            progress = std::min(progress, 50);
                        }
                    } catch (const std::exception& e) {
                        std::cerr << "Error calculating progress for " << meta.type << ": " << e.what() << std::endl;
                        progress = 0;
                    }
                }
                
                crow::json::wvalue row;
                row["type"] = meta.type;
                row["name"] = meta.name;
                row["icon"] = meta.icon;
                row["description"] = meta.description;
                row["progress"] = progress;
                row["target"] = target;

                if (earned_map.find(meta.type) != earned_map.end()) {
                    const auto& e = earned_map[meta.type];
                    row["id"] = e.id;
                    row["earned_at"] = e.earned_at;
                    row["progress"] = 100;
                    row["target"] = 100;
                    earned_count++;
                }

                arr.push_back(std::move(row));
            }

            tx.commit();

            out["total"] = static_cast<int>(ALL_ACHIEVEMENTS.size());
            out["earned"] = earned_count;
            out["achievements"] = std::move(arr);
            return crow::response(200, out);
        } catch (const std::exception& e) {
            return stats::make_error(500, std::string("Error fetching achievements: ") + e.what());
        }
    });

    CROW_ROUTE(app, "/api/stats/id/<int>/<int>")
    ([](int user_id, int diff)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");

        auto rows = stats::get_user_diff_stats_by_id(user_id, diff);
        return crow::response(200, stats::stats_to_json(std::to_string(user_id), rows));
    });

    CROW_ROUTE(app, "/api/stats/id/<int>")
    ([](int user_id)
    {
        if (user_id <= 0)
            return stats::make_error(400, "user_id must be > 0");

        auto rows = stats::get_user_stats_by_id(user_id);
        return crow::response(200, stats::stats_to_json(std::to_string(user_id), rows));
    });

    CROW_ROUTE(app, "/api/stats/achievements/<string>")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");

        try {
            // Get earned achievements
            auto earned = stats::get_user_achievements(username);
            std::map<std::string, stats::AchievementEntry> earned_map;
            for (const auto& a : earned) {
                earned_map.emplace(a.type, a);
            }

            pqxx::connection conn(stats::get_conn_string());
            pqxx::work tx(conn);

            crow::json::wvalue out;
            out["username"] = username;
            
            std::vector<crow::json::wvalue> arr;
            int earned_count = 0;

            // Return all achievements with progress
            for (const auto& meta : ALL_ACHIEVEMENTS) {
                int progress = 0;
                int target = meta.target;

                // Calculate progress for locked achievements
                if (earned_map.find(meta.type) == earned_map.end()) {
                    // Only calculate progress for achievements not yet earned
                    try {
                        if (meta.type == "first_win_online") {
                            pqxx::result res = tx.exec_params(
                                "SELECT SUM(wins) FROM player_stats WHERE username=$1 AND mode='online'",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_easy") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE username=$1 AND difficulty=1 AND time_seconds < 120 AND result='win'",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_medium") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE username=$1 AND difficulty=2 AND time_seconds < 240 AND result='win'",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_hard") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE username=$1 AND difficulty=3 AND time_seconds < 360 AND result='win'",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_expert") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE username=$1 AND difficulty=4 AND time_seconds < 480 AND result='win'",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "speedster_extreme") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM match_history WHERE username=$1 AND difficulty=5 AND time_seconds < 600 AND result='win'",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 1);
                        }
                        else if (meta.type == "on_fire_5x" || meta.type == "on_fire_10x" || meta.type == "on_fire_25x") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COALESCE(current_streak, 0) FROM online_win_streaks WHERE username=$1",
                                username);
                            int current_streak = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            if (meta.type == "on_fire_5x") progress = std::min(current_streak, 5);
                            else if (meta.type == "on_fire_10x") progress = std::min(current_streak, 10);
                            else if (meta.type == "on_fire_25x") progress = std::min(current_streak, 25);
                        }
                        else if (meta.type == "graduate_offline") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(DISTINCT difficulty) FROM player_stats WHERE username=$1 AND mode='offline' AND wins >= 20",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 5);
                        }
                        else if (meta.type == "graduate_online") {
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(DISTINCT difficulty) FROM player_stats WHERE username=$1 AND mode='online' AND wins >= 20",
                                username);
                            progress = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() : 0;
                            progress = std::min(progress, 5);
                        }
                        else if (meta.type == "star") {
                            // Simple leaderboard rank check
                            pqxx::result res = tx.exec_params(
                                "SELECT COUNT(*) FROM weekly_player_stats WHERE mode='online' AND wins > (SELECT MAX(wins) FROM weekly_player_stats WHERE username=$1 AND mode='online')",
                                username);
                            int rank = (!res.empty() && !res[0][0].is_null()) ? res[0][0].as<int>() + 1 : 1000;
                            progress = std::max(0, 51 - rank);
                            progress = std::min(progress, 50);
                        }
                    } catch (const std::exception& e) {
                        std::cerr << "Error calculating progress for " << meta.type << ": " << e.what() << std::endl;
                        progress = 0;
                    }
                }
                
                crow::json::wvalue row;
                row["type"] = meta.type;
                row["name"] = meta.name;
                row["icon"] = meta.icon;
                row["description"] = meta.description;
                row["progress"] = progress;
                row["target"] = target;

                // Check if earned
                if (earned_map.find(meta.type) != earned_map.end()) {
                    const auto& e = earned_map[meta.type];
                    row["id"] = e.id;
                    row["earned_at"] = e.earned_at;
                    row["progress"] = 100;  // Earned achievements show 100%
                    row["target"] = 100;
                    earned_count++;
                }

                arr.push_back(std::move(row));
            }

            tx.commit();

            out["total"] = static_cast<int>(ALL_ACHIEVEMENTS.size());
            out["earned"] = earned_count;
            out["achievements"] = std::move(arr);
            return crow::response(200, out);
        } catch (const std::exception& e) {
            return stats::make_error(500, std::string("Error fetching achievements: ") + e.what());
        }
    });

    CROW_ROUTE(app, "/api/stats/<string>/<int>")
    ([](const std::string &username, int diff)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");
        if (!valid_diff(diff))
            return stats::make_error(400, "difficulty must be 1..5");

        auto rows = stats::get_user_diff_stats(username, diff);
        return crow::response(200, stats::stats_to_json(username, rows));
    });

    CROW_ROUTE(app, "/api/stats/<string>")
    ([](const std::string &username)
    {
        if (username.empty())
            return stats::make_error(400, "username empty");

        auto rows = stats::get_user_stats(username);
        return crow::response(200, stats::stats_to_json(username, rows));
    });

    app.port(8090).multithreaded().run();
    return 0;
}
