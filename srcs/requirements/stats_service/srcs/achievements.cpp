#include "achievements.hpp"
#include <iostream>

namespace stats
{
    std::vector<AchievementCheck> AchievementChecker::check_achievements(
        long long user_id,
        const std::string &username,
        int difficulty,
        const std::string &mode,
        const std::string &result,
        std::optional<int> time_sec)
    {
        std::vector<AchievementCheck> achievements;

        // Only check for wins
        if (result != "win")
            return achievements;

        // 1) First Win (sadece online)
        if (mode == "online")
        {
            bool is_first_online_win = check_first_win_online(user_id);
            if (is_first_online_win)
            {
                achievements.push_back({"first_win_online", true, user_id, username});
            }
        }

        // 2) Speedster (süreye bağlı)
        if (time_sec.has_value())
        {
            bool is_speedster = check_speedster(difficulty, time_sec);
            if (is_speedster)
            {
                if (difficulty == 1)
                    achievements.push_back({"speedster_easy", true, user_id, username});
                else if (difficulty == 2)
                    achievements.push_back({"speedster_medium", true, user_id, username});
                else if (difficulty == 3)
                    achievements.push_back({"speedster_hard", true, user_id, username});
                else if (difficulty == 4)
                    achievements.push_back({"speedster_expert", true, user_id, username});
                else if (difficulty == 5)
                    achievements.push_back({"speedster_extreme", true, user_id, username});
            }
        }

        // 3) On Fire serisi (sadece online)
        if (mode == "online")
        {
            int current_streak = get_current_streak(user_id);
            
            if (current_streak >= ON_FIRE_25X)
                achievements.push_back({"on_fire_25x", true, user_id, username});
            else if (current_streak >= ON_FIRE_10X)
                achievements.push_back({"on_fire_10x", true, user_id, username});
            else if (current_streak >= ON_FIRE_5X)
                achievements.push_back({"on_fire_5x", true, user_id, username});
        }

        // 4) Graduate (tüm zorluklarda 20+ win)
        if (mode == "offline")
        {
            bool offline_graduate = check_graduate(user_id, "offline");
            if (offline_graduate)
            {
                achievements.push_back({"graduate_offline", true, user_id, username});
            }
        }

        if (mode == "online")
        {
            bool online_graduate = check_graduate(user_id, "online");
            if (online_graduate)
            {
                achievements.push_back({"graduate_online", true, user_id, username});
            }
        }

        // 5) Star (ilk 50'ye girdiyse)
        bool is_star = check_star_leaderboard(user_id);
        if (is_star)
            achievements.push_back({"star", true, user_id, username});

        // 6) King (o zorlukta #1)
        bool is_king = check_king(user_id, difficulty);
        if (is_king)
        {
            if (difficulty == 1)
                achievements.push_back({"king_easy", true, user_id, username});
            else if (difficulty == 2)
                achievements.push_back({"king_medium", true, user_id, username});
            else if (difficulty == 3)
                achievements.push_back({"king_hard", true, user_id, username});
            else if (difficulty == 4)
                achievements.push_back({"king_expert", true, user_id, username});
            else if (difficulty == 5)
                achievements.push_back({"king_extreme", true, user_id, username});
        }

        return achievements;
    }

    bool AchievementChecker::check_first_win_online(long long user_id)
    {
        try
        {
            pqxx::work tx(conn);
            pqxx::result res = tx.exec_params(
                "SELECT SUM(wins) FROM player_stats WHERE user_id=$1 AND mode='online'",
                user_id);
            tx.commit();

            if (!res.empty() && !res[0][0].is_null())
            {
                int total_wins = res[0][0].as<int>();
                return total_wins == 1; // First win
            }
            return false;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking first win: " << e.what() << std::endl;
            return false;
        }
    }

    bool AchievementChecker::check_speedster(int difficulty, std::optional<int> time_sec)
    {
        if (!time_sec.has_value())
            return false;

        int player_time = time_sec.value();

        if (difficulty == 1)
            return player_time < SPEEDSTER_EASY;
        if (difficulty == 2)
            return player_time < SPEEDSTER_MEDIUM;
        if (difficulty == 3)
            return player_time < SPEEDSTER_HARD;
        if (difficulty == 4)
            return player_time < SPEEDSTER_EXPERT;
        if (difficulty == 5)
            return player_time < SPEEDSTER_EXTREME;

        return false;
    }

    bool AchievementChecker::check_graduate(long long user_id, const std::string &mode)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Check if has 20+ wins in ALL difficulties
            pqxx::result res = tx.exec_params(
                "SELECT difficulty, SUM(wins) as total_wins "
                "FROM player_stats "
                "WHERE user_id=$1 AND mode=$2 "
                "GROUP BY difficulty",
                user_id, mode);
            
            tx.commit();

            bool has_easy = false;
            bool has_medium = false;
            bool has_hard = false;
            bool has_expert = false;
            bool has_extreme = false;

            for (const auto &row : res)
            {
                int diff = row[0].as<int>();
                int wins = row[1].as<int>();

                if (wins >= GRADUATE_MIN_WINS)
                {
                    if (diff == 1)
                        has_easy = true;
                    else if (diff == 2)
                        has_medium = true;
                    else if (diff == 3)
                        has_hard = true;
                    else if (diff == 4)
                        has_expert = true;
                    else if (diff == 5)
                        has_extreme = true;
                }
            }

            // Tüm zorluklar tamamlanmalı
            return has_easy && has_medium && has_hard && has_expert && has_extreme;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking graduate: " << e.what() << std::endl;
            return false;
        }
    }

    int AchievementChecker::get_current_streak(long long user_id)
    {
        try
        {
            pqxx::work tx(conn);

            pqxx::result streak_res = tx.exec_params(
                "SELECT current_streak FROM online_win_streaks WHERE user_id=$1",
                user_id);

            if (!streak_res.empty() && !streak_res[0][0].is_null())
            {
                int streak = streak_res[0][0].as<int>();
                tx.commit();
                return streak;
            }
            
            pqxx::result res = tx.exec_params(
                "SELECT result FROM match_history "
                "WHERE user_id=$1 AND mode='online' "
                "ORDER BY played_at DESC, id DESC",
                user_id);
            
            tx.commit();

            int streak = 0;
            for (const auto &row : res)
            {
                std::string result = row[0].as<std::string>();
                if (result == "win")
                    streak++;
                else
                    break;
            }

            return streak;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error getting streak: " << e.what() << std::endl;
            return 0;
        }
    }

    bool AchievementChecker::check_star_leaderboard(long long user_id)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Check if user appears in top 50 of global online leaderboard
            pqxx::result res = tx.exec_params(
                "SELECT COUNT(*) FROM ("
                "  SELECT user_id, SUM(wins) as total_wins FROM player_stats "
                "  WHERE mode='online' GROUP BY user_id "
                "  ORDER BY total_wins DESC LIMIT 50"
                ") AS top_50 WHERE user_id=$1",
                user_id);
            
            tx.commit();

            return res[0][0].as<int>() > 0;
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking leaderboard: " << e.what() << std::endl;
            return false;
        }
    }

    bool AchievementChecker::check_king(long long user_id, int difficulty)
    {
        try
        {
            pqxx::work tx(conn);
            
            // Check if user is rank #1 in this difficulty
            pqxx::result res = tx.exec_params(
                "SELECT user_id FROM ("
                "  SELECT user_id, SUM(wins) as total_wins FROM player_stats "
                "  WHERE difficulty=$1 AND mode='online' "
                "  GROUP BY user_id ORDER BY total_wins DESC LIMIT 1"
                ") AS top_player WHERE user_id=$2",
                difficulty, user_id);
            
            tx.commit();

            return !res.empty();
        }
        catch (const std::exception &e)
        {
            std::cerr << "Error checking king: " << e.what() << std::endl;
            return false;
        }
    }
}
