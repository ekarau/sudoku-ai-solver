import numpy as np
import random
import math
import time
from .utils import get_fixed_positions, cost_function


def solve_sa(puzzle: list[list[int]], cooling_rate: float = 0.99995, min_temp: float = 0.0001, yield_every: int = 1000):
    """Solves Sudoku using Simulated Annealing (Lewis-style).

    Key ideas from Lewis (2007) "Metaheuristics can solve sudoku puzzles":
      - Box-permutation encoding (each 3x3 box is a permutation of 1..9)
      - Neighbor = swap two non-fixed cells within a single box
      - Auto-calibrated initial temperature from sample move costs
      - Two-level recovery: reheat first, then full reset if still stuck
    """
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

    def calibrate_initial_temperature(grid, samples: int = 200, target_accept: float = 0.8):
        """Samples random moves and picks T0 so worse moves are accepted ~80% of the time."""
        deltas = []
        current = cost_function(grid)
        for _ in range(samples):
            box_key = random.choice(available_boxes)
            positions = box_non_fixed[box_key]
            p1, p2 = random.sample(positions, 2)
            grid[p1], grid[p2] = grid[p2], grid[p1]
            new_cost = cost_function(grid)
            delta = new_cost - current
            if delta > 0:
                deltas.append(delta)
            # Revert — we only wanted a sample
            grid[p1], grid[p2] = grid[p2], grid[p1]
        if not deltas:
            return 1.0
        avg_delta = sum(deltas) / len(deltas)
        # exp(-avg_delta / T0) = target_accept  ->  T0 = -avg_delta / ln(target_accept)
        return -avg_delta / math.log(target_accept)

    # --- Main SA with two-level recovery (reheat + full reset) ---
    grid = build_initial_grid()
    current_cost = cost_function(grid)
    best_grid = grid.copy()
    best_cost = current_cost

    initial_temp = calibrate_initial_temperature(grid)
    temperature = initial_temp

    iteration = 0
    last_improvement = 0
    reheat_count = 0
    reset_count = 0
    max_reheats = 5
    max_resets = 5
    reheat_after = 30000
    reset_after_reheats = max_reheats

    while temperature > min_temp:
        box_key = random.choice(available_boxes)
        positions = box_non_fixed[box_key]
        pos1, pos2 = random.sample(positions, 2)

        grid[pos1], grid[pos2] = grid[pos2], grid[pos1]
        new_cost = cost_function(grid)
        delta = new_cost - current_cost

        if delta < 0:
            current_cost = new_cost
        elif random.random() < math.exp(-delta / temperature):
            current_cost = new_cost
        else:
            grid[pos1], grid[pos2] = grid[pos2], grid[pos1]

        if current_cost < best_cost:
            best_cost = current_cost
            best_grid = grid.copy()
            last_improvement = iteration

        temperature *= cooling_rate
        iteration += 1

        iterations_since_improvement = iteration - last_improvement

        # Stage 1: Reheat from best known state with small perturbation
        if iterations_since_improvement > reheat_after and reheat_count < max_reheats:
            temperature = initial_temp * (0.7 ** reheat_count)
            grid = best_grid.copy()
            perturb_count = max(2, len(available_boxes) // 3)
            for _ in range(perturb_count):
                bk = random.choice(available_boxes)
                pos = box_non_fixed[bk]
                for _ in range(max(1, len(pos) // 3)):
                    p1, p2 = random.sample(pos, 2)
                    grid[p1], grid[p2] = grid[p2], grid[p1]
            current_cost = cost_function(grid)
            reheat_count += 1
            last_improvement = iteration

        # Stage 2: Full reset — new random starting state (Lewis-style escape)
        elif iterations_since_improvement > reheat_after and reheat_count >= reset_after_reheats and reset_count < max_resets:
            grid = build_initial_grid()
            current_cost = cost_function(grid)
            initial_temp = calibrate_initial_temperature(grid)
            temperature = initial_temp
            reset_count += 1
            reheat_count = 0
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
