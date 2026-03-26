import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed", // Arabic: /, English: /en/
  localeDetection: false,    // لا تكتشف لغة المتصفح — العربية دائماً الافتراضية
});
