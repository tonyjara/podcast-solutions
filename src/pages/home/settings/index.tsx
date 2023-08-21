import SettingsLayout from "@/components/Layouts/SettingsLayout";
import ProfileSettingsPage from "@/pageContainers/Home/Settings/ProfileSettings.home.settings";
import React from "react";

const index = () => {
  return (
    <SettingsLayout>
      <ProfileSettingsPage />
    </SettingsLayout>
  );
};

export default index;
