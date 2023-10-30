import SigninPage from "@/pageContainers/Auth/SigninPage"
import { getProviders, getCsrfToken } from "next-auth/react"

//Signin page for Next Auth
const Signin = ({ csrfToken, providers }: any) => {
    return <SigninPage csrfToken={csrfToken} providers={providers} />
}

export default Signin

export async function getServerSideProps(context: any) {
    const providers = await getProviders()
    const csrfToken = await getCsrfToken(context)
    return {
        props: {
            providers,
            csrfToken,
        },
    }
}
