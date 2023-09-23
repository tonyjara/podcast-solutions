import React, { useEffect, useRef, useState } from "react"
import {
    Box,
    Flex,
    Icon,
    IconButton,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
} from "@chakra-ui/react"
import WaveSurfer from "wavesurfer.js"
import WsRegions, { Region } from "wavesurfer.js/dist/plugins/regions"
import { trpcClient } from "@/utils/api"
import { TbPlayerPause, TbPlayerPlay } from "react-icons/tb"
import {
    IoMdVolumeHigh,
    IoMdVolumeLow,
    IoMdVolumeMute,
    IoMdVolumeOff,
} from "react-icons/io"
import {
    MdGraphicEq,
    MdOutlineNavigateNext,
    MdOutlineNavigateBefore,
} from "react-icons/md"
import { BsZoomIn, BsZoomOut } from "react-icons/bs"
import {
    deleteTimestamp,
    extractTimestampsFromShowNotes,
    updateTextTimestamp,
} from "@/lib/utils/timestampUtils"
import { useRouter } from "next/router"
import {
    formatSecondsToDuration,
    parseDurationToSeconds,
} from "@/lib/utils/durationUtils"
import { Episode } from "@prisma/client"
import { UseFormGetValues, UseFormSetValue } from "react-hook-form"
import { throttle } from "lodash"
import TimestampNamePopover from "./TimestampNamePopover"

// NOTE: Chrome blocked autoplay before user interacts with the page and there's a running issue on wavesurfer
export default function TimestampHandler({
    episodeId,
    showNotes,
    setValue,
    getValues,
}: {
    episodeId: string | undefined
    showNotes: string
    setValue: UseFormSetValue<Episode>
    getValues: UseFormGetValues<Episode>
}) {
    //states
    const router = useRouter()
    const [progressInSeconds, setProgressInSeconds] = useState(0)
    const [volume, setVolume] = useState(100)
    const [muteVolume, setMuteVolume] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    //refs
    const regionsAreLoaded = useRef(false)
    const wsContainerRef = useRef<HTMLDivElement>(null)
    const regionsRef = useRef<WsRegions | null>(null)
    const ws = useRef<WaveSurfer | null>(null)

    //db calls
    const { data: selectedAudio } =
        trpcClient.audioFile.getSelectedAudioFileForEpisode.useQuery(
            {
                episodeId: episodeId,
            },
            { refetchOnWindowFocus: false, enabled: !!episodeId }
        )

    //Effects
    //WaveSurfer and regions ref
    useEffect(() => {
        if (!wsContainerRef.current || !selectedAudio?.peaks.length) return

        regionsRef.current = WsRegions.create()

        regionsRef.current.on("region-updated", (region: Region) => {
            const notes = getValues("showNotes")

            const updatedNotes = updateTextTimestamp({
                id: region.id,
                text: notes,
                newStart: region.start,
            })
            setValue("showNotes", updatedNotes)
        })

        //remove timestamp when double clicked
        regionsRef.current.on("region-double-clicked", (region) => {
            const notes = getValues("showNotes")
            const notesWithoutTimestamp = deleteTimestamp({
                timestampStartInSeconds: region.start,
                showNotes: notes,
            })
            setValue("showNotes", notesWithoutTimestamp)
        })

        ws.current = WaveSurfer.create({
            container: wsContainerRef.current,
            dragToSeek: true,
            url: selectedAudio.url,
            barWidth: 3,
            autoplay: false,
            cursorWidth: 5,
            cursorColor: "orange",
            /* waveColor: "#orange", */
            height: 300,
            hideScrollbar: true,
            peaks: selectedAudio.peaks.length
                ? (selectedAudio.peaks as any)
                : undefined,
            plugins: [regionsRef.current],
        })

        //Add timestamps whenever the waveform is first loaded
        // After that prevent re render with ref
        ws.current.on("redraw", function () {
            if (regionsAreLoaded.current) return
            regionsAreLoaded.current = true
            const regionsRefCurrent = regionsRef.current
            if (!regionsRefCurrent) return

            const regionsFromShowNotes =
                extractTimestampsFromShowNotes(showNotes)
            regionsFromShowNotes.forEach((region: any) => {
                regionsRefCurrent.addRegion(region)
            })
        })

        //Set progress bar state
        ws.current.on("timeupdate", function (curretTimeInSeconds: number) {
            const updateOncePerSec = throttle(
                () => setProgressInSeconds(curretTimeInSeconds),
                1000
            )
            /* setProgressInSeconds(curretTimeInSeconds) */
            updateOncePerSec()
        })

        //Playback ends
        ws.current.on("finish", function () {
            if (!ws.current) return
            ws.current.seekTo(0)
            setProgressInSeconds(0)
            setIsPlaying(false)
        })
        return () => {
            ws.current?.destroy()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAudio?.isSelected])

    //Set regions from show notes changes
    useEffect(() => {
        const regionsRefCurrent = regionsRef.current
        if (!regionsRefCurrent) return
        const regionsFromShowNotes = extractTimestampsFromShowNotes(showNotes)
        regionsFromShowNotes.forEach((region: any) => {
            regionsRefCurrent.addRegion(region)
        })

        return () => {
            regionsRefCurrent?.clearRegions()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNotes])

    //Set time progress from url
    useEffect(() => {
        if (!router.query.t || !ws.current || !selectedAudio) return
        const timeStampInSeconds = parseDurationToSeconds(router.query.t)
        setProgressInSeconds(timeStampInSeconds)
        const percentagePlayed =
            (timeStampInSeconds * 100) / selectedAudio.duration
        ws.current.seekTo(percentagePlayed / 100)
        return () => {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query])

    // Volume slider
    useEffect(() => {
        if (!ws.current) return
        if (muteVolume) return ws.current.setVolume(0)
        ws.current.setVolume(volume / 100)
    }, [volume, muteVolume])

    //controls
    const togglePlayPause = () => {
        if (isPlaying) {
            ws.current?.pause()
            return setIsPlaying(false)
        }
        ws.current?.play()
        return setIsPlaying(true)
    }

    const handleVolumeSliderIcon = () => {
        if (muteVolume) return IoMdVolumeOff
        if (volume > 50) return IoMdVolumeHigh
        if (volume > 0) return IoMdVolumeLow
        return IoMdVolumeMute
    }

    // Progress bar
    const handleProgressBarChange = (e: number) => {
        setProgressInSeconds(e)
        if (!ws.current || !selectedAudio) return
        const newTime = isFinite(e) ? e : 0
        const percentagePlayed = (newTime * 100) / selectedAudio.duration
        ws.current.seekTo(percentagePlayed / 100)
    }

    // Zoom buttons
    const handleZoomIn = () => {
        if (!ws.current) return
        const newZoom = ws.current.options.minPxPerSec + 1
        ws.current.zoom(newZoom)
        //Center the cursor when zooming
        const percentagePlayed =
            (progressInSeconds * 100) / (selectedAudio?.duration ?? 1)

        ws.current.seekTo(percentagePlayed / 100)
    }

    const handleZoomOut = () => {
        if (!ws.current) return
        const currentZoom = ws.current.options.minPxPerSec
        if (currentZoom <= 1) return ws.current.zoom(0)
        const newZoom = currentZoom - 1
        ws.current.zoom(newZoom)
        //Center the cursor when zooming
        const percentagePlayed =
            (progressInSeconds * 100) / (selectedAudio?.duration ?? 1)

        ws.current.seekTo(percentagePlayed / 100)
    }
    //Go to the previous timestamp
    const handlePreviousTimeSamp = () => {
        if (!ws.current || !regionsRef.current || !selectedAudio) return
        const regions = regionsRef.current?.getRegions()
        if (!regions) return
        //Get the next region, offset by 1 second to avoid going to the same region
        const previousRegion = regions
            .toReversed()
            .find((r) => r.start < progressInSeconds - 1)
        if (!previousRegion) return

        setProgressInSeconds(previousRegion.start)
        const percentagePlayed =
            (previousRegion.start * 100) / selectedAudio.duration
        ws.current.seekTo(percentagePlayed / 100)
    }
    //Go to the next timestamp
    const handleNextTimestamp = () => {
        if (!ws.current || !regionsRef.current || !selectedAudio) return
        const regions = regionsRef.current?.getRegions()
        if (!regions) return
        //Get the next region, offset by 1 second to avoid going to the same region
        const nextRegion = regions.find((r) => r.start > progressInSeconds + 1)
        if (!nextRegion) return

        setProgressInSeconds(nextRegion.start)
        const percentagePlayed =
            (nextRegion.start * 100) / selectedAudio.duration
        ws.current.seekTo(percentagePlayed / 100)
    }

    return (
        selectedAudio && (
            <Flex width="100%" flexDir={"column"}>
                {/* INFO: WAVE SURFER */}
                <div className="ws-timestamp-tool" ref={wsContainerRef}></div>

                {/* INFO: PROGRESS BAR */}
                <Flex alignItems={"center"} w="full" gap={"10px"}>
                    <Text>{formatSecondsToDuration(progressInSeconds)}</Text>
                    <Slider
                        max={Math.floor(selectedAudio.duration)}
                        onChange={handleProgressBarChange}
                        aria-label="Progress bar"
                        value={progressInSeconds}
                        /* defaultValue={0} */
                        role="group"
                    >
                        <SliderTrack bg="red.100">
                            <SliderFilledTrack bg="brand.600" />
                        </SliderTrack>
                        <SliderThumb
                            _focus={{ boxShadow: "none" }}
                            bg={"white"}
                            boxSize={7}
                        >
                            <Box
                                color="brand.600"
                                as={MdGraphicEq}
                                boxSize={7}
                            />
                        </SliderThumb>
                    </Slider>
                    <Text>
                        {formatSecondsToDuration(selectedAudio.duration)}
                    </Text>
                </Flex>
                {/* INFO: CONTROLS */}
                <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    gap={"20px"}
                    mt={"10px"}
                >
                    {/* INFO: PLAY/PAUSE BUTTON */}
                    <IconButton
                        aria-label="Play/Pause"
                        _hover={{ color: "brand.500" }}
                        borderRadius={"full"}
                        size={"sm"}
                        icon={
                            isPlaying ? (
                                <TbPlayerPause style={{ fontSize: "20px" }} />
                            ) : (
                                <TbPlayerPlay style={{ fontSize: "20px" }} />
                            )
                        }
                        cursor={"pointer"}
                        onClick={togglePlayPause}
                    />

                    {/* INFO: ZOOM BUTTONS */}
                    <IconButton
                        aria-label="Zoom out"
                        _hover={{ color: "brand.500" }}
                        variant={"outline"}
                        size={"sm"}
                        icon={<BsZoomOut style={{ fontSize: "16px" }} />}
                        cursor={"pointer"}
                        onClick={handleZoomOut}
                    />

                    <IconButton
                        aria-label="Zoom in"
                        _hover={{ color: "brand.500" }}
                        variant={"outline"}
                        size={"sm"}
                        icon={<BsZoomIn style={{ fontSize: "16px" }} />}
                        cursor={"pointer"}
                        onClick={handleZoomIn}
                    />

                    <TimestampNamePopover
                        setValue={setValue}
                        progressInSeconds={progressInSeconds}
                        showNotes={showNotes}
                    />
                    {/* INFO: TIMESTAMPS */}
                    <IconButton
                        aria-label="Previous timestamp"
                        _hover={{ color: "brand.500" }}
                        variant={"outline"}
                        size={"sm"}
                        icon={
                            <MdOutlineNavigateBefore
                                style={{ fontSize: "16px" }}
                            />
                        }
                        cursor={"pointer"}
                        onClick={handlePreviousTimeSamp}
                    />
                    <IconButton
                        aria-label="Next timestamp"
                        _hover={{ color: "brand.500" }}
                        variant={"outline"}
                        size={"sm"}
                        icon={
                            <MdOutlineNavigateNext
                                style={{ fontSize: "16px" }}
                            />
                        }
                        cursor={"pointer"}
                        onClick={handleNextTimestamp}
                    />

                    {/*INFO: VOLUME */}
                    <Flex
                        w="full"
                        justifyContent={"end"}
                        height={"auto"}
                        gap={"15px"}
                    >
                        <Slider
                            hideBelow={"lg"}
                            maxW="150px"
                            opacity="0"
                            value={volume}
                            onChange={(e) => setVolume(e)}
                            _hover={{
                                opacity: 1,
                            }}
                        >
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb boxSize={5} />
                        </Slider>
                        <Icon
                            cursor={"pointer"}
                            onClick={() => setMuteVolume(!muteVolume)}
                            mr={"20px"}
                            fontSize={"3xl"}
                            as={handleVolumeSliderIcon()}
                        />
                    </Flex>
                </Flex>
            </Flex>
        )
    )
}
