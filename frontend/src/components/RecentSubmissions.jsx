import {
  CheckCircle2,
  ExternalLink,
  XCircle,
} from "lucide-react"

import {
  formatRelativeTime,
  truncateText,
} from "../utils/formatters"


function RecentSubmissions({
  submissions,
}) {
  return (
    <section className="panel">

      <div className="section-title-row">

        <div>

          <h2 className="section-title">
            Recent Submissions
          </h2>

          <p className="section-subtitle">
            Latest activity from this Codeforces profile
          </p>

        </div>

      </div>


      <div className="submission-list">

        {submissions.length === 0 ? (

          <div className="empty-state">
            No recent submissions found.
          </div>

        ) : (

          submissions.map(
            (submission) => {

              const accepted =
                submission.verdict === "OK"

              return (
                <a
                  key={submission.id}
                  href={
                    submission.problemUrl ||
                    "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="submission-item"
                >

                  <div
                    className={
                      `submission-status ${
                        accepted
                          ? "status-success"
                          : "status-failed"
                      }`
                    }
                  >

                    {accepted ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <XCircle size={19} />
                    )}

                  </div>


                  <div className="submission-info">

                    <strong>
                      {truncateText(
                        submission.name,
                        42
                      )}
                    </strong>

                    <span>
                      {accepted
                        ? "Solved"
                        : submission.verdict}
                    </span>

                  </div>


                  <div className="submission-meta">

                    <span>
                      {submission.rating
                        ? `Rating ${submission.rating}`
                        : submission.difficulty}
                    </span>

                    <span>
                      {formatRelativeTime(
                        submission.submittedAt
                      )}
                    </span>

                  </div>


                  <ExternalLink
                    size={16}
                    className="submission-link-icon"
                  />

                </a>
              )
            }
          )

        )}

      </div>

    </section>
  )
}


export default RecentSubmissions