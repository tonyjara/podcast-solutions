// import {
//   defaultAccountProfileData,
//   validateAccountProfile,
// } from '@/lib/validations/profileSettings.validate';
import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";

const ProfileSettingsPage = () => {
  // const context = trpcClient.useContext();
  // const {
  //   handleSubmit,
  //   control,
  //   reset,
  //   setValue,
  //   formState: { errors, isSubmitting },
  // } = useForm<FormAccountProfile>({
  //   defaultValues: defaultAccountProfileData,
  //   resolver: zodResolver(validateAccountProfile),
  // });

  // const { error, mutate, isLoading } =
  // trpcClient.account.updateMyProfile.useMutation(
  //   handleUseMutationAlerts({
  //     successText: 'Su perfil ha sido actualizado! Favor ingrese nuevamente.',
  //     callback: () => {
  //       // handleOnClose();
  //       reset();
  //       context.invalidate();
  //       signOut();
  //     },
  //   })
  // );

  // const { data, isLoading: isLoadingProfile } =
  //   trpcClient.account.getForProfileEdit.useQuery();

  // useEffect(() => {
  //   if (!data) return;
  //   reset(data);
  //   return () => {};
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data]);

  // const submitFunc = async (data: FormAccountProfile) => {
  //   mutate(data);
  // };

  return (
    <Box w={"100%"} maxW={"600px"}>
      {/* <form onSubmit={handleSubmit(submitFunc)} noValidate> */}
      <Flex gap={"10px"}>
        {/* <TitleComponent title="Configuración de perfil" /> */}
        {/* <Button */}
        {/*   // isDisabled={isLoading || isSubmitting || isLoadingProfile} */}
        {/*   type="submit" */}
        {/*   colorScheme="blue" */}
        {/*   mr={3} */}
        {/* > */}
        {/*   Guardar */}
        {/* </Button> */}
      </Flex>
      {/* {error && <Text color="red.300">{knownErrors(error.message)}</Text>} */}
      <Text color={"gray.400"}></Text>
      {/* {user && (
          <FormControlledAvatarUpload
            control={control}
            errors={errors}
            urlName="profile.avatarUrl"
            label="Foto de perfil"
            setValue={setValue}
            helperText=""
            userId={user.id}
          />
        )} */}
      {/* <FormControlledText
          control={control}
          errors={errors}
          name="displayName"
          label="Nombre"
          autoFocus={true}
        /> */}

      {/* <FormControlledText
          control={control}
          errors={errors}
          name="email"
          label="Correo"
          autoFocus={true}
        /> */}
      {/* </form> */}
    </Box>
  );
};

export default ProfileSettingsPage;
