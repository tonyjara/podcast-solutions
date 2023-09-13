import { isAfter } from "date-fns"

export const isScheduled = (dateToCheck: Date | null) => {
    if (!dateToCheck) return false
    return isAfter(dateToCheck, new Date())
}
