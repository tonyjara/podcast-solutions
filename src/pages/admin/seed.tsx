import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast"
import { trpcClient } from "@/utils/api"
import { Button, Flex } from "@chakra-ui/react"
import axios from "axios"
import React from "react"

const Seed = () => {
    const { mutate: deleteSubscriptions } =
        trpcClient.seed.deleteSubscriptions.useMutation(
            handleUseMutationAlerts({ successText: "Deleted subscriptions" })
        )

    const { mutate: deleteAllButThisAccounts } =
        trpcClient.seed.deleteAllAccountsAndUsersButCurrent.useMutation(
            handleUseMutationAlerts({ successText: "Deleted account" })
        )

    const { mutate: deleteAllAudioFiles } =
        trpcClient.seed.deleteAllAudioFiles.useMutation(
            handleUseMutationAlerts({ successText: "Deleted audio files" })
        )

    const { mutate: restartAccount } =
        trpcClient.seed.restartAccount.useMutation(
            handleUseMutationAlerts({ successText: "Restarted account" })
        )

    const handleRestart = async () => {
        const req = await axios("/api/get-connection-string")
        const { connectionString } = req.data
        restartAccount({ connectionString })
    }

    return (
        <Flex gap="20px">
            <Button onClick={() => handleRestart()}>Restart account</Button>
            <Button onClick={() => deleteAllAudioFiles()}>
                Delete audio files
            </Button>
            <Button onClick={() => deleteAllButThisAccounts()}>
                Delete all accounts but this one
            </Button>

            <Button onClick={() => deleteSubscriptions()}>
                Delete Subscriptions
            </Button>
        </Flex>
    )
}

export default Seed
