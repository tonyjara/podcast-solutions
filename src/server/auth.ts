import { type GetServerSidePropsContext } from "next"
import { getServerSession, type NextAuthOptions, type Account } from "next-auth"
import { prisma } from "@/server/db"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { postToTelegramGroup } from "@/utils/TelegramUtils"

export type SessionUser = Omit<Account, "password"> & {
    id: string
    accountId: string
    firstName: string
    lastName: string
    image: string
    email: string
    role: string
}
declare module "next-auth" {
    interface Session {
        expires: Date
        user: SessionUser
        status: "loading" | "authenticated" | "unauthenticated"
    }
}

export const authOptions: NextAuthOptions = {
    callbacks: {
        jwt: async ({ token, account, user }) => {
            /* Purpose of this function is to receive the information from authorize and add jwt token information. */
            /* - user is the return from authorize */
            /* - account describes type and provider, ex: */
            /*  {"type":"credentials","provider":"credentials"} */
            /* - token holds the iat, exo and jti. */

            if (account?.type === "credentials") {
                token.user = user
            }

            return token
        },

        session: async ({ session, token }) => {
            /*  Purpose of this callback is to handle the session object. */
            /* Session has the user object with authorize return and the expiration date. */
            /* token has the same info as the jwt, it has the user with the authorize return and iat, exp and jti */

            session.user = token.user as SessionUser

            return session
        },
    },
    // Configure one or more authentication providers

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                // keys added here will be part of the credentials type.
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials.password) return null
                //This runs when the user tries to login.
                // Purpose of this function is to check if the email and password exist and match the hashed password in the database.
                // If they match we strip the password and we return the user object we want to keep on the session.

                const account = await prisma.account.findUnique({
                    where: {
                        email: credentials.email.toLowerCase(),
                    },
                    include: { user: true },
                })
                if (!account) return null

                if (!account.isVerified || !account.active || !account.user)
                    return null

                const matchesHash = await bcrypt.compare(
                    credentials.password,
                    account.password //hashed pass
                )

                if (!matchesHash) return null
                const sessionUser: SessionUser = {
                    active: account.active,
                    role: account.role,
                    isVerified: account.isVerified,
                    createdAt: account.createdAt,
                    updatedAt: account.updatedAt,
                    accountId: account.id,
                    id: account.user.id,
                    email: account.email,
                    firstName: account.user.firstName,
                    lastName: account.user.lastName,
                    image: account.user.image ?? "",
                }
                await postToTelegramGroup(sessionUser.email, "logged in")

                return sessionUser
            },
        }),
    ],
    session: {
        maxAge: 12 * 60 * 60, // 12 hours
        updateAge: 12 * 60 * 60, // 12 hours
        strategy: "jwt",
    },
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"]
    res: GetServerSidePropsContext["res"]
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions)
}
