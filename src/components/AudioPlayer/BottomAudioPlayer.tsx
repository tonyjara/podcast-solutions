import React, { useEffect, useRef, useState } from "react"
import {
    IoMdVolumeOff,
    IoMdVolumeLow,
    IoMdVolumeHigh,
    IoMdVolumeMute,
} from "react-icons/io"
import Marquee from "react-fast-marquee"
import {
    Box,
    Image,
    Flex,
    Text,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Icon,
    useColorModeValue,
    keyframes,
    IconButton,
} from "@chakra-ui/react"
import { MdGraphicEq } from "react-icons/md"
import {
    TbRewindBackward15,
    TbPlayerPlay,
    TbRewindForward15,
    TbPlayerPause,
    TbPlayerSkipBack,
    TbPlayerSkipForward,
} from "react-icons/tb"
import { useRouter } from "next/router"
import { parseDurationToSeconds } from "@/lib/utils/durationUtils"

export interface AudioPlayerTrack {
    thumbnail: string
    title: string
    author: string
    src: string
    duration: number
}

// NOTE: Chrome blocked autoplay before user interacts with the page
export default function BottomAudioPlayer({
    track,
    nextEpisodeId,
    prevEpisodeId,
    podcastSlug,
}: {
    track: AudioPlayerTrack
    nextEpisodeId: string | null | undefined
    prevEpisodeId: string | null | undefined
    podcastSlug: string
}) {
    const router = useRouter()


    // states
    const [timeProgress, setTimeProgress] = useState(0)

    //controls
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(100)
    const [muteVolume, setMuteVolume] = useState(false)

    // reference
    const audioRef = useRef<HTMLAudioElement>(null)
    const progressBarRef = useRef<HTMLInputElement>(null)

    //Callbacks / Effects

    useEffect(() => {
        if (!router.query.t || !audioRef.current) return
        const time = parseDurationToSeconds(router.query.t)
        setTimeProgress(parseDurationToSeconds(time))
        audioRef.current.currentTime = time

        return () => { }
    }, [router.query])

    const onPlaybackEnded = () => {
        if (!audioRef.current || !progressBarRef.current) return
        setTimeProgress(0)
        setIsPlaying(false)
        if (nextEpisodeId) {
            return router.push(`/podcasts/${podcastSlug}/${nextEpisodeId}`)
        }
        /* audioRef.current.currentTime = 0 */
    }

    useEffect(() => {
        if (!audioRef.current) return
        audioRef.current.volume = volume / 100
        audioRef.current.muted = muteVolume
    }, [volume, audioRef, muteVolume])

    // Controls

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause()
            setIsPlaying(false)
        } else {
            audioRef.current?.play()
            setIsPlaying(true)
        }
    }

    const previousTrack = () => {
        if (!audioRef.current) return
        const currentTime = audioRef.current.currentTime
        if (currentTime > 5) {
            audioRef.current.currentTime = 0
            setTimeProgress(0)
            return
        }
        if (!prevEpisodeId) return
        router.push(`/podcasts/${podcastSlug}/${prevEpisodeId}`)
    }

    const skipBackward = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime -= 15
        setTimeProgress(audioRef.current.currentTime)
    }

    const skipForward = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime += 15
        setTimeProgress(audioRef.current.currentTime)
    }

    const nextTrack = () => {
        if (!nextEpisodeId) return
        router.push(`/podcasts/${podcastSlug}/${nextEpisodeId}`)
        setTimeProgress(0)
        setIsPlaying(false)
    }
    //progress bar

    const handleProgressBarChange = (e: number) => {
        setTimeProgress(e)
        if (!audioRef.current) return
        const newTime = isFinite(e) ? e : 0
        audioRef.current.currentTime = newTime
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

    // Volume slider
    const handleVolumeSliderIcon = () => {
        if (muteVolume) return IoMdVolumeOff
        if (volume > 50) return IoMdVolumeHigh
        if (volume > 0) return IoMdVolumeLow
        return IoMdVolumeMute
    }

    return (
        <>
            <audio
                style={{ display: "none" }}
                ref={audioRef}
                src={track.src}
                controls
                preload="metadata"
                muted={muteVolume}
                onEnded={onPlaybackEnded}
                onTimeUpdate={(e) => {
                    setTimeProgress(e.currentTarget.currentTime)
                }}
            /* onDurationChange={(e) => { */
            /*     setDuration(e.currentTarget.duration) */
            /* }} */
            />
            {/* Fixed container  */}
            <Box
                bottom="0%"
                left="0%"
                w="100%"
                position={"fixed"}
                zIndex="10"
                bg={"gray.900"}
                color={useColorModeValue("white", "gray.200")}
            >
                {/* Flex Container */}
                <Flex
                    alignItems={"center"}
                    w="full"
                    justifyContent={{ base: "center", lg: "space-between" }}
                    px={"20px"}
                    height={"100px"}
                >
                    {/* Track info */}
                    <Flex hideBelow={"lg"} w="full" gap={"10px"}>
                        <Image
                            maxW={"50px"}
                            rounded={"md"}
                            alt={"Episode image"}
                            src={track.thumbnail}
                            objectFit={"contain"}
                        />
                        <Flex flexDir={"column"}>
                            <Text fontSize={"sm"} fontWeight={"semibold"}>
                                {track.title.length > 40
                                    ? `${track.title.substring(0, 40)}...`
                                    : track.title}
                            </Text>

                            <Text
                                as={"span"}
                                maxW={"300px"}
                                fontSize={"sm"}
                                fontWeight={"thin"}
                            >
                                <Marquee>By {track.author}</Marquee>
                            </Text>
                        </Flex>
                    </Flex>
                    {/* Controls and progress bar */}
                    <Flex
                        w="full"
                        maxW={"500px"}
                        alignItems={"center"}
                        direction={"column"}
                        gap={"10px"}
                    >
                        {/*  Controls */}
                        <Flex
                            w="full"
                            maxW={"320px"}
                            justifyContent={"space-between"}
                        >
                            <IconButton
                                aria-label="Previous Episode"
                                variant={"ghost"}
                                color={prevEpisodeId ? "white" : "gray.600"}
                                _hover={{ color: "brand.500" }}
                                size={"sm"}
                                icon={
                                    <TbPlayerSkipBack
                                        style={{ fontSize: "30px" }}
                                    />
                                }
                                onClick={previousTrack}
                            />
                            <IconButton
                                aria-label="Skip Backward 15 seconds"
                                variant={"ghost"}
                                color={"white"}
                                _hover={{ color: "brand.500" }}
                                size={"sm"}
                                icon={
                                    <TbRewindBackward15
                                        style={{ fontSize: "30px" }}
                                    />
                                }
                                onClick={skipBackward}
                            />
                            <IconButton
                                aria-label="Play/Pause"
                                variant={"ghost"}
                                color={"white"}
                                _hover={{ color: "brand.500" }}
                                size={"sm"}
                                icon={
                                    isPlaying ? (
                                        <TbPlayerPause
                                            style={{ fontSize: "30px" }}
                                        />
                                    ) : (
                                        <TbPlayerPlay
                                            style={{ fontSize: "30px" }}
                                        />
                                    )
                                }
                                cursor={"pointer"}
                                onClick={togglePlayPause}
                            />
                            <IconButton
                                aria-label="Skip Forward 15 seconds"
                                variant={"ghost"}
                                color={"white"}
                                _hover={{ color: "brand.500" }}
                                size={"sm"}
                                icon={
                                    <TbRewindForward15
                                        style={{ fontSize: "30px" }}
                                    />
                                }
                                onClick={skipForward}
                            />
                            <IconButton
                                aria-label="Next Episode"
                                variant={"ghost"}
                                color={nextEpisodeId ? "white" : "gray.600"}
                                _hover={{ color: "brand.500" }}
                                size={"sm"}
                                icon={
                                    <TbPlayerSkipForward
                                        style={{ fontSize: "30px" }}
                                    />
                                }
                                onClick={nextTrack}
                            />
                        </Flex>
                        {/* Progress bar */}
                        <Flex alignItems={"center"} w="full" gap={"10px"}>
                            <Text>{formatTime(timeProgress)}</Text>
                            <Slider
                                ref={progressBarRef}
                                max={Math.floor(track.duration)}
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
                                    bg={"transparent"}
                                    _groupHover={{
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
                                        _groupHover={{ color: "brand.600" }}
                                        as={MdGraphicEq}
                                        boxSize={7}
                                    />
                                </SliderThumb>
                            </Slider>
                            <Text>{formatTime(track.duration)}</Text>
                        </Flex>
                    </Flex>

                    {/* Volume slider */}
                    <Flex
                        w="full"
                        justifyContent={"end"}
                        role="group"
                        height={"auto"}
                        hideBelow={"lg"}
                        gap={"15px"}
                    >
                        <Slider
                            aria-label="slider-ex-3"
                            maxW="150px"
                            opacity="0"
                            value={volume}
                            onChange={(e) => setVolume(e)}
                            _groupHover={{
                                opacity: 1,
                                animation: `${keyframes`
                                    from { scale: 0.1 }
                                    to { scale: 1 }`} ease-in-out 0.1s`,
                                transformOrigin: "center right",
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
            </Box>
        </>
    )
}
