import Head from "next/head"
import { useRouter } from "next/router"
import React from "react"
import DrawerWithTopBar from "../Nav/DrawerWithTopBar"
import BottomSubscriptionEndBanner from "./BottomSubscriptionEndBanner"

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter()
    const pathName = router.pathname.split("/")
    const title = pathName[pathName.length - 1]
    const defaultText = `Podcast Solutions ${
        process.env.NODE_ENV === "development" ? "DEV" : ""
    }`

    const handleTitles = (x: string) => {
        const titlesDictionary: any = {
            ["home"]: "Home",
            ["seed"]: "Seed",
        }
        return titlesDictionary[x] ?? defaultText
    }

    return (
        <>
            <DrawerWithTopBar>
                <Head>
                    <title>{handleTitles(title ?? "")}</title>
                </Head>
                {children}
            </DrawerWithTopBar>
            <BottomSubscriptionEndBanner />
        </>
    )
}

export default RootLayout
