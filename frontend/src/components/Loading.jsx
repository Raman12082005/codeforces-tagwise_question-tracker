import {
  LoaderCircle,
} from "lucide-react"


function Loading({
  message = "Analyzing Codeforces profile...",
}) {
  return (
    <div className="loading-panel">

      <LoaderCircle
        size={32}
        className="loading-icon"
      />

      <strong>
        {message}
      </strong>

      <span>
        Fetching and analyzing public Codeforces data
      </span>

    </div>
  )
}


export default Loading