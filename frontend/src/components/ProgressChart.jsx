import {
  Activity,
  TrendingUp,
} from "lucide-react"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import {
  formatDate,
} from "../utils/formatters"


function ChartTooltip({
  active,
  payload,
  label,
  valueName,
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null
  }

  return (
    <div className="chart-tooltip">

      <div className="chart-tooltip-date">
        {formatDate(label)}
      </div>

      <strong>
        {payload[0].value}
        {" "}
        {valueName}
      </strong>

    </div>
  )
}


function ProgressChart({
  solvedOverTime,
  ratingHistory,
}) {
  return (
    <section
      id="analysis"
      className="charts-grid"
    >

      <div className="panel">

        <div className="section-title-row">

          <div className="icon-heading">

            <Activity size={18} />

            <div>
              <h2 className="section-title">
                Problems Solved Over Time
              </h2>

              <p className="section-subtitle">
                Cumulative unique problems solved
              </p>
            </div>

          </div>

        </div>


        <div className="chart-container">

          {solvedOverTime.length === 0 ? (

            <div className="empty-state">
              Not enough solved-problem history.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={solvedOverTime}
              >

                <defs>
                  <linearGradient
                    id="solvedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--theme-turquoise)"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--theme-turquoise)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>


                <CartesianGrid
                  stroke="var(--theme-grid)"
                  strokeDasharray="3 3"
                  vertical={false}
                />


                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "var(--theme-muted)",
                    fontSize: 11,
                  }}
                  tickFormatter={(
                    value
                  ) =>
                    value.slice(
                      0,
                      7
                    )
                  }
                  minTickGap={30}
                />


                <YAxis
                  tick={{
                    fill: "var(--theme-muted)",
                    fontSize: 11,
                  }}
                  width={40}
                />


                <Tooltip
                  content={
                    <ChartTooltip
                      valueName="problems"
                    />
                  }
                />


                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--theme-turquoise)"
                  strokeWidth={2.5}
                  fill="url(#solvedGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>


      <div className="panel">

        <div className="section-title-row">

          <div className="icon-heading">

            <TrendingUp size={18} />

            <div>
              <h2 className="section-title">
                Rating Progression
              </h2>

              <p className="section-subtitle">
                Codeforces contest rating history
              </p>
            </div>

          </div>

        </div>


        <div className="chart-container">

          {ratingHistory.length === 0 ? (

            <div className="empty-state">
              This profile has no rated contest history.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={ratingHistory}
              >

                <CartesianGrid
                  stroke="var(--theme-grid)"
                  strokeDasharray="3 3"
                  vertical={false}
                />


                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "var(--theme-muted)",
                    fontSize: 11,
                  }}
                  tickFormatter={(
                    value
                  ) =>
                    value.slice(
                      0,
                      7
                    )
                  }
                  minTickGap={30}
                />


                <YAxis
                  tick={{
                    fill: "var(--theme-muted)",
                    fontSize: 11,
                  }}
                  width={45}
                />


                <Tooltip
                  content={
                    <ChartTooltip
                      valueName="rating"
                    />
                  }
                />


                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="var(--theme-turquoise)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>

    </section>
  )
}


export default ProgressChart