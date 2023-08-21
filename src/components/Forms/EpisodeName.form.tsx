import FormControlledText from "@/components/Forms/FormControlled/FormControlledText";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Button, Flex, Text } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const validateTitle = z.object({
  title: z
    .string()
    .min(3, "Name must be at least 3 character")
    .max(100, "Name must be less than 100 characters"),
});

const EpisodeNameForm = () => {
  const trpcContext = trpcClient.useContext();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<{ title: string }>({
    defaultValues: { title: "" },
    resolver: zodResolver(validateTitle),
  });
  const { mutate } = trpcClient.episode.createEpisodeWithTitle.useMutation(
    handleUseMutationAlerts({
      successText: "Episode created",
      callback: (episode) => {
        trpcContext.podcast.invalidate();
        router.push(`home/episodes/edit/${episode.id}`);
      },
    }),
  );
  const submitFunc = async (data: { title: string }) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(submitFunc)} noValidate>
      <Flex flexDir={"column"} gap={5}>
        <Text>
          Pick a name for your episode, after that we can add more details{" "}
        </Text>
        <FormControlledText
          control={control}
          errors={errors}
          name="title"
          label="Episode Name"
          helperText="Ex: My first episode"
          autoFocus={true}
        />
        <Button
          type="submit"
          isLoading={isSubmitting}
          colorScheme="green"
          size="lg"
          alignSelf={"flex-end"}
        >
          Next
        </Button>
      </Flex>
    </form>
  );
};

export default EpisodeNameForm;

// http://localhost:3000/home/shows/edit/cll1ic1ln00009kqs94wcylx4
