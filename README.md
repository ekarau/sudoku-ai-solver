# Sudoku AI Solver

This project is a simulation that integrates **Genetic Algorithm (GA)** and **Simulated Annealing (SA)** optimization techniques into a multiplayer Sudoku platform developed at 42 Istanbul. Users can observe in real-time how the AI solves challenging Sudoku puzzles through a visual interface.

---

### 📌 Important: Note for Assignment Review
The core artificial intelligence algorithms developed for this assignment (Topic 3: Optimization Simulation) are located in the following directory:

- **Genetic Algorithm:** `src/api/app/solver_ga.py`
- **Simulated Annealing:** `src/api/app/solver_sa.py`

*(Note: You can update the `src/` path according to your exact folder structure if necessary.)*

---

### 🚀 Features
- **Real-Time Visualization:** Watch live as the algorithms escape local optima and converge on the solution.
- **Dual Algorithm Comparison:** A practical performance comparison between population-based GA and single-trajectory SA.
- **Microservice Architecture:** A fully Dockerized environment utilizing FastAPI, React, and C++ (Game Service).

---

### 🛠️ Setup and Execution

To run the project in your local environment, you only need to have Docker installed:

1. Clone the repository:
   ```bash
   git clone [https://github.com/ekarau/sudoku-ai-solver](https://github.com/ekarau/sudoku-ai-solver)
   cd sudoku-ai-solver