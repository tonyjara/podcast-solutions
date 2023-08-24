import type { IconType } from "react-icons";
import { FiHome, FiSettings } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { TbSeeding } from "react-icons/tb";
import { FaCcStripe } from "react-icons/fa";
import { VscPreview } from "react-icons/vsc";
import { BsRss } from "react-icons/bs";
import { Session } from "inspector";
import { SessionUser } from "@/server/auth";

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

export const SidebarLinks: (user: SessionUser) => Array<LinkItemProps> = (
  user: SessionUser,
) => {
  return [
    ...AdminLinks(user.role === "admin"),
    { name: "Home", icon: FiHome, dest: "/home" },
    {
      name: "Preview",
      icon: VscPreview,
      dest: "/home/preview",
    },
    { name: "Settings", icon: FiSettings, dest: "/home/settings" },
  ];
};
