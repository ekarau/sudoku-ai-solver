#include "includes.hpp"

void	fullgrid_generator(std::array<std::array<int, 9>, 9>& grid)
{
	clear_grid(grid);
	fill_diagonal_boxes(grid);
	fill_other_boxes(grid, 0, 3);
}

void	fill_diagonal_boxes(std::array<std::array<int, 9>, 9>& grid)
{
	std::array<int, 9> onebox;

	onebox = {1,2,3,4,5,6,7,8,9};
    std::srand(std::time(nullptr));
	std::random_shuffle (onebox.begin(), onebox.end());
	grid[0] = {onebox[0], onebox[1], onebox[2]};
	grid[1] = {onebox[3], onebox[4], onebox[5]};
	grid[2] = {onebox[6], onebox[7], onebox[8]};
	std::random_shuffle (onebox.begin(), onebox.end());
	grid[3] = {0, 0, 0, onebox[0], onebox[1], onebox[2]};
	grid[4] = {0, 0, 0, onebox[3], onebox[4], onebox[5]};
	grid[5] = {0, 0, 0, onebox[6], onebox[7], onebox[8]};
	std::random_shuffle (onebox.begin(), onebox.end());
	grid[6] = {0, 0, 0, 0, 0, 0, onebox[0], onebox[1], onebox[2]};
	grid[7] = {0, 0, 0, 0, 0, 0, onebox[3], onebox[4], onebox[5]};
	grid[8] = {0, 0, 0, 0, 0, 0, onebox[6], onebox[7], onebox[8]};
}

bool	fill_other_boxes(std::array<std::array<int, 9>, 9>& grid, int row, int col) 
{
    if (row == 8 && col == 9) 
		return true;
    if (col == 9) 
	{ 
		row++; 
		col = 0; 
	}
    if (grid[row][col] != 0) 
		return fill_other_boxes(grid, row, col + 1);

    std::array<int, 9> nums;
	nums = {1,2,3,4,5,6,7,8,9};
    std::srand(std::time(nullptr));
	std::random_shuffle(nums.begin(), nums.end());

    for (int i = 0; i < 9; ++i) 
	{
        if (basic_check(grid, row, col, nums[i])) 
		{
            grid[row][col] = nums[i];
            if (fill_other_boxes(grid, row, col + 1)) 
				return true;
            grid[row][col] = 0; // Backtrack
        }
    }
    return false;
}