import {
  Check,
  ChevronDown,
  Palette,
} from "lucide-react"

import { THEMES } from "../themes/themes"


function ThemeSelector({
  currentTheme,
  onThemeChange,
}) {
  const theme =
    THEMES[currentTheme]


  return (
    <div className="relative">

      <details className="theme-dropdown">

        <summary className="theme-trigger">

          <Palette size={17} />

          <span className="hidden md:inline">
            Theme
          </span>

          <ChevronDown size={15} />

        </summary>


        <div className="theme-menu">

          {Object.values(THEMES).map(
            (item) => (

              <button
                key={item.id}
                type="button"
                className={
                  `theme-option ${
                    currentTheme === item.id
                      ? "theme-option-active"
                      : ""
                  }`
                }
                onClick={() => {
                  onThemeChange(
                    item.id
                  )

                  document
                    .querySelector(
                      ".theme-dropdown"
                    )
                    ?.removeAttribute(
                      "open"
                    )
                }}
              >

                <span
                  className="theme-swatch"
                  style={{
                    background:
                      `linear-gradient(135deg, ${
                        item.colors.accent
                      }, ${
                        item.colors.accentSecondary
                      })`,
                  }}
                />

                <span>
                  {item.name}
                </span>

                {currentTheme === item.id && (
                  <Check
                    size={16}
                    className="ml-auto"
                  />
                )}

              </button>

            )
          )}

        </div>

      </details>

      {!theme && null}

    </div>
  )
}


export default ThemeSelector