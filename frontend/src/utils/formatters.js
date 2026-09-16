export function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(value ?? 0)
}


export function formatRank(rank) {
  if (!rank) {
    return "Unrated"
  }

  return rank
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    )
}


export function formatTopicName(topic) {
  if (!topic) {
    return ""
  }

  return topic
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    )
}


export function formatDate(
  value
) {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date)
}


export function formatRelativeTime(
  value
) {
  if (!value) {
    return "Unknown time"
  }

  const timestamp =
    new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return "Unknown time"
  }

  const difference =
    Date.now() - timestamp

  const seconds =
    Math.floor(
      difference / 1000
    )

  if (seconds < 60) {
    return "Just now"
  }

  const minutes =
    Math.floor(
      seconds / 60
    )

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours =
    Math.floor(
      minutes / 60
    )

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days =
    Math.floor(
      hours / 24
    )

  if (days < 30) {
    return `${days}d ago`
  }

  return formatDate(value)
}


export function getInitials(
  username
) {
  if (!username) {
    return "CF"
  }

  return username
    .slice(0, 2)
    .toUpperCase()
}


export function truncateText(
  text,
  maxLength = 30
) {
  if (!text || text.length <= maxLength) {
    return text
  }

  return `${text.slice(
    0,
    maxLength
  )}...`
}