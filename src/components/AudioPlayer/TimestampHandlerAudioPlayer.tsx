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
    keyframes,
} from "@chakra-ui/react"
import WaveSurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline"
import { trpcClient } from "@/utils/api"
import { TbPlayerPause, TbPlayerPlay } from "react-icons/tb"
import AreYouSureButton from "../Buttons/AreYouSureButton"
import { handleUseMutationAlerts } from "../Toasts & Alerts/MyToast"
import { AudioFile } from "@prisma/client"
import axios from "axios"
import { DeleteIcon } from "@chakra-ui/icons"
import { TiZoom } from "react-icons/ti"
import {
    IoMdVolumeHigh,
    IoMdVolumeLow,
    IoMdVolumeMute,
    IoMdVolumeOff,
} from "react-icons/io"
import { customScrollbar } from "@/styles/CssUtils"

// NOTE: Chrome blocked autoplay before user interacts with the page
export default function TimestampHandlerAudioPlayer({
    audioFile,
}: {
    audioFile: AudioFile
}) {
    //states
    const context = trpcClient.useContext()
    const [volume, setVolume] = useState(100)
    const [muteVolume, setMuteVolume] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [zoom, setZoom] = useState(1)

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
            /* waveColor: "rgb(200, 0, 200)", */
            /* progressColor: "rgb(100, 0, 100)", */
            /* cursorColor: "transparent", */
            /* dragToSeek: true, */
            url: audioFile.url,
            barWidth: 3,
            autoplay: false,
            cursorWidth: 2,
            height: audioFile.isSelected ? 200 : 50,
            /* minPxPerSec: 100, */
            peaks: audioFile.peaks.length
                ? (audioFile.peaks as any)
                : undefined,
            /* plugins: audioFile.isSelected ? [TimelinePlugin.create()] : [], */
        })

        /* wavesurferRef.current.on("loading", (percent) => { */
        /*     console.log("Loading", percent + "%") */
        /* }) */

        ws.current.on("ready", function () {
            try {
                if (!ws.current || audioFile.peaks.length > 0) return

                const peaks = ws.current.exportPeaks({
                    channels: 1,
                    /* maxLength: track.duration, */
                })

                if (!peaks[0]) return
                updatePeaks({ peaks: peaks[0], audioFileId: audioFile.id })
            } catch (e) {
                console.error(e)
            }
        })

        return () => ws.current?.destroy()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioFile.isSelected])

    const handleZoom = (e: number) => {
        if (!ws.current) return
        ws.current.zoom(e)
        setZoom(e)
    }

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
                {/*INFO: ZOOM BAR */}
                <Flex
                    alignItems={"center"}
                    w="full"
                    maxW={{ base: "100px", md: "300px" }}
                    gap={"10px"}
                >
                    <Slider
                        /* ref={progressBarRef} */
                        /* max={Math.floor(track.duration)} */
                        max={200}
                        onChange={handleZoom}
                        aria-label="Zoom bar"
                        value={zoom}
                        defaultValue={0}
                    >
                        <SliderTrack bg="red.100">
                            <SliderFilledTrack bg="brand.600" />
                        </SliderTrack>
                        <SliderThumb
                            _focus={{ boxShadow: "none" }}
                            bg={{ base: "white", md: "transparent" }}
                            _hover={{
                                bg: "white",
                                opacity: 1,
                                outlineColor: "transparent",
                                animation: `${keyframes`
                                    from { opacity: 0.1 }
                                    to { opacity: 1 }`} ease-in-out 0.1s`,
                                transformOrigin: "center",
                            }}
                            boxSize={7}
                        >
                            <Box
                                color="transparent"
                                _hover={{ color: "brand.600" }}
                                as={TiZoom}
                                boxSize={7}
                            />
                        </SliderThumb>
                    </Slider>
                </Flex>

                <Flex
                    w="full"
                    justifyContent={"end"}
                    role="group"
                    height={"auto"}
                    hideBelow={"lg"}
                    gap={"15px"}
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
