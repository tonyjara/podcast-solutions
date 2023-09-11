export function formatDurationSeconds(s: number) {
    const hours = Math.floor(s / 3600)
    const minutes = Math.floor((s - hours * 3600) / 60)
    const seconds = s - hours * 3600 - minutes * 60
    const formatedHours = hours < 10 ? `0${hours}` : hours
    const formatedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const formatedSeconds = seconds < 10 ? `0${seconds}` : seconds
    if (hours <= 0) return `${formatedMinutes}:${formatedSeconds}`
    return `${formatedHours}:${formatedMinutes}:${formatedSeconds}`
}
