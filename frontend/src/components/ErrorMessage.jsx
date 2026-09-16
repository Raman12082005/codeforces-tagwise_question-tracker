import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react"


function ErrorMessage({
  message,
  onRetry,
}) {
  return (
    <div className="error-panel">

      <div className="error-icon">
        <AlertTriangle size={20} />
      </div>


      <div className="error-content">

        <strong>
          Analysis failed
        </strong>

        <p>
          {message}
        </p>

      </div>


      {onRetry && (
        <button
          type="button"
          className="secondary-button"
          onClick={onRetry}
        >
          <RefreshCw
            size={15}
          />

          Retry
        </button>
      )}

    </div>
  )
}


export default ErrorMessage