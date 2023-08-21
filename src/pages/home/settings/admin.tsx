import SettingsLayout from "@/components/Layouts/SettingsLayout";
import AdminPage from "@/pageContainers/Home/Settings/AdminPage.home.settings";
import React from "react";

const admin = () => {
  return (
    <SettingsLayout>
      <AdminPage />
    </SettingsLayout>
  );
};

export default admin;
