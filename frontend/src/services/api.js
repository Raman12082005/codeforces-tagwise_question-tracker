const API_BASE_URL =
  (
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "")


export async function analyzeUser(
  handle,
  filters = {}
) {
  const params =
    new URLSearchParams()


  if (
    filters.minRating !== null &&
    filters.minRating !== undefined &&
    filters.minRating !== ""
  ) {
    params.set(
      "min_rating",
      String(filters.minRating)
    )
  }


  if (
    filters.maxRating !== null &&
    filters.maxRating !== undefined &&
    filters.maxRating !== ""
  ) {
    params.set(
      "max_rating",
      String(filters.maxRating)
    )
  }


  if (
    filters.difficulty &&
    filters.difficulty !== "All"
  ) {
    params.set(
      "difficulty",
      filters.difficulty
    )
  }


  const query =
    params.toString()


  const url =
    `${API_BASE_URL}/api/analyze/` +
    `${encodeURIComponent(handle)}` +
    (query ? `?${query}` : "")


  let response

  try {

    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

  } catch {
    throw new Error(
      "Unable to connect to the CF Tracker server."
    )
  }


  let data

  try {
    data = await response.json()
  } catch {
    throw new Error(
      "The server returned an invalid response."
    )
  }


  if (!response.ok) {

    throw new Error(
      data?.detail ||
      "Unable to analyze this Codeforces profile."
    )
  }


  return data
}