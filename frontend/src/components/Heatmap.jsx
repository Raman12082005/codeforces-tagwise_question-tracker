import {
  CalendarDays,
} from "lucide-react"


function getHeatIntensity(
  count,
  maximum
) {
  if (!count || !maximum) {
    return 0.05
  }

  const normalized =
    count / maximum

  return Math.max(
    0.12,
    Math.pow(
      normalized,
      0.65
    )
  )
}


function createDateRange(
  days = 364
) {
  const dates = []

  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0
  )

  const start =
    new Date(today)

  start.setDate(
    start.getDate() - days
  )

  for (
    let index = 0;
    index <= days;
    index += 1
  ) {
    const date =
      new Date(start)

    date.setDate(
      start.getDate() + index
    )

    dates.push(
      date
        .toISOString()
        .slice(0, 10)
    )
  }

  return dates
}


function Heatmap({
  data,
}) {
  const dateMap =
    new Map(
      data.map(
        (item) => [
          item.date,
          item.count,
        ]
      )
    )


  const dates =
    createDateRange()


  const maximum =
    Math.max(
      1,
      ...data.map(
        (item) => item.count
      )
    )


  return (
    <section className="panel">

      <div className="section-title-row">

        <div>

          <div className="icon-heading">

            <CalendarDays
              size={18}
            />

            <h2 className="section-title">
              Submission Activity Heatmap
            </h2>

          </div>

          <p className="section-subtitle">
            Daily submission activity over the last year
          </p>

        </div>


        <span className="small-pill">
          Year
        </span>

      </div>


      <div className="heatmap-shell">

        <div className="heatmap-months">
          <span>Jan</span>
          <span>Apr</span>
          <span>Jul</span>
          <span>Oct</span>
        </div>


        <div className="heatmap-grid">

          {dates.map(
            (date) => {

              const count =
                dateMap.get(
                  date
                ) || 0

              return (
                <div
                  key={date}
                  className="heatmap-cell"
                  title={`${date}: ${count} submission${
                    count === 1
                      ? ""
                      : "s"
                  }`}
                  style={{
                    background:
                      "var(--theme-heat-high)",
                    opacity:
                      getHeatIntensity(
                        count,
                        maximum
                      ),
                  }}
                />
              )
            }
          )}

        </div>


        <div className="heatmap-legend">

          <span>
            Less
          </span>

          <i className="legend-cell legend-low" />
          <i className="legend-cell legend-mid" />
          <i className="legend-cell legend-high" />

          <span>
            More
          </span>

        </div>

      </div>

    </section>
  )
}


export default Heatmap