const CODEFORCES_HANDLE_PATTERN =
  /^[A-Za-z0-9_.-]+$/


export function extractHandle(value) {
  const raw = value.trim()

  if (!raw) {
    throw new Error(
      "Please enter a Codeforces profile URL."
    )
  }


  let url

  try {
    const normalized = raw.startsWith(
      "http://"
    ) || raw.startsWith(
      "https://"
    )
      ? raw
      : `https://${raw}`

    url = new URL(normalized)

  } catch {
    if (
      CODEFORCES_HANDLE_PATTERN.test(raw)
    ) {
      return raw
    }

    throw new Error(
      "Please enter a valid Codeforces profile URL."
    )
  }


  const hostname =
    url.hostname.toLowerCase()


  const validHost =
    hostname === "codeforces.com" ||
    hostname === "www.codeforces.com"


  if (!validHost) {
    throw new Error(
      "Please enter a valid Codeforces profile URL."
    )
  }


  const parts =
    url.pathname
      .split("/")
      .filter(Boolean)


  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== "profile" ||
    !parts[1] ||
    !CODEFORCES_HANDLE_PATTERN.test(
      parts[1]
    )
  ) {
    throw new Error(
      "Please enter a valid Codeforces profile URL."
    )
  }


  return parts[1]
}