import {
  Search,
} from "lucide-react"


function SearchForm({
  value,
  onChange,
  onSubmit,
  loading,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="search-form"
    >

      <div className="search-input-wrapper">

        <Search
          size={18}
          className="search-input-icon"
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder="https://codeforces.com/profile/__Raman"
          className="search-input"
          autoComplete="off"
          spellCheck="false"
        />

      </div>


      <button
        type="submit"
        className="primary-button search-button"
        disabled={loading}
      >

        <Search size={18} />

        {loading
          ? "Analyzing..."
          : "Analyze"
        }

      </button>

    </form>
  )
}


export default SearchForm