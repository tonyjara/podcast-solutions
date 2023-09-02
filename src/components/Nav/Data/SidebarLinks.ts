import type { IconType } from "react-icons";
import { FiHome, FiSettings } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbSeeding } from "react-icons/tb";
import { FaCcStripe } from "react-icons/fa";
import { SessionUser } from "@/server/auth";
import { BsSpeedometer2 } from "react-icons/bs";
import { AiOutlineFundView } from "react-icons/ai";

export interface LinkItemProps {
  name: string;
  icon: IconType;
  dest: string; //destination
  target?: string;
  children?: {
    name: string;
    icon: IconType;
    dest: string; //destination
    target?: string;
  }[];
}

const AdminLinks: (isAdmin: boolean) => Array<LinkItemProps> = (isAdmin) => {
  return isAdmin
    ? [
        {
          name: "Admin",
          icon: MdOutlineAdminPanelSettings,
          dest: "/admin",
          children: [
            {
              name: "Seed",
              icon: TbSeeding,
              dest: "/admin/seed",
            },
            {
              name: "Stripe Products",
              icon: FaCcStripe,
              dest: "/admin/stripe/products",
            },

            {
              name: "Stripe Prices",
              icon: FaCcStripe,
              dest: "/admin/stripe/prices",
            },

            {
              name: "Usage Playground",
              icon: BsSpeedometer2,
              dest: "/admin/usage-playground",
            },
          ],
        },
      ]
    : [];
};

export const SidebarLinks: (
  user: SessionUser,
  selectedPodcastSlug: string,
) => Array<LinkItemProps> = (user: SessionUser, selectedPodcastSlug) => {
  return [
    ...AdminLinks(user.role === "admin"),
    { name: "Home", icon: FiHome, dest: "/home" },
    {
      name: "Preview",
      icon: AiOutlineFundView,
      dest: `/podcasts/${selectedPodcastSlug}`,
    },
    { name: "Settings", icon: FiSettings, dest: "/home/settings" },
  ];
};
