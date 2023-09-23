import { RegionParams } from "wavesurfer.js/dist/plugins/regions"
import {
    formatSecondsToDuration,
    parseDurationToSeconds,
} from "./durationUtils"

export const extractTimestampsFromShowNotes = (
    showNotes: string
): RegionParams[] => {
    // Create a DOMParser
    const parser = new DOMParser()

    // Parse the HTML string
    const doc = parser.parseFromString(showNotes, "text/html")

    // Select all <a> tags within the parsed document
    const aTags = doc.querySelectorAll("a")

    // Initialize an array to store the href values
    const regions: any[] = []

    // Loop through the <a> tags and push their href values into the array
    aTags.forEach((aTag) => {
        const href = aTag.getAttribute("href")

        if (!href?.includes("#t=")) return
        // Get the closest <li> tag to the <a> tag and extract the text content
        const parentLi = aTag.closest("li")
        const parentLiText = parentLi?.textContent?.trim()
        const durationString = aTag.textContent?.trim()

        const newRegion: RegionParams = {
            //Duraion is the id so that we can find it easier when updating or deleting the region
            id: durationString,
            start: parseDurationToSeconds(durationString), // in seconds
            content: parentLiText,
            color: "#0fa824",
        }
        regions.push(newRegion)
    })
    return regions
}

export const updateTextTimestamp = ({
    text,
    newStart,
    id,
}: {
    text: string
    newStart: number
    id: string
}): string => {
    // Create a DOMParser
    const parser = new DOMParser()

    // Parse the HTML string
    const doc = parser.parseFromString(text, "text/html")
    const aTagToReplace = [...doc.querySelectorAll("a")].find(
        (aTag) => aTag?.textContent?.includes(id)
    )

    if (aTagToReplace) {
        const newDuration = formatSecondsToDuration(newStart)

        /* aTagToReplace.textContent = newDuration */
        aTagToReplace.setAttribute("href", `#t=${newDuration}`)
        //add a strong tag to the a tag
        const strongTag = doc.createElement("strong")
        strongTag.textContent = newDuration
        aTagToReplace.innerHTML = ""
        aTagToReplace.appendChild(strongTag)
    }

    return doc.documentElement.outerHTML
}

export const deleteTimestamp = ({
    timestampStartInSeconds,
    showNotes,
}: {
    timestampStartInSeconds: number
    showNotes: string
}): string => {
    // Create a DOMParser
    const parser = new DOMParser()

    // Parse the HTML string
    const doc = parser.parseFromString(showNotes, "text/html")
    const liTags = doc.querySelectorAll("li")
    const timestampDuration = formatSecondsToDuration(timestampStartInSeconds)

    liTags.forEach((liTag) => {
        const aTag = liTag.querySelector(`a[href*="#t=${timestampDuration}"]`)
        if (aTag) {
            if (!liTag.parentNode) return
            // Remove both the <li> and <a> tags if the specific content is found
            liTag.parentNode.removeChild(liTag)
        }
    })

    return doc.documentElement.outerHTML
}
