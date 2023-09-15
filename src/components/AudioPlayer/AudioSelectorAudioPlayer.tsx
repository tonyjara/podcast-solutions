import React, {
    MutableRefObject,
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { Box, Button, ButtonGroup, Flex } from "@chakra-ui/react"
import WaveSurfer from "wavesurfer.js"
export interface TimestampAudioPlayerProps {
    src: string
    duration: number
}

// NOTE: Chrome blocked autoplay before user interacts with the page
export default function AudioSelectorAudioPlayer({
    track,
}: {
    track: TimestampAudioPlayerProps
}) {
    const wsContainerRef = useRef<HTMLDivElement>(null)
    const wavesurferRef = useRef<WaveSurfer | null>(null)

    useEffect(() => {
        if (!wsContainerRef.current) return

        wavesurferRef.current = WaveSurfer.create({
            container: wsContainerRef.current,
            waveColor: "rgb(200, 0, 200)",
            progressColor: "rgb(100, 0, 100)",
            url: track.src,
            barWidth: 3,
            cursorWidth: 1,
            height: 80,
            cursorColor: "transparent",
        })
        return () => wavesurferRef.current?.destroy()
    }, [])

    return (
        <>
            <Box w="100%">
                <div ref={wsContainerRef}></div>
                <audio id="track" src={track.src} />
            </Box>
        </>
    )
}
