import {
  Activity,
  Code2,
} from "lucide-react"

import ThemeSelector from "./ThemeSelector"


function Navbar({
  currentTheme,
  onThemeChange,
}) {
  function scrollToSearch() {
    document
      .getElementById("home")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }


  return (
    <header className="site-navbar">

      <div className="navbar-inner">

        <button
          type="button"
          className="brand"
          onClick={scrollToSearch}
        >

          <span className="brand-mark">
            <Code2 size={25} />
          </span>

          <span>
            CF Tracker
          </span>

        </button>


        <nav className="desktop-nav">

          <a href="#home">
            Home
          </a>

          <a href="#profile">
            Profile
          </a>

          <a href="#skills">
            Skills
          </a>

          <a href="#analysis">
            Analysis
          </a>

        </nav>


        <div className="navbar-actions">

          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />

          <button
            type="button"
            className="primary-button navbar-analyze-button"
            onClick={scrollToSearch}
          >
            <Activity size={17} />
            <span className="hidden sm:inline">
              Analyze New Profile
            </span>
            <span className="sm:hidden">
              Analyze
            </span>
          </button>

        </div>

      </div>

    </header>
  )
}


export default Navbar