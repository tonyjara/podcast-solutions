import { RegionParams } from "wavesurfer.js/dist/plugins/regions"
import { parseDurationToSeconds } from "./durationUtils"

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
            id: new Date().valueOf().toString(),
            start: parseDurationToSeconds(durationString), // in seconds
            content: parentLiText,
            color: "#0fa824",
        }
        regions.push(newRegion)
    })
    return regions
}
