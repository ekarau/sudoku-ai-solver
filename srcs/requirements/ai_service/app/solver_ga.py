import numpy as np
import random
import time
from .utils import get_fixed_positions, row_fitness


def solve_ga(puzzle: list[list[int]], population_size: int = 200, max_generations: int = 10000, yield_every: int = 25):
    """Solves Sudoku using a Genetic Algorithm with row-permutation encoding and restart mechanism."""
    start_time = time.time()
    puzzle_np = np.array(puzzle)
    fixed = get_fixed_positions(puzzle)

    # Precompute non-fixed positions per row and per column for fast mutation
    row_non_fixed = {
        r: [c for c in range(9) if (r, c) not in fixed]
        for r in range(9)
    }
    col_non_fixed = {
        c: [r for r in range(9) if (r, c) not in fixed]
        for c in range(9)
    }

    def create_individual():
        """Creates a valid individual: each row is a permutation of missing digits."""
        grid = puzzle_np.copy()
        for r in range(9):
            fixed_vals = set(grid[r, c] for c in range(9) if (r, c) in fixed)
            missing = [v for v in range(1, 10) if v not in fixed_vals]
            random.shuffle(missing)
            idx = 0
            for c in range(9):
                if (r, c) not in fixed:
                    grid[r, c] = missing[idx]
                    idx += 1
        return grid

    def tournament_select(pop, fitnesses, k=5):
        indices = random.sample(range(len(pop)), k)
        best = min(indices, key=lambda i: fitnesses[i])
        return pop[best].copy()

    def crossover(parent1, parent2):
        child = np.empty((9, 9), dtype=int)
        for r in range(9):
            child[r] = parent1[r].copy() if random.random() < 0.5 else parent2[r].copy()
        return child

    def row_swap_mutate(individual, mutation_rate):
        """Swaps two non-fixed cells within the same row. Preserves row validity."""
        for r in range(9):
            if random.random() < mutation_rate:
                non_fixed = row_non_fixed[r]
                if len(non_fixed) >= 2:
                    c1, c2 = random.sample(non_fixed, 2)
                    individual[r, c1], individual[r, c2] = individual[r, c2], individual[r, c1]
        return individual

    def col_swap_mutate(individual, mutation_rate):
        """Swaps a value between two rows in the same column, then repairs the affected rows
        to maintain the row-permutation invariant (no row duplicates).

        This is a 4-cell cyclic swap:
          (r1, c) <-> (r2, c)  then repair:
          (r1, repair_col) gets the displaced value from r1
          (r2, repair_col) gets the displaced value from r2
        """
        for c in range(9):
            if random.random() < mutation_rate:
                non_fixed_rows = col_non_fixed[c]
                if len(non_fixed_rows) < 2:
                    continue

                r1, r2 = random.sample(non_fixed_rows, 2)
                val1 = int(individual[r1, c])
                val2 = int(individual[r2, c])

                if val1 == val2:
                    continue

                # Find where val2 sits in row r1 at a non-fixed column (repair target)
                r1_repair = None
                for col in range(9):
                    if col != c and individual[r1, col] == val2 and (r1, col) not in fixed:
                        r1_repair = col
                        break

                # Find where val1 sits in row r2 at a non-fixed column (repair target)
                r2_repair = None
                for col in range(9):
                    if col != c and individual[r2, col] == val1 and (r2, col) not in fixed:
                        r2_repair = col
                        break

                # Only apply if both rows can be repaired — rows stay valid permutations
                if r1_repair is not None and r2_repair is not None:
                    individual[r1, c] = val2
                    individual[r2, c] = val1
                    individual[r1, r1_repair] = val1
                    individual[r2, r2_repair] = val2

        return individual

    def run_generation_loop(population, fitnesses, global_best, global_best_fitness, stale_count):
        """Runs one generation and returns updated state."""
        sorted_indices = sorted(range(len(population)), key=lambda i: fitnesses[i])
        new_population = [population[sorted_indices[0]].copy(), population[sorted_indices[1]].copy()]

        mutation_rate = 0.15 + (0.3 if stale_count > 20 else 0)
        col_rate = 0.05 + (0.2 if stale_count > 20 else 0)

        while len(new_population) < population_size:
            parent1 = tournament_select(population, fitnesses)
            parent2 = tournament_select(population, fitnesses)
            child = crossover(parent1, parent2)
            child = row_swap_mutate(child, mutation_rate)
            child = col_swap_mutate(child, col_rate)
            new_population.append(child)

        new_fitnesses = [row_fitness(ind) for ind in new_population]
        gen_best_idx = min(range(len(new_population)), key=lambda i: new_fitnesses[i])
        gen_best_fitness = new_fitnesses[gen_best_idx]

        if gen_best_fitness < global_best_fitness:
            global_best_fitness = gen_best_fitness
            global_best = new_population[gen_best_idx].copy()
            stale_count = 0
        else:
            stale_count += 1

        return new_population, new_fitnesses, global_best, global_best_fitness, stale_count

    # --- Main loop with restarts ---
    global_best = None
    global_best_fitness = float('inf')
    generation = 0

    while generation < max_generations:
        population = [create_individual() for _ in range(population_size)]
        if global_best is not None:
            population[0] = global_best.copy()

        fitnesses = [row_fitness(ind) for ind in population]
        stale_count = 0

        local_best_idx = min(range(len(population)), key=lambda i: fitnesses[i])
        if fitnesses[local_best_idx] < global_best_fitness:
            global_best_fitness = fitnesses[local_best_idx]
            global_best = population[local_best_idx].copy()

        restart_stale = 0

        for _ in range(500):
            generation += 1
            if generation > max_generations:
                break

            population, fitnesses, global_best, global_best_fitness, stale_count = run_generation_loop(
                population, fitnesses, global_best, global_best_fitness, stale_count
            )

            # Partial refresh on stagnation
            if stale_count >= 20:
                keep = 15
                sorted_indices = sorted(range(len(population)), key=lambda i: fitnesses[i])
                survivors = [population[i].copy() for i in sorted_indices[:keep]]
                new_individuals = [create_individual() for _ in range(population_size - keep - 1)]
                population = survivors + [global_best.copy()] + new_individuals
                fitnesses = [row_fitness(ind) for ind in population]
                stale_count = 0
                restart_stale += 1

            if generation % yield_every == 0 or global_best_fitness == 0:
                elapsed = time.time() - start_time
                yield {
                    "board": global_best.tolist(),
                    "fitness": int(global_best_fitness),
                    "generation": generation,
                    "temperature": None,
                    "elapsed": round(elapsed, 2),
                    "status": "solved" if global_best_fitness == 0 else "solving",
                }

            if global_best_fitness == 0:
                return

            # Full restart if deeply stuck
            if restart_stale >= 4:
                break

    # Max generations reached
    elapsed = time.time() - start_time
    yield {
        "board": global_best.tolist(),
        "fitness": int(global_best_fitness),
        "generation": generation,
        "temperature": None,
        "elapsed": round(elapsed, 2),
        "status": "failed",
    }
