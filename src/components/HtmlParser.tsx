import { Button, Flex, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import sanitizeHtml from "sanitize-html"

type Props = {
    content: string
    showMoreButton?: boolean
    maxL?: number
    allPTags?: boolean
}

const HtmlParser = ({ maxL, content, showMoreButton, allPTags }: Props) => {
    const [showMore, setShowMore] = useState(false)
    const { colorMode } = useColorMode()
    const handleShortening = () => {
        if (!showMoreButton) return content
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

    return (
        <Flex flexDir={"column"} w="full">
            <div
                className={
                    allPTags
                        ? "max-w-full max-h-fit word-break:break-all"
                        : colorMode === "light"
                        ? "prose max-w-none whitespace-normal  prose-a:text-blue-600 prose-strong:font-extrabold"
                        : "prose max-w-none text-slate-300 prose-headings:text-slate-300 prose-p:text-slate-300 prose-a:text-blue-300 prose-strong:font-extrabold prose-strong:text-blue-700"
                }
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
