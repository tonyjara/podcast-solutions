import { EpisodeWithAudioFilesAndSubscription } from "@/pages/podcasts/[slug]/[episodeId]"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    IoMdVolumeOff,
    IoMdVolumeLow,
    IoMdVolumeHigh,
    IoMdVolumeMute,
} from "react-icons/io"
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
} from "@chakra-ui/react"
import { MdGraphicEq } from "react-icons/md"
import {
    TbRewindBackward15,
    TbPlayerPlay,
    TbRewindForward15,
    TbPlayerPause,
} from "react-icons/tb"

export interface AudioPlayerTrack {
    thumbnail: string
    title: string
    author: string
    src: string
    duration: number
}

export default function BottomAudioPlayer({
    track,
}: {
    track: AudioPlayerTrack
}) {
    // states
    const [timeProgress, setTimeProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    //controls
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(100)
    const [muteVolume, setMuteVolume] = useState(false)

    // reference
    const audioRef = useRef<HTMLAudioElement>(null)
    const progressBarRef = useRef<HTMLInputElement>(null)
    const playAnimationRef = useRef(0)

    const onLoadedMetadata = (e: any) => {
        console.log(e)

        if (!audioRef.current) return
        /* const seconds = audioRef.current.currentTime; */
        /* console.log(seconds); */

        /* progressBarRef.current.max = seconds.toString(); */
    }

    const repeat = useCallback(() => {
        if (!audioRef.current || !progressBarRef.current) return
        const currentTime = audioRef.current.currentTime

        setTimeProgress(currentTime)
        progressBarRef.current.value = currentTime.toString()
        progressBarRef.current.style.setProperty(
            "--range-progress",
            `${(parseInt(progressBarRef.current.value) / duration) * 100}%`
        )

        playAnimationRef.current = requestAnimationFrame(repeat)
    }, [audioRef, duration, progressBarRef, setTimeProgress])

    useEffect(() => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.play()
        } else {
            audioRef.current.pause()
        }
        playAnimationRef.current = requestAnimationFrame(repeat)
    }, [isPlaying, audioRef, repeat])

    useEffect(() => {
        if (!audioRef.current) return
        audioRef.current.volume = volume / 100
        audioRef.current.muted = muteVolume
    }, [volume, audioRef, muteVolume])

    // Controls

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev)
        /* if (!audioRef.current) return */
        /* if (isPlaying) audioRef.current.pause() */
        /* if (!isPlaying) audioRef.current.play() */
    }

    const skipForward = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime += 15
    }

    const skipBackward = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime -= 15
    }

    //progress bar
    const handleMoveProgressSlider = (progress: number) => {
        if (!audioRef.current) return
        const calculateNewTime = Math.floor((progress * track.duration) / 100)
        const newTime = isFinite(calculateNewTime) ? calculateNewTime : 0
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
                onLoadedMetadata={onLoadedMetadata}
                muted={muteVolume}
            /* onEnded={handleNext} */
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
                    justifyContent={"space-between"}
                    px={"20px"}
                    height={"100px"}
                >
                    {/* Track info */}
                    <Flex

                        hideBelow={"md"}
                        w="full" gap={"10px"}>
                        <Image
                            maxW={"50px"}
                            rounded={"md"}
                            alt={"Episode image"}
                            src={track.thumbnail}
                            objectFit={"contain"}
                        />
                        <Flex flexDir={"column"}>
                            <Text fontWeight={"semibold"}>
                                {track.title.length > 40
                                    ? `${track.title.substring(0, 40)}...`
                                    : track.title}
                            </Text>
                            <Text fontWeight={"thin"}>By {track.author}</Text>
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
                        {/* Controls */}
                        <Flex
                            w="full"
                            maxW={"250px"}
                            justifyContent={"space-between"}
                        >
                            <Icon
                                _hover={{ color: "brand.500" }}
                                fontSize={"3xl"}
                                as={TbRewindBackward15}
                                cursor={"pointer"}
                                onClick={skipBackward}
                            />
                            <Icon
                                _hover={{ color: "brand.500" }}
                                fontSize={"3xl"}
                                as={isPlaying ? TbPlayerPause : TbPlayerPlay}
                                cursor={"pointer"}
                                onClick={togglePlayPause}
                            />
                            <Icon
                                _hover={{ color: "brand.500" }}
                                fontSize={"3xl"}
                                as={TbRewindForward15}
                                cursor={"pointer"}
                                onClick={skipForward}
                            />
                        </Flex>
                        {/* Progress bar */}
                        <Flex alignItems={"center"} w="full" gap={"10px"}>
                            <Text ref={progressBarRef}>
                                {formatTime(timeProgress)}
                            </Text>
                            <Slider
                                ref={progressBarRef}
                                onChangeEnd={handleMoveProgressSlider}
                                aria-label="slider-ex-4"
                                defaultValue={duration}
                                role="group"
                            >
                                <SliderTrack bg="red.100">
                                    <SliderFilledTrack bg="brand.600" />
                                </SliderTrack>
                                <SliderThumb
                                    bg={"transparent"}
                                    _groupHover={{
                                        bg: "white",
                                        opacity: 1,
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
                        hideBelow={"md"}
                    >
                        <Slider
                            aria-label="slider-ex-3"
                            /* defaultValue={30} */
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
