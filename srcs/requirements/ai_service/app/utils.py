import numpy as np


def get_fixed_positions(puzzle: list[list[int]]) -> set[tuple[int, int]]:
    """Returns positions of clue cells (non-zero values)."""
    fixed = set()
    for r in range(9):
        for c in range(9):
            if puzzle[r][c] != 0:
                fixed.add((r, c))
    return fixed


def fitness(grid: np.ndarray) -> int:
    """
    Counts total constraint violations across rows, columns and 3x3 boxes.
    Returns 0 when the grid is a valid solution.
    """
    score = 0

    for i in range(9):
        score += 9 - len(set(grid[i, :]))
        score += 9 - len(set(grid[:, i]))

    for box_r in range(3):
        for box_c in range(3):
            block = grid[box_r * 3:(box_r + 1) * 3, box_c * 3:(box_c + 1) * 3]
            score += 9 - len(set(block.flatten()))

    return score


def row_fitness(grid: np.ndarray) -> int:
    """
    Counts column and 3x3 box violations only.
    Used by GA where rows are constructed as permutations (no row violations).
    """
    score = 0

    for i in range(9):
        score += 9 - len(set(grid[:, i]))

    for box_r in range(3):
        for box_c in range(3):
            block = grid[box_r * 3:(box_r + 1) * 3, box_c * 3:(box_c + 1) * 3]
            score += 9 - len(set(block.flatten()))

    return score


def cost_function(grid: np.ndarray) -> int:
    """
    Counts row and column violations only.
    Used by SA where 3x3 boxes are constructed as permutations (no box violations).
    """
    score = 0

    for i in range(9):
        score += 9 - len(set(grid[i, :]))
        score += 9 - len(set(grid[:, i]))

    return score
