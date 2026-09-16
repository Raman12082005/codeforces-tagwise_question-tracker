import {
  AtSign,
  Crown,
  Gauge,
  Trophy,
} from "lucide-react"

import {
  formatNumber,
  formatRank,
} from "../utils/formatters"


function ProfileCard({
  profile,
}) {
  return (
    <section
      id="profile"
      className="panel profile-panel"
    >

      <div className="profile-main">

        <div className="profile-avatar">

          <span>
            {profile.username
              ?.slice(0, 1)
              .toUpperCase()}
          </span>

        </div>


        <div className="profile-identity">

          <div className="profile-name-row">

            <h2>
              {profile.username}
            </h2>

            <span className="profile-handle">
              <AtSign size={13} />
              Codeforces Profile
            </span>

          </div>

          <p>
            Public competitive-programming profile
          </p>

        </div>

      </div>


      <div className="profile-stats">

        <div className="profile-stat">
          <div className="profile-stat-label">
            <Trophy size={15} />
            Rank
          </div>

          <strong>
            {formatRank(
              profile.rank
            )}
          </strong>
        </div>


        <div className="profile-stat">
          <div className="profile-stat-label">
            <Gauge size={15} />
            Rating
          </div>

          <strong>
            {profile.rating ??
              "Unrated"}
          </strong>
        </div>


        <div className="profile-stat">
          <div className="profile-stat-label">
            <Crown size={15} />
            Max Rating
          </div>

          <strong>
            {profile.maxRating ??
              "—"}
          </strong>
        </div>


        <div className="profile-stat">
          <div className="profile-stat-label">
            <Trophy size={15} />
            Max Rank
          </div>

          <strong>
            {formatRank(
              profile.maxRank
            )}
          </strong>
        </div>

      </div>

    </section>
  )
}


export default ProfileCard