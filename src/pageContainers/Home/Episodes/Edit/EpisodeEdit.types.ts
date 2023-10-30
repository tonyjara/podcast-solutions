import { Prisma } from "@prisma/client"

export const episodeForEditArgs = Prisma.validator<Prisma.EpisodeDefaultArgs>()(
    {
        include: {
            audioFiles: { orderBy: { isSelected: "asc" } },
            podcast: true,
        },
    }
)

export type EpisodeForEditType = Prisma.EpisodeGetPayload<
    typeof episodeForEditArgs
>
