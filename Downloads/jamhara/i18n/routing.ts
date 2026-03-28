import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar"],
  defaultLocale: "ar",
  localePrefix: "never",  // لا بادئة — العربية دائماً على /
  localeDetection: false,
});
