#include "includes.hpp"

bool	find_naked_single(std::array<std::array<int, 9>, 9>& grid, SolverStats& stats)
{
    for (int r = 0; r < 9; r++) 
    {
        for (int c = 0; c < 9; c++)
        {
            if (grid[r][c] == 0)
            {
                int count = 0;
                int val = 0;

                for (int num = 1; num <= 9; num++)
                {
                    if (basic_check(grid, r, c, num)) 
                    {
                        count++; 
                        val = num;
                    }
                    if (count > 1) break; 
                }

                if (count == 1)
                {
					grid[r][c] = val;
					stats.naked_singles++;
                    return true;
                }
            }
        }
    }
    return false;
}

bool	find_hidden_single(std::array<std::array<int, 9>, 9>& grid, SolverStats& stats) 
{
	// 1. CHECK BOXES
    for (int box = 0; box < 9; box++) 
	{
        for (int num = 1; num <= 9; num++) 
		{
            int count = 0, last_row = -1, last_col = -1;
            for (int i = 0; i < 9; i++) 
			{
                int r = (box / 3) * 3 + i / 3;
                int c = (box % 3) * 3 + i % 3;
                if (grid[r][c] == 0 && basic_check(grid, r, c, num)) 
				{
                    count++; last_row = r; last_col = c;
                }
            }
            if (count == 1) 
			{
				grid[last_row][last_col] = num;
				stats.hidden_box++;
				return true; 
			}
        }
    }

    // 2. CHECK ROWS
    for (int r = 0; r < 9; r++) 
	{
        for (int num = 1; num <= 9; num++) 
		{
            int count = 0, last_c = -1;
            for (int c = 0; c < 9; c++) 
			{
                if (grid[r][c] == 0 && basic_check(grid, r, c, num)) 
				{
                    count++; 
					last_c = c;
                }
            }
            if (count == 1) 
			{ 
				grid[r][last_c] = num;
				stats.hidden_row++;
				return true; 
			}
        }
    }

    // 3. CHECK COLUMNS
    for (int c = 0; c < 9; c++) 
	{
        for (int num = 1; num <= 9; num++) 
		{
            int count = 0, last_r = -1;
            for (int r = 0; r < 9; r++) 
			{
                if (grid[r][c] == 0 && basic_check(grid, r, c, num)) 
				{
                    count++; last_r = r;
                }
            }
            if (count == 1) 
			{
				grid[last_r][c] = num;
				stats.hidden_col++;
				return true; 
			}
        }
    }
    return false;
}

bool	solve_with_logic(std::array<std::array<int, 9>, 9> grid, SolverStats& stats) 
{
    bool move_made = true;
    while (move_made) 
	{
        move_made = false;
        if (find_naked_single(grid, stats)) 
		{
            move_made = true;
            continue ;
        }

        if (find_hidden_single(grid, stats)) 
		{
            move_made = true;
            continue ;
        }
    }
	stats.hidden_total = stats.hidden_box + stats.hidden_col + stats.hidden_row;
	if (count_empty(grid) == 0)
	{
		stats.solved_with_logic = true;
    	return true;
	}
	else
		return false; 
}
