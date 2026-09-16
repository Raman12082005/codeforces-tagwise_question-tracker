import {
  Braces,
} from "lucide-react"

import {
  formatNumber,
} from "../utils/formatters"


function TopicCard({
  topic,
}) {
  return (
    <article className="topic-card">

      <div className="topic-card-header">

        <div className="topic-name">

          <span className="topic-icon">
            <Braces size={16} />
          </span>

          <span>
            {topic.label}
          </span>

        </div>


        <span className="topic-percentage">
          {topic.percentage}%
        </span>

      </div>


      <div className="topic-progress-track">

        <div
          className="topic-progress-fill"
          style={{
            width:
              `${Math.min(
                100,
                topic.percentage
              )}%`,
          }}
        />

      </div>


      <div className="topic-footer">
        {formatNumber(
          topic.count
        )} Problems Solved
      </div>

    </article>
  )
}


export default TopicCard