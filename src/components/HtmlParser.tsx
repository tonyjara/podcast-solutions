import { Button, Flex, useColorMode } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useState } from "react"
import sanitizeHtml from "sanitize-html"

type Props = {
    content: string
    showMoreButton?: boolean
    maxL?: number
    allPTags?: boolean
}

const HtmlParser = ({ maxL, content, showMoreButton, allPTags }: Props) => {
    const router = useRouter()
    const [showMore, setShowMore] = useState(false)
    const { colorMode } = useColorMode()
    const handleShortening = () => {
        if (!showMoreButton && !maxL) return content
        if (showMoreButton) {
            return !showMore
                ? `${content.substring(0, maxL ?? 500)}...`
                : content
        }
        return content.length > (maxL ?? 500)
            ? `${content.substring(0, maxL ?? 500)}...`
            : content
    }
    const sanitizedContent = sanitizeHtml(handleShortening())

    const handleClickHtml = (e: any) => {
        const innerText = e.target.innerHTML

        const timestampMatches = innerText.match(
            /(\d{1,2}:\d{2}|\d:\d{2}:\d{2})/g
        )

        if (timestampMatches) {
            e.preventDefault()
            const query = timestampMatches[0]
            const cleanPath = router.asPath.split("?")[0]
            router.push(
                { pathname: cleanPath, query: { t: query } },
                undefined,
                {
                    shallow: true,
                }
            )
        }
    }

    return (
        <Flex flexDir={"column"} w="full">
            <div
                onClick={handleClickHtml}
                className={
                    allPTags
                        ? "max-w-full max-h-fit word-break:break-all"
                        : colorMode === "light"
                        ? "prose max-w-none whitespace-normal  prose-a:text-blue-600 prose-strong:font-extrabold"
                        : "prose max-w-none text-slate-300 prose-headings:text-slate-300 prose-p:text-slate-300 prose-a:text-blue-300 prose-strong:font-extrabold prose-strong:text-blue-700"
                }
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                /* dangerouslySetInnerHTML={{ __html: handleShortening() }} */
            />
            {content.length > (maxL ?? 500) && showMoreButton && (
                <Button
                    my={"10px"}
                    onClick={() => setShowMore(!showMore)}
                    variant={"outline"}
                    size={"sm"}
                    maxW={"100px"}
                >
                    {showMore ? "Show less" : "Show more"}{" "}
                </Button>
            )}
        </Flex>
    )
}

export default HtmlParser
