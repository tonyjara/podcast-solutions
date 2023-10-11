import { RegionParams } from "wavesurfer.js/dist/plugins/regions"
import {
    formatSecondsToDuration,
    parseDurationToSeconds,
} from "./durationUtils"

export const extractTimestampsFromShowNotes = (
    showNotes: string
): RegionParams[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(showNotes, "text/html")

    const regions: any[] = []

    const tags = doc.body.querySelectorAll("strong")

    tags.forEach((tag) => {
        const innerText = tag.innerHTML
        /* const innerText = tag.firstChild?.innerText */
        const timestampsMatch = innerText?.match(
            /(\d{1,2}:\d{2}|\d:\d{2}:\d{2})/g
        )

        if (!timestampsMatch?.length) return
        const timeStamp = timestampsMatch?.[0]

        if (
            timeStamp &&
            /* timestampsMatch.length === 2 && */
            regions.every((region) => region.id !== timeStamp)
        ) {
            const newRegion: RegionParams = {
                //Duraion is the id so that we can find it easier when updating or deleting the region
                id: timeStamp,
                start: parseDurationToSeconds(timeStamp), // in seconds
                /* content: tag.textContent?.replace("(", "").replace(")", ""), */
                content: `${timeStamp} ${tag.nextSibling?.textContent?.substring(
                    0,
                    20
                )}...`,
                color: "#0fa824",
            }
            regions.push(newRegion)
        }
    })

    /* // Select all <a> tags within the parsed document */
    /* const aTags = doc.querySelectorAll("a") */
    /* // Loop through the <a> tags and push their href values into the array */
    /* aTags.forEach((aTag) => { */
    /*     const href = aTag.getAttribute("href") */
    /**/
    /*     if (!href?.includes("#t=")) return */
    /*     // Get the closest <li> tag to the <a> tag and extract the text content */
    /*     const parentLi = aTag.closest("li") */
    /*     const parentLiText = parentLi?.textContent?.trim() */
    /*     const durationString = aTag.textContent?.trim() */
    /**/
    /*     const newRegion: RegionParams = { */
    /*         //Duraion is the id so that we can find it easier when updating or deleting the region */
    /*         id: durationString, */
    /*         start: parseDurationToSeconds(durationString), // in seconds */
    /*         content: parentLiText, */
    /*         color: "#0fa824", */
    /*     } */
    /*     regions.push(newRegion) */
    /* }) */

    return regions
}

/**NOTE: Used to change show notes when moving a timestamp */
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
    const tags = doc.body.querySelectorAll("strong")

    //As long as it matches the format and has bold tags, it will be updated
    tags.forEach((tag) => {
        const timestampsMatch = tag.innerHTML?.match(
            /(\d{1,2}:\d{2}|\d:\d{2}:\d{2})/g
        )

        if (!timestampsMatch?.length) return

        if (tag?.textContent?.includes(id)) {
            const newDuration = formatSecondsToDuration(newStart)
            tag.textContent = tag.textContent?.replace(id, newDuration)
        }
    })

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
