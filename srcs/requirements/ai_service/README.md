# AI Sudoku Solver — ai_service

**Course:** Principals of Artificial Intelligence  
**Assignment:** Artificial Intelligence in Action — Applied Programming Project  
**Topic:** Optimization Simulation (Topic 3)

---

## Overview

This service implements two optimization algorithms that solve Sudoku puzzles automatically. It is built as a standalone Python/FastAPI microservice that streams each solving step to the frontend in real-time via Server-Sent Events (SSE), allowing users to watch the AI solve the puzzle step by step.

The problem is modeled as an **Optimization Simulation**: Sudoku is a Constraint Satisfaction Problem (CSP) where the goal is to minimize the number of constraint violations across all rows, columns, and 3×3 boxes. A fitness score of **0** means the puzzle is solved.

---

## Algorithms

### 1. Genetic Algorithm (GA)

Inspired by Darwin's theory of natural selection.

**Encoding:** Each individual in the population is a 9×9 grid. Every row is filled as a permutation of missing digits — this guarantees zero row violations by construction, so only column and box violations need to be minimized.

**Steps:**
1. **Initialization** — Generate a population of 300 random individuals
2. **Fitness Evaluation** — Count column + box constraint violations for each individual (`row_fitness`)
3. **Selection** — Tournament selection (k=5): pick the best out of 5 randomly chosen individuals
4. **Crossover** — Row-based: each row of the child is inherited from either parent with 50% probability
5. **Mutation (row-swap)** — Swap two non-fixed cells within the same row
6. **Mutation (column-swap)** — Swap two non-fixed cells in the same column across different rows; resolves violations that row-swap alone cannot fix
7. **Elitism** — The top 2 individuals always survive to the next generation
8. **Stagnation Recovery** — If no improvement for 30 generations, keep the top 15 individuals and reinitialize the rest
9. **Restart** — After 5 consecutive stagnation recoveries, perform a full population restart while preserving the global best solution

**Local Optimum Avoidance:**  
Column-swap mutation, adaptive mutation rate increase on stagnation, partial and full restarts all work together to escape local optima — directly addressing the assignment requirement to avoid local maximums.

**Parameters:**

| Parameter | Value |
|---|---|
| Population size | 300 |
| Max generations | 10,000 |
| Base mutation rate | 0.15 |
| Stagnation threshold | 30 generations |
| Tournament size | 5 |

---

### 2. Simulated Annealing (SA)

Inspired by the annealing process in metallurgy — heating a metal and cooling it slowly so atoms settle into the lowest energy configuration.

**Encoding:** Each 3×3 box is filled as a permutation of missing digits — this guarantees zero box violations by construction, so only row and column violations need to be minimized.

**Steps:**
1. **Initialization** — Fill each 3×3 box with a random permutation of missing digits
2. **Neighbor Generation** — Pick a random 3×3 box, swap two non-fixed cells within it
3. **Acceptance Criterion:**
   - If the new state is better (delta < 0) → always accept
   - If the new state is worse → accept with probability `e^(-delta / temperature)`
4. **Cooling Schedule** — `temperature *= 0.999997` each iteration
5. **Reheat** — If no improvement for 50,000 iterations, raise the temperature back up (max 5 times)

**Why accept worse solutions?**  
At high temperature, accepting worse moves allows the algorithm to escape local optima and explore the search space broadly. As temperature drops, only improvements are accepted, converging on the optimal solution.

**Parameters:**

| Parameter | Value |
|---|---|
| Initial temperature | 3.0 |
| Cooling rate | 0.999997 |
| Minimum temperature | 0.0001 |
| Reheat threshold | 50,000 iterations without improvement |
| Max reheats | 5 |

---

## Fitness Functions

| Function | Used by | Measures |
|---|---|---|
| `row_fitness` | GA | Column + box violations (rows are valid by construction) |
| `cost_function` | SA | Row + column violations (boxes are valid by construction) |

Both return **0** when the puzzle is fully solved.

---

## Architecture

```
Frontend (React)
    │
    ├── GET  /api/game/generate?difficulty=X  →  game_service (C++)
    │         Returns a 9×9 puzzle board
    │
    └── POST /api/ai/solve                    →  ai_service (Python/FastAPI)
              Body: { board: int[][], algorithm: "ga" | "sa" }
              Returns: SSE stream of step events
```

Each SSE event contains:
```json
{
  "board": [[int, ...]],
  "fitness": int,
  "generation": int | null,
  "temperature": float | null,
  "elapsed": float,
  "status": "solving" | "solved" | "failed"
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Framework | FastAPI |
| Streaming | Server-Sent Events via `sse-starlette` |
| Numerics | NumPy |
| Container | Docker |

---

## File Structure

```
ai_service/
├── Dockerfile
├── requirements.txt
└── app/
    ├── main.py        # FastAPI app, SSE endpoint
    ├── solver_ga.py   # Genetic Algorithm
    ├── solver_sa.py   # Simulated Annealing
    ├── utils.py       # Fitness functions, shared utilities
    └── models.py      # Pydantic request/response models
```

---

## Running

The service runs as part of the Docker Compose setup:

```bash
docker-compose up --build ai_service
```

Health check:
```
GET /api/ai/health
```
