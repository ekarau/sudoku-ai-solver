#include "includes.hpp"

void	game_generator(std::array<std::array<int, 9>, 9>& grid, std::array<std::array<int, 9>, 9>& grid_solved,
	int hardness_requested, SolverStats& stats)
{
	std::array<int, 81> mixed_sequence;
	int temp;
	int iterator = 0;
	int counter = 100;


	while (stats.hardness != hardness_requested)
	{
		counter++;
		if (counter > 100)
		{
			fullgrid_generator(grid);
			grid_solved = grid;
			prepare_mixed_sequence(mixed_sequence);
			counter = 0;
		}
		iterator = iterator % 81;

		// std::cout << stats.hardness << ", iterator: " << iterator << std::endl;

		initilize_stats(stats);
		// delete next one
		temp = grid[mixed_sequence[iterator] / 9][mixed_sequence[iterator] % 9]; 
		grid[mixed_sequence[iterator] / 9][mixed_sequence[iterator] % 9] = 0;

		// std::cout << counter << "  iterator: " << iterator << " cell: " << mixed_sequence[iterator] / 9 << ", " << mixed_sequence[iterator] % 9 << " empty count: " << count_empty(grid) << " solve_with_logic: " << solve_with_logic(grid, stats) << " hidden_total: " << stats.hidden_total << std::endl;

		stats.empty_cell = count_empty(grid);
		// check solvable by easy tech, if not reverse delete and skip to next cell in the sequence
		if (stats.empty_cell < 58 && solve_with_logic(grid, stats) == false && hardness_requested != 5) 
		{
			// std::cout << "enter: upto 58 it has to be human solvable!" << std::endl;
			grid[mixed_sequence[iterator] / 9][mixed_sequence[iterator] % 9] = temp;
			iterator++;
			continue ;
		}
		// hardness 1'de hidden single olmamasi gerekiyor.
		if (hardness_requested == 1 && stats.hidden_total != 0)
		{
			// std::cout << "enter: hardness 1'de hidden single olmamasi lazim!" << std::endl;
			grid[mixed_sequence[iterator] / 9][mixed_sequence[iterator] % 9] = temp;
			iterator++;
			continue ;
		}
		// check whether solution is unique if not reverse delete and skip to next cell in the sequence 
		check_uniqueness(grid, stats);
		if (stats.solution_count != 1)
		{
			// std::cout << "enter: 1 den fazla solution var!" << std::endl;
			grid[mixed_sequence[iterator] / 9][mixed_sequence[iterator] % 9] = temp;
			iterator++;
			continue ;
		}
		determine_hardness(stats);
		iterator++;
	}
}

void check_uniqueness(std::array<std::array<int, 9>, 9> grid, SolverStats& stats) 
{
    if (stats.depth > stats.max_depth) 
        stats.max_depth = stats.depth;

    if (stats.solution_count > 1) 
        return;

    int row, col;
    if (!find_best_empty_location(grid, row, col)) 
    {
        stats.solution_count++;
        return;
    }

    int choices = 0;
    for (int num = 1; num <= 9; num++) 
    {
        if (basic_check(grid, row, col, num)) 
        {
            stats.total_guesses++;
            choices++;
    
            grid[row][col] = num;
            stats.depth++;
            
            check_uniqueness(grid, stats);
            
            stats.depth--;
            grid[row][col] = 0; // Backtrack
        }
    }

    // --- DEAD END TRACKING ---
    if (choices == 0) 
    {
        stats.dead_ends++;
    }

    // --- BRANCHING POINT TRACKING ---
    if (choices > 1) 
        stats.branching_points++;
}

void	delete_initial_cells(std::array<int, 81>& mixed_sequence, std::array<std::array<int, 9>, 9>& grid, int hardness_requested, int& i)
{
	int num;

	switch (hardness_requested)
	{
	case 1:
		num = 43;
		break;
	case 2:
		num = 44;
		break;
	case 3:
		num = 51;
		break;
	case 4:
		num = 56;
		break;
	default:
		num = 58;
		break;
	}

	for (; i < num ; i++)
	{
		grid[mixed_sequence[i] / 9][mixed_sequence[i] % 9] = 0;
	}
}

void	prepare_mixed_sequence(std::array<int, 81>& mixed_sequence)
{
	for (int i = 0; i < 81; i++)
	{
		mixed_sequence[i] = i;
	}
	long long seed = std::chrono::high_resolution_clock::now().time_since_epoch().count();
	std::srand(static_cast<unsigned int>(seed));
	std::random_shuffle (mixed_sequence.begin(), mixed_sequence.end());

}