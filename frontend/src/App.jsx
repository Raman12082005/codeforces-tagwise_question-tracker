import {
  useEffect,
  useMemo,
  useState,
} from "react"

import Navbar from "./components/Navbar"
import SearchForm from "./components/SearchForm"
import ProfileCard from "./components/ProfileCard"
import StatCard from "./components/StatCard"
import TopicList from "./components/TopicList"
import Heatmap from "./components/Heatmap"
import RecentSubmissions from "./components/RecentSubmissions"
import ProgressChart from "./components/ProgressChart"
import Loading from "./components/Loading"
import ErrorMessage from "./components/ErrorMessage"

import {
  analyzeUser,
} from "./services/api"

import {
  extractHandle,
} from "./utils/validators"

import {
  DEFAULT_THEME,
  THEMES,
} from "./themes/themes"


const STORAGE_KEY =
  "cf-tracker-theme"


const DEFAULT_FILTERS = {
  minRating: null,
  maxRating: null,
  difficulty: "All",
}


function App() {
  const [
    selectedTheme,
    setSelectedTheme,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        )

      return saved &&
        THEMES[saved]
        ? saved
        : DEFAULT_THEME

    } catch {
      return DEFAULT_THEME
    }
  })


  const [
    profileUrl,
    setProfileUrl,
  ] = useState("")


  const [
    activeHandle,
    setActiveHandle,
  ] = useState("")


  const [
    profile,
    setProfile,
  ] = useState(null)


  const [
    loading,
    setLoading,
  ] = useState(false)


  const [
    filterLoading,
    setFilterLoading,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState("")


  const [
    filters,
    setFilters,
  ] = useState(
    DEFAULT_FILTERS
  )


  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState(
    DEFAULT_FILTERS
  )


  const theme =
    THEMES[selectedTheme]


  const themeStyle =
    useMemo(() => {
      const variables = {}

      Object.entries(
        theme.colors
      ).forEach(
        ([key, value]) => {

          const cssName =
            {
              bg:
                "--theme-bg",
              bgSecondary:
                "--theme-bg-secondary",
              panel:
                "--theme-panel",
              panelStrong:
                "--theme-panel-strong",
              border:
                "--theme-border",
              text:
                "--theme-text",
              muted:
                "--theme-muted",
              accent:
                "--theme-accent",
              accentSecondary:
                "--theme-accent-secondary",
              stat:
                "--theme-stat",
              pink:
                "--theme-pink",
              turquoise:
                "--theme-turquoise",
              heatLow:
                "--theme-heat-low",
              heatHigh:
                "--theme-heat-high",
              button:
                "--theme-button",
              buttonText:
                "--theme-button-text",
              navbar:
                "--theme-navbar",
              shadow:
                "--theme-shadow",
            }[key]

          if (cssName) {
            variables[
              cssName
            ] = value
          }
        }
      )

      return variables
    }, [theme])


  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        selectedTheme
      )
    } catch {
      // Local storage may be unavailable
      // in restricted browser contexts.
    }
  }, [selectedTheme])


  async function performAnalysis(
    handle,
    currentFilters,
    showMainLoader = true
  ) {
    setError("")

    if (showMainLoader) {
      setLoading(true)
    } else {
      setFilterLoading(true)
    }


    try {

      const data =
        await analyzeUser(
          handle,
          currentFilters
        )

      setProfile(data)
      setActiveHandle(handle)

      setAppliedFilters(
        currentFilters
      )

    } catch (analysisError) {

      setError(
        analysisError.message
      )

    } finally {

      if (showMainLoader) {
        setLoading(false)
      } else {
        setFilterLoading(false)
      }

    }
  }


  async function handleAnalyze(
    event
  ) {
    event.preventDefault()

    setError("")

    try {

      const handle =
        extractHandle(
          profileUrl
        )

      setProfile(null)

      setFilters(
        DEFAULT_FILTERS
      )

      setAppliedFilters(
        DEFAULT_FILTERS
      )

      await performAnalysis(
        handle,
        DEFAULT_FILTERS,
        true
      )

      requestAnimationFrame(
        () => {
          document
            .getElementById(
              "profile"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
        }
      )

    } catch (
      validationError
    ) {

      setError(
        validationError.message
      )
    }
  }


  async function handleApplyFilters() {
    if (!activeHandle) {
      return
    }

    await performAnalysis(
      activeHandle,
      filters,
      false
    )
  }


  async function handleRetry() {
    if (!activeHandle) {
      setError("")
      return
    }

    await performAnalysis(
      activeHandle,
      appliedFilters,
      true
    )
  }


  return (
    <div
      className="app-shell"
      data-theme={selectedTheme}
      style={themeStyle}
    >

      <Navbar
        currentTheme={
          selectedTheme
        }
        onThemeChange={
          setSelectedTheme
        }
      />


      <main>

        <section
          id="home"
          className="hero-section"
        >

          <div className="hero-glow" />


          <div className="hero-content">

            <div className="eyebrow">
              CODEFORCES ANALYTICS
            </div>


            <h1>
              Understand your
              <span>
                Codeforces progress.
              </span>
            </h1>


            <p>
              Analyze public Codeforces data,
              discover your strongest topics,
              inspect activity patterns and
              track rating progression.
            </p>


            <div className="panel search-panel">

              <div className="search-heading">

                <div>
                  <h2 className="section-title">
                    Analyze Profile
                  </h2>

                  <p className="section-subtitle">
                    Enter any public Codeforces
                    profile URL.
                  </p>
                </div>

              </div>


              <SearchForm
                value={profileUrl}
                onChange={
                  setProfileUrl
                }
                onSubmit={
                  handleAnalyze
                }
                loading={loading}
              />


              <div className="search-hint">
                Example:
                {" "}
                https://codeforces.com/profile/__Raman
              </div>

            </div>

          </div>

        </section>


        <div className="dashboard-container">

          {error && (
            <ErrorMessage
              message={error}
              onRetry={
                activeHandle
                  ? handleRetry
                  : undefined
              }
            />
          )}


          {loading && (
            <Loading />
          )}


          {profile && !loading && (
            <>

              <ProfileCard
                profile={profile}
              />


              <section className="stats-layout">

                <StatCard
                  profile={
                    profile
                  }
                  solvedSeries={
                    profile.solvedOverTime
                  }
                />

                <Heatmap
                  data={
                    profile.heatmap
                  }
                />

              </section>


              <TopicList
                topicAnalysis={
                  profile.topicAnalysis
                }
                filters={
                  filters
                }
                onFilterChange={
                  setFilters
                }
                onApplyFilters={
                  handleApplyFilters
                }
                loading={
                  filterLoading
                }
                coverageWarning={
                  profile.dataCoverage
                    ?.submissionsTruncated
                }
              />


              <section className="activity-layout">

                <RecentSubmissions
                  submissions={
                    profile.recentSubmissions
                  }
                />

                <aside className="panel insight-card">

                  <div className="insight-badge">
                    LIVE PROFILE ANALYSIS
                  </div>

                  <h2>
                    Your Codeforces profile,
                    presented as a personal
                    analytics dashboard.
                  </h2>

                  <p>
                    Switch themes from the
                    navbar, explore topic
                    filters and inspect your
                    activity without creating
                    an account.
                  </p>


                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      document
                        .getElementById(
                          "home"
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                        })
                    }
                  >
                    Analyze Another Profile
                  </button>

                </aside>

              </section>


              <ProgressChart
                solvedOverTime={
                  profile.solvedOverTime
                }
                ratingHistory={
                  profile.ratingHistory
                }
              />


              {profile.dataCoverage
                ?.submissionsTruncated && (

                <div className="coverage-note">
                  This profile has more submission
                  history than the configured fetch
                  limit. Current activity and older
                  analytics may therefore be incomplete.
                </div>

              )}

            </>
          )}


          {!profile &&
            !loading &&
            !error && (

              <section className="empty-dashboard">

                <div className="empty-dashboard-icon">
                  ⚡
                </div>

                <h2>
                  Your analytics dashboard
                  is waiting.
                </h2>

                <p>
                  Enter a Codeforces profile above
                  to generate the complete analysis.
                </p>

              </section>

            )}

        </div>

      </main>


      <footer className="site-footer">

        <div>
          CF Tracker
        </div>

        <span>
          Public Codeforces analytics · No account required
        </span>

      </footer>

    </div>
  )
}

export default App