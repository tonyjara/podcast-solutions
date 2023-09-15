import { manageSubscription } from "@/lib/utils/SubscriptionManagementUtils"
import HomePage from "@/pageContainers/Home/HomePage.home"
import { getServerAuthSession } from "@/server/auth"
import { prisma } from "@/server/db"
import { type GetServerSideProps } from "next"
export default HomePage

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context)
    if (!session) {
        return {
            redirect: {
                destination: "/signin",
                permanent: false,
            },
            props: {},
        }
    }

    const subManager = await manageSubscription(session?.user.id)

    const user = session.user
    const prefs = await prisma.preferences.findUnique({
        where: { userId: user.id },
    })

    //Redirect user that has not setup his podcast
    if (!prefs?.selectedPodcastId) {
        return {
            redirect: {
                destination: "/home/welcome",
                permanent: false,
            },
            props: {},
        }
    }

    return (
        subManager ?? {
            props: {},
        }
    )
}
