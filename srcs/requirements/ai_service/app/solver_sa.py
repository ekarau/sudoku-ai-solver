import numpy as np
import random
import math
import time
from .utils import get_fixed_positions


def solve_sa(puzzle: list[list[int]], cooling_rate: float = 0.99999, min_temp: float = 0.0001, yield_every: int = 5000):
    """Solves Sudoku using Simulated Annealing (Lewis-style) with incremental fitness.

    Key ideas from Lewis (2007) "Metaheuristics can solve sudoku puzzles":
      - Box-permutation encoding (each 3x3 box is a permutation of 1..9)
      - Neighbor = swap two non-fixed cells within a single box
      - Auto-calibrated initial temperature from sample move costs
      - Two-level recovery: reheat first, then full reset if still stuck

    Performance: per-row/col value-count tables are maintained so that the cost
    delta of a swap is computed in O(1) instead of rebuilding full fitness from
    scratch. This yields roughly 5-10x more iterations per second.
    """
    start_time = time.time()
    puzzle_np = np.array(puzzle, dtype=np.int32)
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
                            fixed_vals.add(int(grid[r, c]))
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
        yield {
            "board": grid.tolist(),
            "fitness": 0,
            "generation": None,
            "temperature": 0.0,
            "elapsed": round(elapsed, 2),
            "status": "solved",
        }
        return

    available_boxes = list(box_non_fixed.keys())

    # --- Incremental fitness infrastructure ---
    # row_val_count[r, v] = how many times value v appears in row r (v in 1..9)
    row_val_count = np.zeros((9, 10), dtype=np.int32)
    col_val_count = np.zeros((9, 10), dtype=np.int32)

    def init_counts(grid):
        row_val_count.fill(0)
        col_val_count.fill(0)
        for r in range(9):
            for c in range(9):
                v = int(grid[r, c])
                row_val_count[r, v] += 1
                col_val_count[c, v] += 1

    def full_cost():
        # cost = sum over rows of (9 - unique values in row) + same for cols
        cost = 0
        for i in range(9):
            missing_row = 0
            missing_col = 0
            for v in range(1, 10):
                if row_val_count[i, v] == 0:
                    missing_row += 1
                if col_val_count[i, v] == 0:
                    missing_col += 1
            cost += missing_row + missing_col
        return cost

    def swap_and_delta(pos1, pos2):
        """Swap grid[pos1] and grid[pos2] AND update counts. Returns cost delta.
        If v1 == v2 does a no-op and returns 0."""
        v1 = int(grid[pos1])
        v2 = int(grid[pos2])
        if v1 == v2:
            return 0

        r1, c1 = pos1
        r2, c2 = pos2
        delta = 0

        # --- Row updates ---
        if r1 != r2:
            # row r1: v1 leaves, v2 enters
            row_val_count[r1, v1] -= 1
            if row_val_count[r1, v1] == 0:
                delta += 1
            if row_val_count[r1, v2] == 0:
                delta -= 1
            row_val_count[r1, v2] += 1

            # row r2: v2 leaves, v1 enters
            row_val_count[r2, v2] -= 1
            if row_val_count[r2, v2] == 0:
                delta += 1
            if row_val_count[r2, v1] == 0:
                delta -= 1
            row_val_count[r2, v1] += 1

        # --- Column updates ---
        if c1 != c2:
            col_val_count[c1, v1] -= 1
            if col_val_count[c1, v1] == 0:
                delta += 1
            if col_val_count[c1, v2] == 0:
                delta -= 1
            col_val_count[c1, v2] += 1

            col_val_count[c2, v2] -= 1
            if col_val_count[c2, v2] == 0:
                delta += 1
            if col_val_count[c2, v1] == 0:
                delta -= 1
            col_val_count[c2, v1] += 1

        # --- Apply grid swap ---
        grid[pos1] = v2
        grid[pos2] = v1

        return delta

    def calibrate_initial_temperature(samples: int = 200, target_accept: float = 0.8):
        """Samples random moves and picks T0 so worse moves are accepted ~80% of the time."""
        deltas = []
        for _ in range(samples):
            box_key = random.choice(available_boxes)
            positions = box_non_fixed[box_key]
            p1, p2 = random.sample(positions, 2)
            delta = swap_and_delta(p1, p2)
            # Revert immediately
            swap_and_delta(p1, p2)
            if delta > 0:
                deltas.append(delta)
        if not deltas:
            return 1.0
        avg_delta = sum(deltas) / len(deltas)
        return -avg_delta / math.log(target_accept)

    # --- Main SA with two-level recovery ---
    grid = build_initial_grid()
    init_counts(grid)
    current_cost = full_cost()
    best_grid = grid.copy()
    best_cost = current_cost

    initial_temp = calibrate_initial_temperature()
    temperature = initial_temp

    iteration = 0
    last_improvement = 0
    reheat_count = 0
    reset_count = 0
    max_reheats = 10
    max_resets = 5
    reheat_after = 100000

    while True:
        box_key = random.choice(available_boxes)
        positions = box_non_fixed[box_key]
        pos1, pos2 = random.sample(positions, 2)

        delta = swap_and_delta(pos1, pos2)

        if delta <= 0:
            current_cost += delta
        elif random.random() < math.exp(-delta / temperature):
            current_cost += delta
        else:
            # Revert
            swap_and_delta(pos1, pos2)

        if current_cost < best_cost:
            best_cost = current_cost
            best_grid = grid.copy()
            last_improvement = iteration

        temperature *= cooling_rate
        iteration += 1

        iterations_since_improvement = iteration - last_improvement

        # Trigger recovery when either stagnant or temperature collapsed
        need_recovery = iterations_since_improvement > reheat_after or temperature < min_temp

        if need_recovery and reheat_count < max_reheats:
            # Stage 1: Reheat from best known state with STRONGER perturbation
            temperature = initial_temp * 0.6
            grid = best_grid.copy()
            init_counts(grid)
            current_cost = best_cost
            
            # Stronger perturbation: shuffle more boxes to break out of deep optima
            perturb_count = len(available_boxes) 
            for _ in range(perturb_count):
                bk = random.choice(available_boxes)
                pos = box_non_fixed[bk]
                if len(pos) >= 2:
                    for _ in range(max(2, len(pos) // 2)): 
                        p1, p2 = random.sample(pos, 2)
                        delta = swap_and_delta(p1, p2)
                        current_cost += delta
                        
            reheat_count += 1
            last_improvement = iteration
            
        elif need_recovery and reset_count < max_resets:
            # Stage 2: Full reset — new random starting state
            grid = build_initial_grid()
            init_counts(grid)
            current_cost = full_cost()
            initial_temp = calibrate_initial_temperature()
            temperature = initial_temp
            reset_count += 1
            reheat_count = 0
            last_improvement = iteration
            
        elif need_recovery:
            # All recovery exhausted — exit
            break

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