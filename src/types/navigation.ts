import { IconType } from "react-icons";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  children?: NavChild[];
}
