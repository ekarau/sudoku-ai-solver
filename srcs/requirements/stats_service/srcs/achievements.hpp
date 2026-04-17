#pragma once

#include <string>
#include <vector>
#include <optional>
#include <pqxx/pqxx>

namespace stats
{
    struct AchievementCheck
    {
        std::string achievement_type;
        bool unlocked;
        long long user_id;
        std::string username;
    };

    class AchievementChecker
    {
    private:
        pqxx::connection& conn;

    public:
        explicit AchievementChecker(pqxx::connection& db) : conn(db) {}

        // Time limits for speedster achievements (in seconds)
        static constexpr int SPEEDSTER_EASY = 120;      // 2 minutes
        static constexpr int SPEEDSTER_MEDIUM = 240;    // 4 minutes
        static constexpr int SPEEDSTER_HARD = 360;      // 6 minutes
        static constexpr int SPEEDSTER_EXPERT = 480;    // 8 minutes
        static constexpr int SPEEDSTER_EXTREME = 600;   // 10 minutes

        // Win requirements
        static constexpr int GRADUATE_MIN_WINS = 20;    // 20 wins per difficulty

        // Streak requirements
        static constexpr int ON_FIRE_5X = 5;
        static constexpr int ON_FIRE_10X = 10;
        static constexpr int ON_FIRE_25X = 25;

        /**
         * Check all achievements for a user after a game result
         */
        std::vector<AchievementCheck> check_achievements(
            long long user_id,
            const std::string &username,
            int difficulty,
            const std::string &mode,
            const std::string &result,
            std::optional<int> time_sec
        );

    private:
        // Helper functions
        bool check_first_win_online(long long user_id);
        bool check_speedster(int difficulty, std::optional<int> time_sec);
        bool check_graduate(long long user_id, const std::string &mode);
        bool check_star_leaderboard(long long user_id);
        bool check_king(long long user_id, int difficulty);

        // Utility
        int get_current_streak(long long user_id);
    };
}
