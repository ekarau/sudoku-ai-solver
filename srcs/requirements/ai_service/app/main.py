import json
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from .models import SolveRequest
from .solver_ga import solve_ga
from .solver_sa import solve_sa

app = FastAPI(title="AI Sudoku Solver")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai_service"}


@app.post("/solve")
async def solve(request: SolveRequest):
    """SSE endpoint that solves a Sudoku puzzle and streams each step."""

    async def event_generator():
        if request.algorithm == "ga":
            solver = solve_ga(request.board)
        elif request.algorithm == "sa":
            solver = solve_sa(request.board)
        else:
            yield {
                "event": "error",
                "data": json.dumps({"error": "Invalid algorithm. Use 'ga' or 'sa'."}),
            }
            return

        for step in solver:
            yield {
                "event": "step",
                "data": json.dumps(step),
            }
            await asyncio.sleep(0.005)

        yield {
            "event": "done",
            "data": json.dumps({"message": "Solving complete"}),
        }

    return EventSourceResponse(
        event_generator(),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
