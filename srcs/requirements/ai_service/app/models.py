from pydantic import BaseModel


class SolveRequest(BaseModel):
    board: list[list[int]]
    algorithm: str  # "ga" or "sa"


class StepEvent(BaseModel):
    board: list[list[int]]
    fitness: int
    generation: int | None = None
    temperature: float | None = None
    elapsed: float
    status: str  # "solving", "solved", "failed"
