#include "asio.hpp"
#include "crow_all.h"
#include <iostream>
#include <array>
#include <string>
#include "includes.hpp" 

int main()
{
    crow::SimpleApp app;

    CROW_ROUTE(app, "/generate").methods(crow::HTTPMethod::GET)
    ([&](const crow::request& req)
    {
        const char* diff_param = req.url_params.get("difficulty");
        int difficulty = 1; 
        
        if (diff_param) {
            std::string diff_str = diff_param;
            if (diff_str == "Easy")
                difficulty = 1;
            else if (diff_str == "Medium")
                difficulty = 2;
            else if (diff_str == "Hard")
                difficulty = 3;
            else if (diff_str == "Expert")
                difficulty = 4;
            else if (diff_str == "Extreme")
                difficulty = 5;
        }

        std::array<std::array<int, 9>, 9> local_puzzle;
        std::array<std::array<int, 9>, 9> local_solution;
        SolverStats stats;

        game_generator(local_puzzle, local_solution, difficulty, stats);

        crow::json::wvalue response;
        for (int i = 0; i < 9; ++i)
        {
            for (int j = 0; j < 9; ++j)
            {
                response["board"][i][j] = local_puzzle[i][j];
                response["solution"][i][j] = local_solution[i][j];
            }
        }

        return crow::response(response);
    });

    CROW_ROUTE(app, "/hint").methods(crow::HTTPMethod::POST)
    ([](const crow::request& req)
    {
        auto x = crow::json::load(req.body);
        if (!x || !x.has("grid") || x["grid"].size() != 9)
            return crow::response(400, "Invalid or missing grid");

        std::array<std::array<int, 9>, 9> grid;
        for (int i = 0; i < 9; ++i)
        {
            if (x["grid"][i].size() != 9)
                return crow::response(400, "Grid must be 9x9");
                
            for (int j = 0; j < 9; ++j)
            {
                int val = x["grid"][i][j].i();
                if (val < 0 || val > 9)
                    return crow::response(400, "Cell values must be between 0 and 9");
                grid[i][j] = val;
            }
        }

        crow::json::wvalue result = generate_hint_wrapper(grid);
        
        return crow::response(result);
    });

    app.port(8080).multithreaded().run();
}