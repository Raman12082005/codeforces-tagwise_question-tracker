import {
  BookOpen,
  Code2,
} from "lucide-react"

import {
  formatNumber,
} from "../utils/formatters"


function StatCard({
  profile,
  solvedSeries,
}) {
  const totalSolved =
    profile.totalSolved ?? 0

  const totalTopics =
    profile.totalTopicsCovered ?? 0


  const lastSolved =
    solvedSeries?.length
      ? solvedSeries[
          solvedSeries.length - 1
        ].total
      : totalSolved


  const solvedPercentage =
    lastSolved > 0
      ? Math.min(
          100,
          (lastSolved /
            Math.max(
              lastSolved,
              totalSolved
            )) *
            100
        )
      : 0


  return (
    <section className="panel">

      <div className="section-title-row">

        <div>

          <h2 className="section-title">
            Overall Statistics
          </h2>

          <p className="section-subtitle">
            Snapshot of the analyzed profile
          </p>

        </div>

      </div>


      <div className="stats-grid">

        <div className="donut-stat">

          <div
            className="stat-donut"
            style={{
              "--progress":
                `${solvedPercentage}%`,
            }}
          >
            <div className="stat-donut-inner">
              {formatNumber(
                totalSolved
              )}
            </div>
          </div>


          <div>

            <div className="large-stat-value">
              {formatNumber(
                totalSolved
              )}
            </div>

            <div className="stat-label">
              Total Problems Solved
            </div>

          </div>

        </div>


        <div className="simple-stat">

          <div className="simple-stat-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <div className="large-stat-value">
              {formatNumber(
                totalTopics
              )}
            </div>

            <div className="stat-label">
              Total Topics Covered
            </div>
          </div>

        </div>


        <div className="simple-stat">

          <div className="simple-stat-icon">
            <Code2 size={22} />
          </div>

          <div>
            <div className="large-stat-value">
              {formatNumber(
                profile.topicAnalysis
                  ?.totalProblems ?? totalSolved
              )}
            </div>

            <div className="stat-label">
              Problems in Current Filter
            </div>
          </div>

        </div>

      </div>

    </section>
  )
}


export default StatCard