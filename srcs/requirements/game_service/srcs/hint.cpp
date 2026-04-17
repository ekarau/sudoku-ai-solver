#include "crow_all.h"
#include "includes.hpp"

crow::json::wvalue generate_hint_wrapper(std::array<std::array<int, 9>, 9> current_grid) 
{
    std::array<std::array<int, 9>, 9> temp_grid = current_grid;
    SolverStats dummy_stats; 

    crow::json::wvalue res;
    res["found"] = false;

    if (find_naked_single(temp_grid, dummy_stats)) 
    {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (current_grid[r][c] != temp_grid[r][c]) {
                    res["found"] = true;
                    res["row"] = r;
                    res["col"] = c;
                    res["value"] = temp_grid[r][c];
                    res["message"] = "Focus on this cell. Check the row, column, and box. The number " + std::to_string(temp_grid[r][c]) + " is the only one that fits here.";
                    return res;
                }
            }
        }
    }

    temp_grid = current_grid;
    if (find_hidden_single(temp_grid, dummy_stats)) 
    {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (current_grid[r][c] == 0 && temp_grid[r][c] != 0) {
                    res["found"] = true;
                    res["row"] = r;
                    res["col"] = c;
                    res["value"] = temp_grid[r][c];
                    res["message"] = "Look at the row, column, or box. The number " + std::to_string(temp_grid[r][c]) + " is missing, and this is the only spot it can go.";
                    return res;
                }
            }
        }
    }

    res["message"] = "No simple logical move found right now.";
    return res;
}