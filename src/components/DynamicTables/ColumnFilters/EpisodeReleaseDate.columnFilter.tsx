import React, { useRef, useState } from "react"
import { ColumnFilterProps } from "../ColumnFilter"
import {
    Button,
    Flex,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Portal,
    useOutsideClick,
} from "@chakra-ui/react"
import { Prisma } from "@prisma/client"
import { CalendarIcon, CloseIcon } from "@chakra-ui/icons"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { DayPicker } from "react-day-picker"

const EpisodeReleaseDateColumnFilter = ({
    setWhereFilterList,
    whereFilterList,
}: ColumnFilterProps) => {
    const [fromOpen, setFromOpen] = useState(false)
    const [toOpen, setToOpen] = useState(false)
    const fromRef = useRef(null)
    const toRef = useRef(null)
    useOutsideClick({
        ref: fromRef,
        handler: () => {
            fromOpen && setFromOpen(false)
        },
    })

    useOutsideClick({
        ref: toRef,
        handler: () => {
            toOpen && setToOpen(false)
        },
    })
    const whereBuilder = (from: Date | null, to: Date | null) =>
        Prisma.validator<Prisma.EpisodeScalarWhereInput>()({
            releaseDate: { gte: from ?? undefined, lte: to ?? undefined },
        })

    const filterListValue = whereFilterList.filter((x) => x.releaseDate)[0]
    const from = filterListValue?.releaseDate.gte
    const to = filterListValue?.releaseDate.lte
    const clearPreviouseValues = () => {
        if (!setWhereFilterList) return
        setWhereFilterList((prev) => prev.filter((x) => !x.releaseDate))
    }

    return (
        <Flex onClick={(e) => e.stopPropagation()}>
            <Popover isOpen={fromOpen}>
                <PopoverTrigger>
                    <Button
                        size={"sm"}
                        onClick={() => setFromOpen(!fromOpen)}
                        rightIcon={
                            from ? (
                                <CloseIcon
                                    _hover={{ color: "red.500" }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const prevToDate =
                                            filterListValue?.releaseDate.lte

                                        clearPreviouseValues()

                                        setWhereFilterList &&
                                            setWhereFilterList((prev) => [
                                                ...prev,
                                                whereBuilder(
                                                    null,
                                                    prevToDate ?? null
                                                ),
                                            ])
                                    }}
                                />
                            ) : (
                                <CalendarIcon />
                            )
                        }
                    >
                        From: {from ? format(from, "dd/MM/yy") : "__/__/__"}
                    </Button>
                </PopoverTrigger>

                {/* FROM */}
                <Portal>
                    <PopoverContent ref={fromRef}>
                        <DayPicker
                            mode="single"
                            defaultMonth={from ?? new Date()}
                            modifiers={{
                                today: new Date(),
                                selected: from,
                            }}
                            modifiersStyles={{
                                today: { textDecoration: "underline" },
                                selected: {
                                    border: "2px solid currentColor",
                                    color: "green",
                                },
                            }}
                            selected={from ?? new Date()}
                            disabled={to ? [{ after: to }] : undefined}
                            onDayClick={(e: Date | undefined) => {
                                e?.setHours(0, 0, 0, 0)

                                const filterListValue = whereFilterList.filter(
                                    (x) => x.releaseDate
                                )[0]
                                const prevToDate =
                                    filterListValue?.releaseDate.lte

                                clearPreviouseValues()

                                setWhereFilterList &&
                                    setWhereFilterList((prev) => [
                                        ...prev,
                                        whereBuilder(
                                            e ?? null,
                                            prevToDate ?? null
                                        ),
                                    ])

                                setFromOpen(false)
                            }}
                            locale={enUS}
                        />
                        <Button
                            variant={"ghost"}
                            onClick={() => setFromOpen(false)}
                        >
                            Close
                        </Button>
                    </PopoverContent>
                </Portal>
            </Popover>
            <Popover isOpen={toOpen}>
                <PopoverTrigger>
                    <Button
                        size={"sm"}
                        onClick={() => setToOpen(true)}
                        rightIcon={
                            to ? (
                                <CloseIcon
                                    _hover={{ color: "red.500" }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const filterListValue =
                                            whereFilterList.filter(
                                                (x) => x.releaseDate
                                            )[0]
                                        const prevFromDate =
                                            filterListValue?.releaseDate.gte

                                        clearPreviouseValues()

                                        setWhereFilterList &&
                                            setWhereFilterList((prev) => [
                                                ...prev,
                                                whereBuilder(
                                                    prevFromDate ?? null,
                                                    null
                                                ),
                                            ])
                                    }}
                                />
                            ) : (
                                <CalendarIcon />
                            )
                        }
                    >
                        To: {to ? format(to, "dd/MM/yy") : "__/__/__"}
                    </Button>
                </PopoverTrigger>

                {/* TO */}
                <Portal>
                    <PopoverContent ref={toRef}>
                        <DayPicker
                            mode="single"
                            defaultMonth={to ?? new Date()}
                            selected={to ?? new Date()}
                            modifiers={{
                                today: new Date(),
                                selected: to,
                            }}
                            modifiersStyles={{
                                today: { textDecoration: "underline" },
                                selected: {
                                    border: "2px solid currentColor",
                                    color: "green",
                                },
                            }}
                            onDayClick={(e: Date | undefined) => {
                                e?.setHours(23, 59, 59, 59)

                                const filterListValue = whereFilterList.filter(
                                    (x) => x.releaseDate
                                )[0]
                                const prevFromDate =
                                    filterListValue?.releaseDate.gte

                                clearPreviouseValues()

                                setWhereFilterList &&
                                    setWhereFilterList((prev) => [
                                        ...prev,
                                        whereBuilder(
                                            prevFromDate ?? null,
                                            e ?? null
                                        ),
                                    ])

                                setToOpen(false)
                            }}
                            locale={enUS}
                            disabled={from ? [{ before: from }] : undefined}
                        />
                        <Button
                            variant={"ghost"}
                            onClick={() => setToOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </PopoverContent>
                </Portal>
            </Popover>
        </Flex>
    )
}

export default EpisodeReleaseDateColumnFilter
