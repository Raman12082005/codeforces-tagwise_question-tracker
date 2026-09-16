import os
import threading
import time
from typing import Any

import requests


BASE_URL = "https://codeforces.com/api"

MIN_REQUEST_INTERVAL = float(
    os.getenv("CODEFORCES_MIN_REQUEST_INTERVAL", "2.0")
)

CACHE_TTL_SECONDS = int(
    os.getenv("PROFILE_CACHE_TTL_SECONDS", "300")
)

SUBMISSION_PAGE_SIZE = 10000

MAX_SUBMISSIONS = int(
    os.getenv("MAX_SUBMISSIONS", "30000")
)

REQUEST_TIMEOUT_SECONDS = int(
    os.getenv("CODEFORCES_REQUEST_TIMEOUT", "15")
)


class CodeforcesAPIError(Exception):
    """Raised when Codeforces returns an API-level error."""


_request_lock = threading.Lock()
_cache_lock = threading.Lock()

_last_request_time = 0.0

_profile_cache: dict[str, dict[str, Any]] = {}


def _wait_for_rate_limit() -> None:
    """
    Ensure requests sent to Codeforces are spaced out.
    """
    global _last_request_time

    with _request_lock:
        now = time.monotonic()
        elapsed = now - _last_request_time

        if elapsed < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - elapsed)

        _last_request_time = time.monotonic()


def _make_request(
    endpoint: str,
    params: dict[str, Any] | None = None,
    retries: int = 2,
) -> Any:
    """
    Perform a rate-limited request to the Codeforces API.
    """

    url = f"{BASE_URL}/{endpoint}"

    last_error: Exception | None = None

    for attempt in range(retries + 1):
        try:
            _wait_for_rate_limit()

            response = requests.get(
                url,
                params=params,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )

            response.raise_for_status()

            data = response.json()

            if data.get("status") != "OK":
                raise CodeforcesAPIError(
                    data.get(
                        "comment",
                        "Codeforces API returned an error.",
                    )
                )

            return data.get("result")

        except CodeforcesAPIError:
            raise

        except requests.RequestException as exc:
            last_error = exc

            if attempt >= retries:
                break

            time.sleep(1.5 * (attempt + 1))

        except ValueError as exc:
            last_error = exc

            if attempt >= retries:
                break

            time.sleep(1.0)

    raise CodeforcesAPIError(
        f"Unable to communicate with Codeforces API: {last_error}"
    )


def _get_cached_profile(handle: str) -> dict[str, Any] | None:
    key = handle.lower()

    with _cache_lock:
        cached = _profile_cache.get(key)

        if not cached:
            return None

        if time.monotonic() >= cached["expires_at"]:
            del _profile_cache[key]
            return None

        return cached["data"]


def _set_cached_profile(
    handle: str,
    data: dict[str, Any],
) -> None:
    key = handle.lower()

    with _cache_lock:
        _profile_cache[key] = {
            "expires_at": time.monotonic() + CACHE_TTL_SECONDS,
            "data": data,
        }


def get_user_info(handle: str) -> list[dict[str, Any]]:
    return _make_request(
        "user.info",
        {
            "handles": handle,
        },
    )


def get_user_submissions(
    handle: str,
) -> tuple[list[dict[str, Any]], bool]:
    """
    Retrieve submissions in pages.

    Returns:
        submissions
        truncated -> True when MAX_SUBMISSIONS was reached
    """

    submissions: list[dict[str, Any]] = []

    start = 1

    while start <= MAX_SUBMISSIONS:
        remaining = MAX_SUBMISSIONS - len(submissions)

        count = min(
            SUBMISSION_PAGE_SIZE,
            remaining,
        )

        batch = _make_request(
            "user.status",
            {
                "handle": handle,
                "from": start,
                "count": count,
            },
        )

        if not batch:
            break

        submissions.extend(batch)

        if len(batch) < count:
            break

        start += len(batch)

    truncated = len(submissions) >= MAX_SUBMISSIONS

    return submissions, truncated


def get_user_rating_history(
    handle: str,
) -> list[dict[str, Any]]:
    return _make_request(
        "user.rating",
        {
            "handle": handle,
        },
    )


def get_profile_data(
    handle: str,
    force_refresh: bool = False,
) -> dict[str, Any]:

    if not force_refresh:
        cached = _get_cached_profile(handle)

        if cached is not None:
            return cached

    user_info = get_user_info(handle)

    if not user_info:
        raise CodeforcesAPIError(
            "Codeforces profile was not found."
        )

    user = user_info[0]

    submissions, submissions_truncated = get_user_submissions(
        user["handle"]
    )

    rating_history = get_user_rating_history(
        user["handle"]
    )

    data = {
        "user": user,
        "submissions": submissions,
        "rating_history": rating_history,
        "submissions_truncated": submissions_truncated,
    }

    _set_cached_profile(
        handle,
        data,
    )

    return data