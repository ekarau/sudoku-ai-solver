#pragma once

#include "array"
#include "vector"
#include <algorithm>    // std::random_shuffle
#include <random>		// 
#include <iostream>		// std::cout
#include <ctime>        // std::time
#include <iomanip>		// std::setprecision
#include <chrono>
#include <pqxx/pqxx>
#include <string>

#include "../tools/asio.hpp" 	// crow icin gerekiyor
#include "../tools/crow_all.h"   // cpp koda webserv ozelligi veriyor 

struct SolverStats {
	int solution_count = 0;
	int depth = 0;
    long long total_guesses = 0;
    long long dead_ends = 0;
    int max_depth = 0;
    long long branching_points = 0;
	int hardness = 0;
	std::chrono::duration<double, std::milli> duration;
	int naked_singles = 0;
	int hidden_box = 0;
	int hidden_row = 0;
	int hidden_col = 0;
	int hidden_total = 0;
	bool solved_with_logic = false;
	int empty_cell = 0;
};

//random_full_grid_gen.cpp
void	fullgrid_generator(std::array<std::array<int, 9>, 9>&);
void	fill_diagonal_boxes(std::array<std::array<int, 9>, 9>&);
bool 	fill_other_boxes(std::array<std::array<int, 9>, 9>&, int, int);

//game_grid_gen.cpp
void	game_generator(std::array<std::array<int, 9>, 9>& grid,
	std::array<std::array<int, 9>, 9>& grid_solved, int hardness_requested, SolverStats& stats);
void 	check_uniqueness(std::array<std::array<int, 9>, 9> grid, SolverStats& stats);
void	delete_initial_cells(std::array<int, 81>& mixed_sequence, std::array<std::array<int, 9>, 9>& grid, 
	int hardness_requested, int& i);
void	prepare_mixed_sequence(std::array<int, 81>& mixed_sequence);


//utils.cpp
void	print_stats(const SolverStats& stats);
void	print_grid(std::array<std::array<int, 9>, 9>&);
void	determine_hardness(SolverStats& stats);
void	clear_grid(std::array<std::array<int, 9>, 9>& grid);
void	initilize_stats(SolverStats& stats);
bool	find_best_empty_location(std::array<std::array<int, 9>, 9>& grid, int& row, int& col);
bool	basic_check(const std::array<std::array<int, 9>, 9>& grid, int row, int col, int num);
int		count_empty(std::array<std::array<int, 9>, 9>& grid);

//tester.cpp
void	tester();
void	analyse_grid(SolverStats& stats, std::array<std::array<int, 9>, 9> grid);

//human_logic.cpp
bool	find_naked_single(std::array<std::array<int, 9>, 9>& grid, SolverStats& stats);
bool	find_hidden_single(std::array<std::array<int, 9>, 9>& grid, SolverStats& stats);
bool	solve_with_logic(std::array<std::array<int, 9>, 9> grid, SolverStats& stats);

//play.cpp
void	play(std::array<std::array<int, 9>, 9>& grid, std::array<std::array<int, 9>, 9>& grid_solved);

// create_db.cpp
pqxx::connection* create_connection();
void init_game_db();
void update_stats(int user_id, std::string mode, bool is_win);

// hint.cpp
crow::json::wvalue generate_hint_wrapper(std::array<std::array<int, 9>, 9> current_grid);