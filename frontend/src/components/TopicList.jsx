import {
  Filter,
  SlidersHorizontal,
} from "lucide-react"

import TopicCard from "./TopicCard"


const RATING_OPTIONS = [
  "",
  "800",
  "1000",
  "1200",
  "1400",
  "1600",
  "1800",
  "2000",
  "2200",
  "2400",
  "2600",
  "2800",
  "3000",
]


const DIFFICULTIES = [
  "All",
  "Beginner",
  "Easy",
  "Medium",
  "Hard",
  "Expert",
]


function TopicList({
  topicAnalysis,
  filters,
  onFilterChange,
  onApplyFilters,
  loading,
  coverageWarning,
}) {
  return (
    <section
      id="skills"
      className="panel"
    >

      <div className="topic-section-header">

        <div>
          <h2 className="section-title">
            Topic-wise Problems Solved
          </h2>

          <p className="section-subtitle">
            Tags can overlap, so topic percentages
            do not need to sum to 100%.
          </p>
        </div>


        <div className="filter-toggle">

          <SlidersHorizontal
            size={17}
          />

          Advanced Filter

        </div>

      </div>


      <div className="filters-row">

        <div className="filter-group">

          <label>
            <Filter size={14} />
            Rating Range
          </label>

          <select
            value={
              filters.minRating ?? ""
            }
            onChange={(event) =>
              onFilterChange({
                ...filters,
                minRating:
                  event.target.value
                    ? Number(
                        event.target.value
                      )
                    : null,
              })
            }
          >

            <option value="">
              Any minimum
            </option>

            {RATING_OPTIONS
              .filter(Boolean)
              .map((rating) => (
                <option
                  key={rating}
                  value={rating}
                >
                  {rating}+
                </option>
              ))}

          </select>

        </div>


        <div className="filter-group">

          <label>
            Maximum Rating
          </label>

          <select
            value={
              filters.maxRating ?? ""
            }
            onChange={(event) =>
              onFilterChange({
                ...filters,
                maxRating:
                  event.target.value
                    ? Number(
                        event.target.value
                      )
                    : null,
              })
            }
          >

            <option value="">
              Any maximum
            </option>

            {RATING_OPTIONS
              .filter(Boolean)
              .map((rating) => (
                <option
                  key={rating}
                  value={rating}
                >
                  ≤ {rating}
                </option>
              ))}

          </select>

        </div>


        <div className="filter-group">

          <label>
            Difficulty Level
          </label>

          <select
            value={
              filters.difficulty
            }
            onChange={(event) =>
              onFilterChange({
                ...filters,
                difficulty:
                  event.target.value,
              })
            }
          >

            {DIFFICULTIES.map(
              (difficulty) => (
                <option
                  key={difficulty}
                  value={difficulty}
                >
                  {difficulty}
                </option>
              )
            )}

          </select>

        </div>


        <button
          type="button"
          className="secondary-button filter-apply"
          onClick={onApplyFilters}
          disabled={loading}
        >
          {loading
            ? "Applying..."
            : "Apply Filters"}
        </button>

      </div>


      {coverageWarning && (
        <div className="coverage-warning">
          Some very large profiles may have submission
          history capped by the server's configured
          submission limit.
        </div>
      )}


      <div className="topic-results-meta">
        Showing{" "}
        <strong>
          {topicAnalysis.totalProblems}
        </strong>{" "}
        problems in the current filter
      </div>


      {topicAnalysis.topics.length === 0 ? (

        <div className="empty-state">
          No solved problems match the selected filters.
        </div>

      ) : (

        <div className="topics-grid">

          {topicAnalysis.topics.map(
            (topic) => (

              <TopicCard
                key={topic.name}
                topic={topic}
              />

            )
          )}

        </div>

      )}

    </section>
  )
}


export default TopicList