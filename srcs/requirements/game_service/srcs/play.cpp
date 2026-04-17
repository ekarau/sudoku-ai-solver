#include "includes.hpp"

void play(std::array<std::array<int, 9>, 9>& grid, std::array<std::array<int, 9>, 9>& grid_solved)
{
	int row;
	int col;
	int num;
	int lives = 3;

	while (count_empty(grid))
	{
		row = -1;
		col = -1;
		num = -1;
		std::cout << "Plase enter the guess (row, col, num): ";
		scanf("%d, %d, %d", &row, &col, &num);
		if (row == -1 || col == -1 || num == -1)
		{
			std::cout << "Wrong input, try again!" << std::endl;
			continue ;
		}
		if (row < 0 || row > 8 || col < 0 || col > 8 || num < 0 || num > 8)
		{
			std::cout << "Wrong input, try again!" << std::endl;
			continue ;
		} 
		if (grid[row][col] != 0)
		{
			std::cout << "Warning: Not an empty cell!" << std::endl;
		}
		else if (grid_solved[row][col] != num)
		{
			std::cout << "You have lost one life!" << std::endl;
			lives--;
			if (lives > 0)
				std::cout << lives << " live(s) has remained out of 3!" << std::endl;
			else
			{
				std::cout << "You are out of lives!" << std::endl;
				return ;
			}
		}
		else if (grid_solved[row][col] == num)
		{
			std::cout << "Correct!" << std::endl;
			grid[row][col] = num;
		}
		print_grid(grid);
	}
	std::cout << "COMPLETED SUCCESSFULLY!" << std::endl;
}