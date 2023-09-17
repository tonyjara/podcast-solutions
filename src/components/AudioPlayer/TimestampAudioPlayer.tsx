import React, { useEffect, useRef, useState } from "react"
import {
    Box,
    Checkbox,
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
import { trpcClient } from "@/utils/api"
import { TbPlayerPause, TbPlayerPlay } from "react-icons/tb"
import AreYouSureButton from "../Buttons/AreYouSureButton"
import { handleUseMutationAlerts } from "../Toasts & Alerts/MyToast"
import { AudioFile } from "@prisma/client"
import axios from "axios"
import { DeleteIcon } from "@chakra-ui/icons"
import {
    IoMdVolumeHigh,
    IoMdVolumeLow,
    IoMdVolumeMute,
    IoMdVolumeOff,
} from "react-icons/io"
import { MdGraphicEq } from "react-icons/md"
import { BsZoomIn, BsZoomOut } from "react-icons/bs"

// NOTE: Chrome blocked autoplay before user interacts with the page and there's a running issue on wavesurfer
export default function TimestampAudioPlayer({
    audioFile,
}: {
    audioFile: AudioFile
}) {
    //states
    const [timeProgress, setTimeProgress] = useState(0)
    const context = trpcClient.useContext()
    const [volume, setVolume] = useState(100)
    const [muteVolume, setMuteVolume] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    //refs
    const wsContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WaveSurfer | null>(null)

    //db calls
    const trpcContext = trpcClient.useContext()
    const { mutate: updatePeaks } =
        trpcClient.audioFile.updatePeaks.useMutation({
            onSuccess: () => {
                trpcContext.audioFile.invalidate()
            },
        })

    const { mutate: deleteAudioFile } =
        trpcClient.audioFile.deleteAudioFile.useMutation(
            handleUseMutationAlerts({
                successText: "Audio file deleted",
                callback: () => {
                    context.audioFile.invalidate()
                },
            })
        )

    const { mutate: selectEpisode } =
        trpcClient.audioFile.selectAudioFileForEpisode.useMutation(
            handleUseMutationAlerts({
                successText: "Audio selected",
                callback: () => {
                    context.audioFile.invalidate()
                },
            })
        )

    useEffect(() => {
        if (!wsContainerRef.current) return
        ws.current = WaveSurfer.create({
            container: wsContainerRef.current,
            dragToSeek: true,
            url: audioFile.url,
            barWidth: 3,
            autoplay: false,
            cursorWidth: 2,
            /* mediaControls: isAdmin, */
            height: 50,
            hideScrollbar: true,
            peaks: audioFile.peaks.length
                ? (audioFile.peaks as any)
                : undefined,
        })

        ws.current.on("ready", function () {
            try {
                if (!ws.current || audioFile.peaks.length > 0) return

                const peaks = ws.current.exportPeaks({
                    channels: 1,
                    maxLength: audioFile.duration,
                })

                if (!peaks[0]) return
                updatePeaks({ peaks: peaks[0], audioFileId: audioFile.id })
            } catch (e) {
                console.error(e)
            }
        })
        ws.current.on("audioprocess", function (time: number) {
            setTimeProgress(time)
        })

        ws.current.on("timeupdate", function (time: number) {
            setTimeProgress(time)
        })

        ws.current.on("finish", function () {
            if (!ws.current) return
            ws.current.seekTo(0)
            setTimeProgress(0)
            setIsPlaying(false)
        })
        return () => ws.current?.destroy()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioFile.isSelected])

    //controls
    const togglePlayPause = () => {
        if (isPlaying) {
            ws.current?.pause()
            setIsPlaying(false)
        } else {
            ws.current?.play()
            setIsPlaying(true)
        }
    }

    // Volume slider
    useEffect(() => {
        if (!ws.current) return
        if (muteVolume) return ws.current.setVolume(0)
        ws.current.setVolume(volume / 100)
    }, [volume, muteVolume])

    const handleVolumeSliderIcon = () => {
        if (muteVolume) return IoMdVolumeOff
        if (volume > 50) return IoMdVolumeHigh
        if (volume > 0) return IoMdVolumeLow
        return IoMdVolumeMute
    }
    const handleDeleteAudioFile = async () => {
        const req = await axios("/api/get-connection-string")
        const { connectionString } = req.data

        deleteAudioFile({
            isHostedByPS: audioFile.isHostedByPS,
            blobName: audioFile.blobName,
            id: audioFile.id,
            connectionString,
            episodeId: audioFile.episodeId,
        })
    }
    const handleSelectAudioFile = () => {
        if (audioFile.isSelected) return

        selectEpisode({
            episodeId: audioFile.episodeId,
            audioFileId: audioFile.id,
        })
    }

    const handleProgressBarChange = (e: number) => {
        setTimeProgress(e)
        if (!ws.current) return
        const newTime = isFinite(e) ? e : 0
        const percentagePlayed = (newTime * 100) / audioFile.duration
        ws.current.seekTo(percentagePlayed / 100)
    }

    const formatTime = (time: number) => {
        if (time && !isNaN(time)) {
            const minutes = Math.floor(time / 60)
            const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
            const seconds = Math.floor(time % 60)
            const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
            return `${formatMinutes}:${formatSeconds}`
        }
        return "00:00"
    }

    const handleZoomIn = () => {
        if (!ws.current) return
        const newZoom = ws.current.options.minPxPerSec + 10
        ws.current.zoom(newZoom)
    }

    const handleZoomOut = () => {
        if (!ws.current) return
        const currentZoom = ws.current.options.minPxPerSec
        if (currentZoom <= 10) return ws.current.zoom(0)
        const newZoom = currentZoom - 10
        ws.current.zoom(newZoom)
    }

    return (
        <Flex width="100%" flexDir={"column"} key={audioFile.id}>
            <Box
                maxW={"220px"}
                width={"max-content"}
                backgroundColor={"gray.100"}
                _dark={{ backgroundColor: "gray.700" }}
                position={"relative"}
                top="10px"
                p={"5px"}
                borderRadius={"md"}
                zIndex={5}
            >
                <Text
                    whiteSpace={"nowrap"}
                    px={"10px"}
                    fontWeight={"bold"}
                    /* color={"white"} */
                >
                    {audioFile.name.length > 24
                        ? audioFile.name.slice(0, 24) + "..."
                        : audioFile.name}
                </Text>
            </Box>
            {/* INFO: WAVE SURFER */}
            <div ref={wsContainerRef}></div>

            {/* INFO: PROGRESS BAR */}
            <Flex alignItems={"center"} w="full" gap={"10px"}>
                <Text>{formatTime(timeProgress)}</Text>
                <Slider
                    /* ref={progressBarRef} */
                    max={Math.floor(audioFile.duration)}
                    onChange={handleProgressBarChange}
                    aria-label="Progress bar"
                    value={timeProgress}
                    defaultValue={0}
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
                        <Box color="brand.600" as={MdGraphicEq} boxSize={7} />
                    </SliderThumb>
                </Slider>
                <Text>{formatTime(audioFile.duration)}</Text>
            </Flex>
            <Flex
                justifyContent={"space-between"}
                alignItems={"center"}
                gap={"20px"}
                mt={"10px"}
            >
                <Checkbox
                    onChange={handleSelectAudioFile}
                    size={"lg"}
                    isChecked={audioFile.isSelected}
                />
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

                {/*INFO: VOLUME */}
                <Flex
                    w="full"
                    justifyContent={"end"}
                    height={"auto"}
                    gap={"15px"}
                    hideBelow={"lg"}
                >
                    <Slider
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
                <AreYouSureButton
                    title={"Delete audio file"}
                    modalContent={
                        "Are you sure you want to delete this audio file? This action cannot be undone."
                    }
                    confirmAction={handleDeleteAudioFile}
                    confirmButtonText={"Delete"}
                    customButton={
                        <IconButton
                            size={"sm"}
                            aria-label="delete audio button"
                            icon={<DeleteIcon />}
                        />
                    }
                />
            </Flex>
        </Flex>
    )
}
