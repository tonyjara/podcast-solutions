import { ChevronRightIcon } from "@chakra-ui/icons"
import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react"
import Link from "next/link"
import React from "react"
interface props {
    podcastTitle: string
    episodeTitle: string
    podcastSlug: string
}

const EpisodeBreadCrumbs = ({
    podcastSlug,
    podcastTitle,
    episodeTitle,
}: props) => {
    const shortenedTitle = (x: string) =>
        x.length > 20 ? x.substring(0, 20) + "..." : x
    return (
        <Box
            maxW={{ base: "380px", md: "500px" }}
            p="5px"
            my={"20px"}
            borderRadius={"5px"}
        >
            <Breadcrumb
                color={"gray.500"}
                spacing="8px"
                separator={<ChevronRightIcon fontSize={"2xl"} color="orange" />}
            >
                <BreadcrumbItem>
                    <BreadcrumbLink as={Link} href={`/podcasts/${podcastSlug}`}>
                        {shortenedTitle(podcastTitle)}
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink href="#">
                        {shortenedTitle(episodeTitle)}
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>
        </Box>
    )
}

export default EpisodeBreadCrumbs
