import os
import time
from collections import defaultdict, deque
from threading import Lock
from typing import Literal

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from analyzer import analyze_profile
from codeforces_api import (
    CodeforcesAPIError,
    get_profile_data,
)


app = FastAPI(
    title="CF Tracker API",
    description=(
        "Public Codeforces profile analytics API."
    ),
    version="2.0.0",
)


def get_cors_origins() -> list[str]:
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,"
        "http://127.0.0.1:5173",
    )

    return [
        origin.strip().rstrip("/")
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


RATE_LIMIT_REQUESTS = int(
    os.getenv(
        "ANALYZE_RATE_LIMIT",
        "8",
    )
)

RATE_LIMIT_WINDOW_SECONDS = 60

_rate_lock = Lock()

_client_requests: dict[
    str,
    deque[float],
] = defaultdict(deque)


def enforce_rate_limit(client_key: str) -> None:

    now = time.monotonic()

    with _rate_lock:

        requests = _client_requests[
            client_key
        ]

        while requests:
            if (
                now - requests[0]
                <= RATE_LIMIT_WINDOW_SECONDS
            ):
                break

            requests.popleft()

        if len(requests) >= RATE_LIMIT_REQUESTS:

            retry_after = int(
                RATE_LIMIT_WINDOW_SECONDS
                - (
                    now - requests[0]
                )
            ) + 1

            raise HTTPException(
                status_code=429,
                detail=(
                    "Rate limit exceeded. "
                    "Please wait before "
                    "analyzing another profile."
                ),
                headers={
                    "Retry-After": str(
                        retry_after
                    )
                },
            )

        requests.append(now)


@app.get("/")
def root():
    return {
        "message":
            "CF Tracker API is running."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/api/analyze/{handle}")
def analyze_user(
    request: Request,
    handle: str,

    min_rating: int | None = Query(
        default=None,
        ge=0,
        le=5000,
    ),

    max_rating: int | None = Query(
        default=None,
        ge=0,
        le=5000,
    ),

    difficulty: Literal[
        "All",
        "Beginner",
        "Easy",
        "Medium",
        "Hard",
        "Expert",
    ] = Query(
        default="All"
    ),
):
    handle = handle.strip()

    if not handle:
        raise HTTPException(
            status_code=400,
            detail="Codeforces handle is required.",
        )

    if (
        min_rating is not None
        and max_rating is not None
        and min_rating > max_rating
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Minimum rating cannot be "
                "greater than maximum rating."
            ),
        )

    client_host = (
        request.client.host
        if request.client
        else "unknown"
    )

    enforce_rate_limit(
        client_host
    )

    try:

        raw_data = get_profile_data(
            handle
        )

        return analyze_profile(
            user=raw_data["user"],
            submissions=raw_data[
                "submissions"
            ],
            rating_history=raw_data[
                "rating_history"
            ],
            submissions_truncated=
                raw_data[
                    "submissions_truncated"
                ],
            min_rating=min_rating,
            max_rating=max_rating,
            difficulty=(
                None
                if difficulty == "All"
                else difficulty
            ),
        )

    except CodeforcesAPIError as exc:

        message = str(exc)

        if "not found" in message.lower():
            raise HTTPException(
                status_code=404,
                detail=(
                    "Codeforces profile "
                    "was not found."
                ),
            ) from exc

        raise HTTPException(
            status_code=502,
            detail=message,
        ) from exc

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred "
                "while analyzing the profile."
            ),
        ) from exc