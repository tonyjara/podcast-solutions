import { createColumnHelper } from "@tanstack/react-table"
import DateCell from "@/components/DynamicTables/DynamicCells/DateCell"
import TextCell from "@/components/DynamicTables/DynamicCells/TextCell"
import { Prisma } from "@prisma/client"
import DurationCell from "../DynamicCells/DurationCell"

export const EpisodesForHomePageArgs =
    Prisma.validator<Prisma.EpisodeFindManyArgs>()({
        include: {
            audioFiles: {
                where: { isSelected: true },
                select: { duration: true },
            },
        },
    })

type EpisodeForColum = Prisma.EpisodeGetPayload<typeof EpisodesForHomePageArgs>

const columnHelper = createColumnHelper<EpisodeForColum>()

const prettyStatus = (status: string) => {
    switch (status) {
        case "published":
            return "Published"
        case "draft":
            return "Draft"
        case "scheduled":
            return "Scheduled"
        default:
            return "Unknown"
    }
}
const statusColors = (status: string) => {
    switch (status) {
        case "published":
            return "green.500"
        case "draft":
            return "gray.500"
        case "scheduled":
            return "orange.500"
        default:
            return "gray.500"
    }
}

export const homeEpisodesColumns = () => [
    columnHelper.accessor("episodeNumber", {
        cell: (x) => `# ${x.getValue()}` ?? "-",
        header: "№",
        sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("releaseDate", {
        cell: (x) =>
            x.getValue() ? <DateCell date={x.getValue() ?? new Date()} /> : "-",
        header: "Release Date",
        sortingFn: "datetime",
    }),
    columnHelper.accessor("title", {
        cell: (x) => <TextCell text={x.getValue()} />,
        header: "Title",
        sortingFn: "text",
    }),

    columnHelper.accessor("status", {
        cell: (x) => (
            <TextCell
                color={statusColors(x.getValue())}
                text={prettyStatus(x.getValue())}
            />
        ),
        header: "Status",
        sortingFn: "text",
    }),

    columnHelper.display({
        cell: (x) => (
            <DurationCell value={x.row.original.audioFiles[0]?.duration} />
        ),
        header: "Duration",
        sortingFn: "text",
    }),
    //TODO add small audio player
]
