#include "includes.hpp"
#include <pqxx/pqxx>
#include <iostream>

pqxx::connection* create_connection()
{
    try
    {
        return new pqxx::connection("host=statistics_db port=5432 dbname=game_stats_db user=bn_user password=bn_pass");
    }
    catch (const std::exception &e)
    {
        std::cerr << "DB Connection Error: " << e.what() << std::endl;
        return nullptr;
    }
}

void init_game_db()
{
    try
    {
        pqxx::connection* C = create_connection();
        if (C && C->is_open())
        {
            pqxx::work W(*C);
            
            std::string sql = R"(
                CREATE TABLE IF NOT EXISTS player_stats (
                    id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL,
                    mode VARCHAR(50) NOT NULL,
                    wins INT DEFAULT 0,
                    games_played INT DEFAULT 0,
                    losses INT DEFAULT 0,
                    UNIQUE(user_id, mode)
                );
            )";
            
            W.exec(sql);
            W.commit();
            std::cout << "Database initialized: Tables checked/created." << std::endl;
            delete C;
        }
    }
    catch (const std::exception &e)
    {
        std::cerr << "Init DB Error: " << e.what() << std::endl;
    }
}

void update_stats(int user_id, std::string mode, bool is_win) {
    try
    {
        pqxx::connection* C = create_connection();
        if (C && C->is_open())
        {
            pqxx::work W(*C);

            std::string sql = "INSERT INTO player_stats (user_id, mode, wins, games_played, losses) VALUES (" +
                              std::to_string(user_id) + ", '" + mode + "', " + (is_win ? "1" : "0") + ", 1, " + (is_win ? "0" : "1") + ")" +
                              " ON CONFLICT (user_id, mode) DO UPDATE SET " +
                              " games_played = player_stats.games_played + 1, " +
                              " wins = player_stats.wins + " + (is_win ? "1" : "0") + "," +
                              " losses = player_stats.losses + " + (is_win ? "0" : "1") + ";";

            W.exec(sql);
            W.commit();
            delete C;
        }
    }
    catch (const std::exception &e)
    {
        std::cerr << "Update Stats Error: " << e.what() << std::endl;
    }
}