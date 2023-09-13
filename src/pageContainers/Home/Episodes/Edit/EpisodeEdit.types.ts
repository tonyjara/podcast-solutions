import { Prisma } from "@prisma/client"

export const episodeForEditArgs = Prisma.validator<Prisma.EpisodeArgs>()({
    include: {
        audioFiles: { orderBy: { isSelected: "asc" } },
        podcast: true,
    },
})

export type EpisodeForEditType = Prisma.EpisodeGetPayload<
    typeof episodeForEditArgs
>
