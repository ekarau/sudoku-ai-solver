#include "includes.hpp"

void    print_grid(std::array<std::array<int, 9>, 9>& grid) 
{
    std::string line_separator = "------+-------+------";

    for (int i = 0; i < 9; ++i) {
        // yatay ayırıcı 
        if (i > 0 && i % 3 == 0) {
            std::cout << line_separator << std::endl;
        }

        for (int j = 0; j < 9; ++j) {
            // dikey ayırıcı
            if (j > 0 && j % 3 == 0) {
                std::cout << "| ";
            }

            if (grid[i][j] == 0) {
                std::cout << ". ";
            } else {
                std::cout << grid[i][j] << " ";
            }
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;
}

bool    find_best_empty_location(std::array<std::array<int, 9>, 9>& grid, int& row, int& col) 
{
    int min_choices = 10; // More than 9
    bool found = false;

    for (int r = 0; r < 9; r++) 
    {
        for (int c = 0; c < 9; c++) 
        {
            if (grid[r][c] == 0) 
            {
                int choices = 0;
                for (int n = 1; n <= 9; n++) 
                {
                    if (basic_check(grid, r, c, n)) 
                        choices++;
                }
                if (choices < min_choices) 
                {
                    min_choices = choices;
                    row = r;
                    col = c;
                    found = true;
                }
                if (min_choices == 1) return true;
            }
        }
    }
    return found;
}

bool    basic_check(const std::array<std::array<int, 9>, 9>& grid, int row, int col, int num) 
{
    // Check 3x3 box
    int start_row = row - row % 3;
    int start_col = col - col % 3;
    
    for (int i = 0; i < 3; ++i) 
        for (int j = 0; j < 3; ++j) 
            if (grid[i + start_row][j + start_col] == num) 
                return false;
    // Check row and column
    for (int i = 0; i < 9; ++i) 
        if (grid[row][i] == num || grid[i][col] == num) 
            return false;
    return true;
}

void print_stats(const SolverStats& stats) 
{
    std::cout << "========== HEURISTIC SOLVER STATS ==========" << std::endl;
    std::cout << "Empty Cells      : " << stats.empty_cell << std::endl;
    std::cout << "Naked Singles    : " << stats.naked_singles << std::endl;
    std::cout << "Hidden Singles   : " << stats.hidden_box + stats.hidden_row + stats.hidden_col << std::endl;
    std::cout << " Hidden Boxes  : " << stats.hidden_box << std::endl;
    std::cout << " Hidden Rows   : " << stats.hidden_row << std::endl;
    std::cout << " Hidden Columns: " << stats.hidden_col << std::endl;
    std::cout << "Solved with Logic: " << stats.solved_with_logic << std::endl;
    std::cout << "Total Guesses    : " << stats.total_guesses << std::endl;
    std::cout << "Branching Points : " << stats.branching_points << std::endl; 
    std::cout << "Human Hardness   : ";
    int hidden_singles = stats.hidden_box  + stats.hidden_row + stats.hidden_col;
    if (stats.solved_with_logic == true) 
    {
        if (stats.empty_cell == 43 && hidden_singles == 0) 
        {
            std::cout << "EASY" << std::endl;
        } 
        else if (stats.empty_cell <= 50) 
        {
            std::cout << "MEDIUM" << std::endl;
        } 
        else if (stats.empty_cell <= 55) 
        {
            std::cout << "HARD" << std::endl;
        } 
        else if (stats.empty_cell <= 58 && hidden_singles != 0) 
        {
            std::cout << "MASTER" << std::endl;
        } 
        else 
        {
            std::cout << "UNCATEGORIZED" << std::endl;
        }
    } 
    else 
    {
        std::cout << "EXTREME" << std::endl;
    }
    std::cout << "============================================\n" << std::endl;
}

void    determine_hardness(SolverStats& stats)
{
    int hidden_singles = stats.hidden_box  + stats.hidden_row + stats.hidden_col;
    // std::cout << stats.solved_with_logic << "," << stats.empty_cell << "," << hidden_singles << std::endl;
    if (stats.solved_with_logic == true) 
    { 
        if (stats.empty_cell == 43 && hidden_singles == 0) 
        {
            stats.hardness = 1;
        } 
        else if (stats.empty_cell > 43 && stats.empty_cell <= 50) 
        {
            stats.hardness = 2;
        } 
        else if (stats.empty_cell > 50 && stats.empty_cell <= 55) 
        {
            stats.hardness = 3;
        } 
        else if (stats.empty_cell > 55 && stats.empty_cell <= 58 && hidden_singles != 0) 
        {
            stats.hardness = 4;
        } 
        else 
        {
            stats.hardness = -1;
        }
    } 
    else 
    {
        stats.hardness = 5;
    }
}

void    clear_grid(std::array<std::array<int, 9>, 9>& grid)
{
    for (int i = 0; i < 9; i++)
        grid[i] = {};
}

void    initilize_stats(SolverStats& stats)
{
    stats.solution_count = 0;
    stats.depth = 0;
    stats.total_guesses = 0;
    stats.dead_ends = 0;
    stats.max_depth = 0;
    stats.branching_points = 0; // Where human logic gets hard
    stats.hardness = 0;
    stats.naked_singles = 0;
    stats.hidden_box = 0;
    stats.hidden_row = 0;
    stats.hidden_col = 0;
    stats.solved_with_logic = false;
    stats.empty_cell = 0;
}

int count_empty(std::array<std::array<int, 9>, 9>& grid)
{
    int count = 0;

    for (int r = 0; r < 9; r++) 
    {
        for (int c = 0; c < 9; c++)
        {
            if (grid[r][c] == 0)
                count++;
        }
    }
    return count;
}
