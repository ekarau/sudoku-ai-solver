#pragma once

#include "includes.hpp"
#include "db.hpp"

namespace stats
{
    struct Bucket
    {
        int wins;
        int losses;
        std::optional<int> best_time;
    };

    struct StatsRow
    {
        int         difficulty;
        std::string mode;
        Bucket      bucket;
    };

    struct MatchEntry
    {
        std::string opponent;
        int         difficulty;
        std::string mode;
        std::string result;
        std::optional<int> time_seconds;
        std::string played_at;
    };

    struct LeaderboardEntry
    {
        long long   user_id;
        std::string username;
        int         wins;
        int         losses;
        int         games;
        double      winrate;
        double      score;
    };

    struct WeeklyResetInfo
    {
        std::string period_start;
        std::string next_reset_at;
    };

    struct AchievementEntry
    {
        long long    id;
        std::string  type;
        std::string  name;
        std::string  icon;
        std::string  description;
        std::string  earned_at;
        int          progress;
        int          target;
    };

    Bucket record_result(long long user_id,
                         const std::string &username,
                         int difficulty,
                         const std::string &mode,
                         const std::string &result,
                         std::optional<int> time_sec,
                         const std::string &opponent);

    std::vector<StatsRow>   get_user_stats_by_id(long long user_id);
    std::vector<StatsRow>   get_user_diff_stats_by_id(long long user_id, int difficulty);
    std::vector<MatchEntry> get_match_history_by_id(long long user_id, int limit);
    std::vector<AchievementEntry> get_user_achievements_by_id(long long user_id);

    std::vector<StatsRow>   get_user_stats(const std::string &username);
    std::vector<StatsRow>   get_user_diff_stats(const std::string &username, int difficulty);
    std::vector<MatchEntry> get_match_history(const std::string &username, int limit);
    std::vector<LeaderboardEntry> get_leaderboard(std::optional<int> difficulty, int limit, bool weekly = false);
    WeeklyResetInfo get_weekly_reset_info();
    std::vector<AchievementEntry> get_user_achievements(const std::string &username);
}
