#include "db.hpp"
#include <chrono>
#include <thread>

namespace stats
{
    static std::string get_env(const char *key)
    {
        const char *val = std::getenv(key);
        if (!val || val[0] == '\0') {
            std::cerr << "CRITICAL ERROR: Environment variable " << key << " is not set!\n";
            std::exit(1);
        }
        return val;
    }
 
    std::string get_conn_string()
    {
        std::string host = get_env("STATS_DB_HOST");
        std::string port = get_env("STATS_DB_PORT");
        std::string db   = get_env("STATS_DB_NAME");
        std::string user = get_env("STATS_DB_USER");
        std::string pass = get_env("STATS_DB_PASS");

        return "host=" + host
             + " port=" + port
             + " dbname=" + db
             + " user=" + user
             + " password=" + pass;
    }

    static void create_tables()
    {
        pqxx::connection conn(get_conn_string());
        pqxx::work tx(conn);

        tx.exec(
            "CREATE TABLE IF NOT EXISTS player_stats ("
            "  id             BIGSERIAL PRIMARY KEY,"
            "  user_id         BIGINT,"
            "  username        TEXT NOT NULL,"
            "  difficulty      INT  NOT NULL,"
            "  mode            TEXT NOT NULL,"
            "  wins            INT  NOT NULL DEFAULT 0,"
            "  losses          INT  NOT NULL DEFAULT 0,"
            "  best_time_seconds INT,"
            "  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),"
            "  UNIQUE(user_id, difficulty, mode)"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_ps_username "
            "ON player_stats(username)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS match_history ("
            "  id              BIGSERIAL PRIMARY KEY,"
            "  user_id          BIGINT,"
            "  username         TEXT NOT NULL,"
            "  opponent         TEXT,"
            "  difficulty       INT  NOT NULL,"
            "  mode             TEXT NOT NULL,"
            "  result           TEXT NOT NULL,"
            "  time_seconds     INT,"
            "  played_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_mh_username "
            "ON match_history(username)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS weekly_player_stats ("
            "  id              BIGSERIAL PRIMARY KEY,"
            "  user_id         BIGINT,"
            "  username        TEXT NOT NULL,"
            "  difficulty      INT  NOT NULL,"
            "  mode            TEXT NOT NULL,"
            "  wins            INT  NOT NULL DEFAULT 0,"
            "  losses          INT  NOT NULL DEFAULT 0,"
            "  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),"
            "  UNIQUE(user_id, difficulty, mode)"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_wps_mode_diff "
            "ON weekly_player_stats(mode, difficulty)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS leaderboard_reset_meta ("
            "  id            INT PRIMARY KEY,"
            "  period_start  TIMESTAMPTZ NOT NULL,"
            "  next_reset_at TIMESTAMPTZ NOT NULL"
            ")"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS user_achievements ("
            "  id                BIGSERIAL PRIMARY KEY,"
            "  user_id           BIGINT,"
            "  username          TEXT NOT NULL,"
            "  achievement_type  TEXT NOT NULL,"
            "  name              TEXT NOT NULL,"
            "  icon              TEXT NOT NULL,"
            "  description       TEXT NOT NULL,"
            "  earned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),"
            "  UNIQUE(user_id, achievement_type)"
            ")"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_ua_username_earned_at "
            "ON user_achievements(username, earned_at DESC)"
        );

        tx.exec(
            "CREATE TABLE IF NOT EXISTS online_win_streaks ("
            "  id             BIGSERIAL PRIMARY KEY,"
            "  user_id        BIGINT UNIQUE,"
            "  username       TEXT,"
            "  current_streak INT NOT NULL DEFAULT 0,"
            "  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()"
            ")"
        );

        tx.exec("ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS user_id BIGINT");
        tx.exec("ALTER TABLE match_history ADD COLUMN IF NOT EXISTS user_id BIGINT");
        tx.exec("ALTER TABLE weekly_player_stats ADD COLUMN IF NOT EXISTS user_id BIGINT");
        tx.exec("ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS user_id BIGINT");
        tx.exec("ALTER TABLE online_win_streaks ADD COLUMN IF NOT EXISTS user_id BIGINT");
        tx.exec("ALTER TABLE online_win_streaks ADD COLUMN IF NOT EXISTS id BIGSERIAL");

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_ps_user_id "
            "ON player_stats(user_id)"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_mh_user_id "
            "ON match_history(user_id)"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_wps_user_id "
            "ON weekly_player_stats(user_id)"
        );

        tx.exec(
            "CREATE INDEX IF NOT EXISTS idx_ua_user_id_earned_at "
            "ON user_achievements(user_id, earned_at DESC)"
        );

        tx.exec("ALTER TABLE player_stats DROP CONSTRAINT IF EXISTS player_stats_username_difficulty_mode_key");
        tx.exec("ALTER TABLE weekly_player_stats DROP CONSTRAINT IF EXISTS weekly_player_stats_username_difficulty_mode_key");
        tx.exec("ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_username_achievement_type_key");

        tx.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_ps_userid_diff_mode_unique ON player_stats(user_id, difficulty, mode)");
        tx.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_wps_userid_diff_mode_unique ON weekly_player_stats(user_id, difficulty, mode)");
        tx.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_ua_userid_achievement_unique ON user_achievements(user_id, achievement_type)");

        tx.exec("ALTER TABLE online_win_streaks DROP CONSTRAINT IF EXISTS online_win_streaks_pkey");
        tx.exec("ALTER TABLE online_win_streaks ADD CONSTRAINT online_win_streaks_pkey PRIMARY KEY (id)");
        tx.exec("ALTER TABLE online_win_streaks DROP CONSTRAINT IF EXISTS online_win_streaks_user_id_key");
        tx.exec("ALTER TABLE online_win_streaks ADD CONSTRAINT online_win_streaks_user_id_key UNIQUE (user_id)");

        tx.exec(
            "INSERT INTO leaderboard_reset_meta (id, period_start, next_reset_at) "
            "VALUES (1, date_trunc('week', NOW()), date_trunc('week', NOW()) + INTERVAL '7 days') "
            "ON CONFLICT (id) DO NOTHING"
        );

        tx.exec(
            "UPDATE player_stats ps "
            "SET best_time_seconds = src.min_time "
            "FROM ("
            "  SELECT user_id, difficulty, mode, MIN(time_seconds) AS min_time "
            "  FROM match_history "
            "  WHERE result = 'win' AND time_seconds IS NOT NULL AND user_id IS NOT NULL "
            "  GROUP BY user_id, difficulty, mode"
            ") src "
            "WHERE ps.user_id = src.user_id "
            "  AND ps.difficulty = src.difficulty "
            "  AND ps.mode = src.mode "
            "  AND (ps.best_time_seconds IS NULL OR src.min_time < ps.best_time_seconds)"
        );

        tx.exec(
            "INSERT INTO online_win_streaks (user_id, username, current_streak, updated_at) "
            "WITH ordered AS ("
            "  SELECT user_id, username, result, "
            "         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY played_at DESC, id DESC) AS rn "
            "  FROM match_history "
            "  WHERE mode='online' AND user_id IS NOT NULL"
            "), first_non_win AS ("
            "  SELECT user_id, "
            "         COALESCE(MIN(rn) FILTER (WHERE result <> 'win'), 2147483647) AS stop_rn "
            "  FROM ordered "
            "  GROUP BY user_id"
            "), current_streaks AS ("
            "  SELECT o.user_id, MAX(o.username) AS username, COUNT(*) AS streak "
            "  FROM ordered o "
            "  JOIN first_non_win f ON f.user_id = o.user_id "
            "  WHERE o.result = 'win' AND o.rn < f.stop_rn "
            "  GROUP BY o.user_id"
            ")"
            "SELECT user_id, username, streak, NOW() FROM current_streaks "
            "ON CONFLICT (user_id) DO UPDATE SET "
            "  username = EXCLUDED.username, "
            "  current_streak = EXCLUDED.current_streak, "
            "  updated_at = NOW()"
        );

        tx.commit();
    }

    bool init_db(int retries, int wait_ms)
    {
        for (int i = 0; i < retries; i++)
        {
            try
            {
                create_tables();
                return true;
            }
            catch (const std::exception &e)
            {
                std::cerr << "db not ready: " << e.what() << "\n";
                std::this_thread::sleep_for(std::chrono::milliseconds(wait_ms));
            }
        }
        return false;
    }
}
