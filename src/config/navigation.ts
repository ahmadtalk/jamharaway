import {
  HiOutlineHome,
  HiOutlineScale,
  HiOutlineTemplate,
  HiOutlineLightningBolt,
  HiOutlinePencilAlt,
  HiOutlineDocumentText,
  HiOutlineHand,
  HiOutlineVideoCamera,
} from "react-icons/hi";
import type { NavItem } from "@/types/navigation";

export const navItems: NavItem[] = [
  {
    label: "لوحة التحكم",
    href: "/dashboard",
    icon: HiOutlineHome,
  },
  {
    label: "الجدارة التحريرية",
    href: "/dashboard/apps/editorial-merit",
    icon: HiOutlineScale,
  },
  {
    label: "القوالب الصحفية",
    href: "/dashboard/apps/templates",
    icon: HiOutlineTemplate,
    children: [
      { label: "الهرم المقلوب", href: "/dashboard/apps/templates/inverted-pyramid" },
      { label: "الهرم المعتدل", href: "/dashboard/apps/templates/moderate-pyramid" },
      { label: "الساعة الرملية", href: "/dashboard/apps/templates/hourglass" },
      { label: "الماسة الإخبارية", href: "/dashboard/apps/templates/diamond" },
      { label: "سيخ الكباب", href: "/dashboard/apps/templates/kebab" },
      { label: "كأس المارتيني", href: "/dashboard/apps/templates/martini" },
    ],
  },
  {
    label: "الأخبار العاجلة",
    href: "/dashboard/apps/breaking-news",
    icon: HiOutlineLightningBolt,
  },
  {
    label: "العناوين",
    href: "/dashboard/apps/headlines",
    icon: HiOutlinePencilAlt,
  },
  {
    label: "التقرير الصحفي",
    href: "/dashboard/apps/press-report",
    icon: HiOutlineDocumentText,
  },
  {
    label: "الاحتياجات الخمسة",
    href: "/dashboard/apps/five-needs",
    icon: HiOutlineHand,
  },
  {
    label: "أصول التغطية",
    href: "/dashboard/apps/coverage",
    icon: HiOutlineVideoCamera,
    children: [
      { label: "الصناديق الخمسة", href: "/dashboard/apps/coverage/five-boxes" },
    ],
  },
];
