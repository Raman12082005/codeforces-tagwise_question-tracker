from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any


DIFFICULTY_LEVELS = {
    "Beginner",
    "Easy",
    "Medium",
    "Hard",
    "Expert",
}


def problem_key(problem: dict[str, Any]) -> str:
    contest_id = problem.get("contestId")
    index = problem.get("index")

    if contest_id is not None and index:
        return f"{contest_id}-{index}"

    problemset_name = problem.get("problemsetName")
    if problemset_name and index:
        return f"{problemset_name}-{index}"

    name = problem.get("name", "unknown-problem")

    return f"name:{name.strip().lower()}"


def format_topic_name(topic: str) -> str:
    return topic.replace("-", " ").replace("_", " ").title()


def difficulty_from_rating(
    rating: int | None,
) -> str:
    if rating is None:
        return "Unrated"

    if rating < 1000:
        return "Beginner"

    if rating < 1200:
        return "Easy"

    if rating < 1600:
        return "Medium"

    if rating < 2000:
        return "Hard"

    return "Expert"


def _timestamp_to_iso(timestamp: int | None) -> str | None:
    if timestamp is None:
        return None

    return datetime.fromtimestamp(
        timestamp,
        tz=timezone.utc,
    ).isoformat()


def _timestamp_to_date(timestamp: int) -> str:
    return datetime.fromtimestamp(
        timestamp,
        tz=timezone.utc,
    ).date().isoformat()


def build_solved_problem_index(
    submissions: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    solved: dict[str, dict[str, Any]] = {}

    for submission in submissions:

        if submission.get("verdict") != "OK":
            continue

        problem = submission.get("problem") or {}

        key = problem_key(problem)

        creation_time = submission.get(
            "creationTimeSeconds"
        )

        existing = solved.get(key)

        record = {
            "id": key,
            "contestId": problem.get("contestId"),
            "index": problem.get("index"),
            "name": problem.get(
                "name",
                "Unknown problem",
            ),
            "rating": problem.get("rating"),
            "difficulty": difficulty_from_rating(
                problem.get("rating")
            ),
            "tags": problem.get("tags", []),
            "firstSolvedAt": creation_time,
        }

        if existing is None:
            solved[key] = record
            continue

        if (
            creation_time is not None
            and (
                existing["firstSolvedAt"] is None
                or creation_time < existing["firstSolvedAt"]
            )
        ):
            existing["firstSolvedAt"] = creation_time

    return list(solved.values())


def filter_solved_problems(
    solved_problems: list[dict[str, Any]],
    min_rating: int | None = None,
    max_rating: int | None = None,
    difficulty: str | None = None,
) -> list[dict[str, Any]]:

    filtered = []

    for problem in solved_problems:

        rating = problem.get("rating")

        if min_rating is not None:
            if rating is None or rating < min_rating:
                continue

        if max_rating is not None:
            if rating is None or rating > max_rating:
                continue

        if difficulty and difficulty != "All":
            if problem.get("difficulty") != difficulty:
                continue

        filtered.append(problem)

    return filtered


def build_topic_statistics(
    solved_problems: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    topic_counts = Counter()

    for problem in solved_problems:
        for tag in problem.get("tags", []):
            topic_counts[tag] += 1

    total = len(solved_problems)

    topics = []

    for topic, count in topic_counts.most_common():
        percentage = (
            round((count / total) * 100)
            if total
            else 0
        )

        topics.append(
            {
                "name": topic,
                "label": format_topic_name(topic),
                "count": count,
                "percentage": percentage,
            }
        )

    return topics


def build_heatmap(
    submissions: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    counts = Counter()

    for submission in submissions:
        timestamp = submission.get(
            "creationTimeSeconds"
        )

        if timestamp is None:
            continue

        date = _timestamp_to_date(timestamp)

        counts[date] += 1

    return [
        {
            "date": date,
            "count": count,
        }
        for date, count in sorted(counts.items())
    ]


def build_recent_submissions(
    submissions: list[dict[str, Any]],
    limit: int = 12,
) -> list[dict[str, Any]]:

    ordered = sorted(
        submissions,
        key=lambda item: item.get(
            "creationTimeSeconds",
            0,
        ),
        reverse=True,
    )

    results = []

    seen_ids: set[int] = set()

    for submission in ordered:

        submission_id = submission.get("id")

        if submission_id in seen_ids:
            continue

        seen_ids.add(submission_id)

        problem = submission.get("problem") or {}

        contest_id = problem.get("contestId")
        index = problem.get("index")

        problem_url = None

        if contest_id is not None and index:
            problem_url = (
                f"https://codeforces.com/problemset/problem/"
                f"{contest_id}/{index}"
            )

        results.append(
            {
                "id": submission_id,
                "name": problem.get(
                    "name",
                    "Unknown problem",
                ),
                "verdict": submission.get(
                    "verdict",
                    "UNKNOWN",
                ),
                "rating": problem.get("rating"),
                "difficulty": difficulty_from_rating(
                    problem.get("rating")
                ),
                "tags": problem.get("tags", []),
                "submittedAt": _timestamp_to_iso(
                    submission.get(
                        "creationTimeSeconds"
                    )
                ),
                "problemUrl": problem_url,
                "contestId": contest_id,
                "index": index,
            }
        )

        if len(results) >= limit:
            break

    return results


def build_rating_history(
    rating_history: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    results = []

    for item in rating_history:
        timestamp = item.get(
            "ratingUpdateTimeSeconds"
        )

        new_rating = item.get("newRating")

        if timestamp is None or new_rating is None:
            continue

        results.append(
            {
                "date": _timestamp_to_iso(timestamp),
                "rating": new_rating,
                "newRating": new_rating,
                "oldRating": item.get("oldRating"),
                "contestName": item.get(
                    "contestName",
                    "Contest",
                ),
                "contestId": item.get("contestId"),
                "rank": item.get("rank"),
            }
        )

    results.sort(
        key=lambda item: item["date"]
    )

    return results


def build_solved_over_time(
    solved_problems: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    daily = Counter()

    for problem in solved_problems:

        timestamp = problem.get("firstSolvedAt")

        if timestamp is None:
            continue

        date = _timestamp_to_date(timestamp)

        daily[date] += 1

    cumulative = 0

    results = []

    for date in sorted(daily):
        cumulative += daily[date]

        results.append(
            {
                "date": date,
                "solved": daily[date],
                "total": cumulative,
            }
        )

    return results


def build_difficulty_distribution(
    solved_problems: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    counts = Counter(
        problem.get("difficulty", "Unrated")
        for problem in solved_problems
    )

    ordered = [
        "Beginner",
        "Easy",
        "Medium",
        "Hard",
        "Expert",
        "Unrated",
    ]

    return [
        {
            "level": level,
            "count": counts[level],
        }
        for level in ordered
        if counts[level] > 0
    ]


def analyze_profile(
    user: dict[str, Any],
    submissions: list[dict[str, Any]],
    rating_history: list[dict[str, Any]],
    submissions_truncated: bool,
    min_rating: int | None = None,
    max_rating: int | None = None,
    difficulty: str | None = None,
) -> dict[str, Any]:

    solved_problems = build_solved_problem_index(
        submissions
    )

    filtered_problems = filter_solved_problems(
        solved_problems,
        min_rating=min_rating,
        max_rating=max_rating,
        difficulty=difficulty,
    )

    all_topics: set[str] = set()

    for problem in solved_problems:
        all_topics.update(
            problem.get("tags", [])
        )

    topic_statistics = build_topic_statistics(
        filtered_problems
    )

    ratings = [
        problem["rating"]
        for problem in solved_problems
        if problem.get("rating") is not None
    ]

    minimum_rating = min(ratings) if ratings else None
    maximum_rating = max(ratings) if ratings else None

    return {
        "username": user.get(
            "handle",
            "",
        ),
        "rating": user.get("rating"),
        "rank": user.get("rank"),
        "maxRating": user.get("maxRating"),
        "maxRank": user.get("maxRank"),

        "totalSolved": len(solved_problems),

        "totalTopicsCovered": len(
            all_topics
        ),

        "topicAnalysis": {
            "totalProblems": len(
                filtered_problems
            ),
            "topics": topic_statistics,
            "difficultyDistribution":
                build_difficulty_distribution(
                    filtered_problems
                ),
        },

        "heatmap": build_heatmap(
            submissions
        ),

        "recentSubmissions":
            build_recent_submissions(
                submissions
            ),

        "ratingHistory":
            build_rating_history(
                rating_history
            ),

        "solvedOverTime":
            build_solved_over_time(
                solved_problems
            ),

        "filters": {
            "minRating": min_rating,
            "maxRating": max_rating,
            "difficulty": difficulty or "All",
        },

        "availableRating": {
            "min": minimum_rating,
            "max": maximum_rating,
        },

        "dataCoverage": {
            "submissionsFetched":
                len(submissions),
            "submissionsTruncated":
                submissions_truncated,
        },
    }