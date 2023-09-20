import React, { useEffect, useRef, useState } from "react"
import WsRegions, { RegionParams } from "wavesurfer.js/dist/plugins/regions"
import {
    Button,
    IconButton,
    Input,
    InputGroup,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    useDisclosure,
} from "@chakra-ui/react"
import { BiSolidFlag } from "react-icons/bi"
import useKeyDownCallback from "@/lib/hooks/useKeyDownCallback"

interface props {
    regionsRef: React.MutableRefObject<WsRegions | null>
    timeProgress: number
    regions: RegionParams[]
    setRegions: React.Dispatch<React.SetStateAction<RegionParams[]>>
}

export function TimestampNamePopover({
    regionsRef,
    timeProgress,
    regions,
    setRegions,
}: props) {
    const { isOpen, onClose, onToggle } = useDisclosure()

    //Keyboard shortcut
    useKeyDownCallback("t", onToggle)

    const [text, setText] = React.useState("")
    const initialFocusRef = useRef(null)

    const handleClose = () => {
        setText("")
        onClose()
    }

    const handleAddMarker = () => {
        if (!regionsRef.current || !text.length) return

        console.log(timeProgress)

        const newRegion: RegionParams = {
            id: new Date().valueOf().toString(),
            start: timeProgress,
            content: text,
            color: "#0fa824",
        }
        setRegions((prev: any) => [...prev, newRegion])
        handleClose()
    }

    //Callback when pressing keys

    return (
        <Popover
            initialFocusRef={initialFocusRef}
            isOpen={isOpen}
            onClose={handleClose}
            placement="top"
            closeOnBlur={true}
        >
            <PopoverTrigger>
                <IconButton
                    aria-label="Add timestamp"
                    _hover={{ color: "brand.500" }}
                    variant={"outline"}
                    size={"sm"}
                    icon={<BiSolidFlag style={{ fontSize: "16px" }} />}
                    cursor={"pointer"}
                    onClick={onToggle}
                />
            </PopoverTrigger>
            <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
                <PopoverHeader pt={4} fontWeight="bold" border="0">
                    Name your timestamp
                </PopoverHeader>
                <PopoverArrow bg="blue.800" />
                <PopoverCloseButton />
                <PopoverBody>
                    <InputGroup>
                        <Input
                            ref={initialFocusRef}
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddMarker()
                                }
                            }}
                        />
                    </InputGroup>
                </PopoverBody>
                <PopoverFooter
                    border="0"
                    display="flex"
                    justifyContent="end"
                    pb={4}
                >
                    <Button onClick={handleAddMarker} size={"sm"}>
                        Add
                    </Button>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    )
}
