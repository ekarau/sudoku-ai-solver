import numpy as np
import random
import math
import time
from .utils import get_fixed_positions, cost_function


def solve_sa(puzzle: list[list[int]], initial_temp: float = 3.0, cooling_rate: float = 0.999997, min_temp: float = 0.0001, yield_every: int = 200):
    """Solves Sudoku using Simulated Annealing with box-permutation encoding and reheat mechanism."""
    start_time = time.time()
    puzzle_np = np.array(puzzle)
    fixed = get_fixed_positions(puzzle)

    def build_initial_grid():
        grid = puzzle_np.copy()
        for box_r in range(3):
            for box_c in range(3):
                r_start, c_start = box_r * 3, box_c * 3
                fixed_vals = set()
                for r in range(r_start, r_start + 3):
                    for c in range(c_start, c_start + 3):
                        if (r, c) in fixed:
                            fixed_vals.add(grid[r, c])
                missing = [v for v in range(1, 10) if v not in fixed_vals]
                random.shuffle(missing)
                idx = 0
                for r in range(r_start, r_start + 3):
                    for c in range(c_start, c_start + 3):
                        if (r, c) not in fixed:
                            grid[r, c] = missing[idx]
                            idx += 1
        return grid

    # Precompute non-fixed positions per box
    box_non_fixed = {}
    for box_r in range(3):
        for box_c in range(3):
            r_start, c_start = box_r * 3, box_c * 3
            positions = [
                (r, c)
                for r in range(r_start, r_start + 3)
                for c in range(c_start, c_start + 3)
                if (r, c) not in fixed
            ]
            if len(positions) >= 2:
                box_non_fixed[(box_r, box_c)] = positions

    if not box_non_fixed:
        elapsed = time.time() - start_time
        grid = build_initial_grid()
        current_cost = cost_function(grid)
        yield {
            "board": grid.tolist(),
            "fitness": int(current_cost),
            "generation": None,
            "temperature": 0.0,
            "elapsed": round(elapsed, 2),
            "status": "solved" if current_cost == 0 else "failed",
        }
        return

    available_boxes = list(box_non_fixed.keys())

    grid = build_initial_grid()
    current_cost = cost_function(grid)
    best_grid = grid.copy()
    best_cost = current_cost
    temperature = initial_temp
    iteration = 0
    last_improvement = 0
    reheat_count = 0

    while temperature > min_temp:
        box_key = random.choice(available_boxes)
        positions = box_non_fixed[box_key]
        pos1, pos2 = random.sample(positions, 2)

        grid[pos1], grid[pos2] = grid[pos2].copy(), grid[pos1].copy()
        new_cost = cost_function(grid)
        delta = new_cost - current_cost

        if delta < 0:
            current_cost = new_cost
        elif random.random() < math.exp(-delta / temperature):
            current_cost = new_cost
        else:
            grid[pos1], grid[pos2] = grid[pos2].copy(), grid[pos1].copy()

        if current_cost < best_cost:
            best_cost = current_cost
            best_grid = grid.copy()
            last_improvement = iteration

        temperature *= cooling_rate
        iteration += 1

        # Reheat if stuck for too long without improvement
        iterations_since_improvement = iteration - last_improvement
        if iterations_since_improvement > 50000 and reheat_count < 5:
            temperature = initial_temp * (0.5 ** reheat_count)
            grid = build_initial_grid()
            current_cost = cost_function(grid)
            reheat_count += 1
            last_improvement = iteration

        if iteration % yield_every == 0 or current_cost == 0:
            elapsed = time.time() - start_time
            yield {
                "board": best_grid.tolist(),
                "fitness": int(best_cost),
                "generation": None,
                "temperature": round(temperature, 6),
                "elapsed": round(elapsed, 2),
                "status": "solved" if best_cost == 0 else "solving",
            }

        if current_cost == 0:
            return

    elapsed = time.time() - start_time
    yield {
        "board": best_grid.tolist(),
        "fitness": int(best_cost),
        "generation": None,
        "temperature": round(temperature, 6),
        "elapsed": round(elapsed, 2),
        "status": "solved" if best_cost == 0 else "failed",
    }
