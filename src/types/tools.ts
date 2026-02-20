import { IconType } from "react-icons";

export interface AppItem {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  color: string;
  children?: AppItem[];
}
