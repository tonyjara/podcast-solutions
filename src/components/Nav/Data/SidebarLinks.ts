import type { IconType } from "react-icons";
import { FiHome, FiSettings } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbSeeding } from "react-icons/tb";
import { FaCcStripe } from "react-icons/fa";
import { VscPreview } from "react-icons/vsc";
import { BsRss } from "react-icons/bs";

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
              name: "Stripe",
              icon: FaCcStripe,
              dest: "admin/stripe",
            },
          ],
        },
      ]
    : [];
};

export const SidebarLinks: (isAdmin: boolean) => Array<LinkItemProps> = (
  isAdmin,
) => {
  return [
    ...AdminLinks(isAdmin),
    { name: "Home", icon: FiHome, dest: "/home" },
    {
      name: "Preview",
      icon: VscPreview,
      dest: "/home/preview",
    },
    {
      name: "Rss Preview",
      icon: BsRss,
      dest: "/home/preview/rss",
      target: "_blank",
    },

    { name: "Settings", icon: FiSettings, dest: "/home/settings" },
  ];
};
