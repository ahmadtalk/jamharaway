# CLAUDE.md — جمهرة · دليل المطوّر للذكاء الاصطناعي

> اقرأ هذا الملف أولاً قبل أي عمل على المشروع.
> يُحدَّث كلما حُلّت مشكلة جديدة أو تغيّر نمط مهم.

---

## 1. هوية المشروع

**جمهرة** — منصة معرفية عربية. محتوى مُولَّد بالذكاء الاصطناعي في **18 نوعاً** و**43 قالباً** بصرياً.

- **URL:** https://jamhara.com
- **Stack:** Next.js 15.5 App Router + TypeScript + Supabase + Anthropic Claude
- **Deploy:** `npx vercel deploy --prod` (لا يوجد git remote — Vercel CLI مباشرة)
- **Supabase Project ID:** `kzxphzobrkgqqshxzvjr` (eu-central-1)
- **Vercel Project:** `prj_thVfJ013J8WkVcRORiS4oxdg46p0` / team: `team_JAlIfUla2hOgxNMKI9qB09vc`
- **Models:** انظر `lib/ai-config.ts` — **Haiku 4.5 لجميع الأنواع بما فيها المقالات** (تغيير مارس 2026 لخفض التكلفة)
- **خطة Vercel:** Hobby — حد الدالة 60 ثانية، Cron مرة يومياً ← يُكمِّلها cron-job.org (كل 5 دقائق)

---

## 2. هيكل الملفات — خريطة سريعة

```
app/
├── [locale]/          # الموقع العام (ar/en) — next-intl
│   ├── page.tsx       # feed — revalidate 60 + ترتيب زمني تنازلي (بدون interleave) + HomeHero
│   ├── [category]/    # صفحة تصنيف — SEO كامل (OG + hreflang + JSON-LD CollectionPage)
│   ├── p/[id]/        # صفحة منشور — revalidate 300 + ViewTracker
│   ├── search/        # بحث — revalidate 0
│   ├── sections/      # كل التصنيفات — عداد المنشورات بدل التخصصات الفرعية
│   ├── most-read/
│   ├── latest/        # أحدث المنشورات — LatestFeedClient + Load More ← جديد
│   ├── type/[type]/   # صفحة لكل نوع محتوى (18 نوعاً) ← جديد
│   ├── advanced/      # صفحة المحتوى المتقدم (14 نوعاً) ← جديد
│   ├── statistics/    # إحصائيات المنصة (revalidate 300) ← جديد
│   └── our-dna/       # فلسفتنا / Our DNA — قصة جمهرة + منهج 80/20 + 43 قالب ← جديد
├── admin/             # لوحة التحكم — auth بـ supabase.auth.getUser()
│   ├── page.tsx       # dashboard + recharts
│   ├── posts/         # جدول + فلترة + bulk
│   ├── generate/      # نافذة التوليد الموحدة (43 قالب)
│   ├── categories/    # إدارة التصنيفات
│   ├── schedule/      # الجدولة الديناميكية الكاملة
│   ├── costs/         # تكاليف آنية (Anthropic + Supabase + Replicate + Vercel)
│   └── diagnostics/   # فحص صحة المشروع (force-dynamic)
└── api/
    ├── generate/              # مقال
    ├── generate-chart/        # مخطط (15 نوع)
    ├── generate-quiz/         # اختبار (6 أنواع)
    ├── generate-comparison/   # مقارنة (6 أنواع)
    ├── generate-ranking/      # ترتيب
    ├── generate-numbers/      # أرقام
    ├── generate-scenarios/    # سيناريوهات
    ├── generate-timeline/     # خط زمني
    ├── generate-factcheck/    # تدقيق حقائق
    ├── generate-profile/      # بروفايل ← جديد
    ├── generate-briefing/     # موجز ← جديد
    ├── generate-quotes/       # اقتباسات ← جديد
    ├── generate-explainer/    # أسئلة شارحة ← جديد
    ├── generate-debate/       # مناظرة ← جديد
    ├── generate-guide/        # خطوات عملية ← جديد
    ├── generate-network/      # خريطة الصلات ← جديد
    ├── generate-interview/    # مقابلة ← جديد
    ├── generate-map/          # توزيع جغرافي ← جديد
    │   (جميعها: topic اختياري، category_slug إلزامي فقط)
    ├── flag-post/             # تبليغ عن منشور → post_flags ← جديد
    ├── view-post/             # POST — يستدعي increment_post_view RPC ← جديد
    ├── share-image/           # GET — يستدعي Railway Puppeteer ويُعيد PNG ← جديد
    ├── admin/
    │   ├── generate/          # PROXY — يمرر طلبات التوليد مع GENERATE_SECRET
    │   ├── schedules/         # GET+POST — إدارة الجدولات
    │   ├── schedules/[id]/    # PUT+DELETE+POST(toggle|run)
    │   ├── schedule-runs/     # GET — سجل التشغيل
    │   ├── posts/...          # CRUD للمنشورات
    │   ├── categories/        # إدارة التصنيفات
    │   └── logout/
    ├── search/                # بحث نصي
    └── cron/
        ├── scheduler/         # المحرك الرئيسي — يقرأ scheduled_jobs ويُنفّذها
        └── generate-daily/    # legacy — fallback

components/
├── admin/
│   ├── GeneratePageClient.tsx  # نافذة التوليد الموحدة — 43 قالب
│   ├── SchedulePageClient.tsx  # الجدولة الديناميكية
│   ├── PostsTableClient.tsx    # جدول المنشورات + bulk
│   ├── DashboardCharts.tsx     # Recharts — "use client"
│   ├── AdminShell.tsx
│   └── Toast.tsx
├── layout/
│   ├── Header.tsx              # "use client" — topbar + شعار + بحث + لغة
│   ├── Sidebar.tsx             # NavIcon pattern — تنقل فقط (بدون قائمة التصنيفات)
│   ├── RightPanel.tsx          # تصنيفات جمهرة — CAT_SVG map + rcard-in animation
│   ├── Footer.tsx              # Server Component
│   └── MobileNav.tsx
├── shared/
│   ├── JCardShell.tsx              # غلاف بطاقة موحّد لجميع الأنواع
│   ├── ViewTracker.tsx             # "use client" — يستدعي /api/view-post عند mount
│   ├── ShareCard.tsx               # بطاقة مشاركة موحّدة (19 نوع) — html-to-image
│   ├── ShareCardModal.tsx          # مودال html-to-image (النظام القديم)
│   ├── ShareButton.tsx             # زر html-to-image
│   ├── ProfileShareCard.tsx        # بطاقة بروفايل غنية (مربع/أفقي/ستوري) ← جديد
│   ├── NewsShareCard.tsx           # بطاقة خبر Axios-style ← جديد
│   ├── SharePreviewRenderer.tsx    # wrapper لـ ShareCard لصفحة Puppeteer ← جديد
│   └── PuppeteerShareButton.tsx    # زر "صورة احترافية" → Railway Puppeteer ← جديد
├── feed/ charts/ quiz/ comparison/ ranking/ numbers/
├── scenarios/ timeline/ factcheck/
├── profile/     ← جديد — ProfileCard.tsx
├── briefing/    ← جديد — BriefingCard.tsx
├── quotes/      ← جديد — QuotesCard.tsx
├── explainer/   ← جديد — ExplainerCard.tsx
├── debate/      ← جديد — DebateCard.tsx
├── guide/       ← جديد — GuideCard.tsx
├── network/     ← جديد — NetworkCard.tsx
├── interview/   ← جديد — InterviewCard.tsx
└── map/         ← جديد — MapCard.tsx

lib/
├── supabase/
│   ├── client.ts    # browser client (anon key)
│   ├── server.ts    # server client (SSR cookies)
│   ├── admin.ts     # service_role client (createAdminClient)
│   └── types.ts     # جميع TypeScript interfaces (18 نوع محتوى)
├── ai-config.ts       # ← نماذج AI المركزية (ARTICLE_MODEL / CONTENT_MODEL / EVAL_MODEL)
├── json-utils.ts      # ← extractJSON + sanitizeJSON + stripCiteTags (مشترك بين 15 route)
├── generate-utils.ts  # SOURCE_INSTRUCTION + toSourcesArray (يُعيد تصدير من prompts/shared)
└── prompts/           # مكتبة البرومبت — المصدر الوحيد للحقيقة
    ├── index.ts       # تصدير مركزي لجميع الـ builders
    ├── shared/
    │   ├── sources.ts   # SOURCE_INSTRUCTION
    │   ├── persona.ts   # JAMHARA_EDITOR + DATA_ANALYST + ...
    │   └── json-rules.ts
    └── types/           # ملف لكل نوع محتوى (18 ملف) — buildXPrompt()

app/admin/admin.css    # كل CSS الأدمن — CSS vars: --a-green, --a-border
app/globals.css        # نظام التصميم الكامل + .jcard-* + .jflag-* + @keyframes rcard-in
vercel.json            # { crons: [{ path: /api/cron/scheduler, schedule: "0 3 * * *" }] }
```

---

## 3. أنماط حرجة — لا تُخطئها

### أ) Auth في Admin API Routes
```typescript
const supabase = await createClient(); // من lib/supabase/server.ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### ب) Auth في Admin Pages (Server Components)
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/admin/login");
```

### ج) حماية API التوليد
```typescript
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true; // dev: مفتوح
  const auth = (req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}
```

### د) Admin Generate Proxy — مهم جداً
صفحة الأدمن لا تستدعي generate APIs مباشرة (ستحصل على 401).
بدلاً من ذلك تمر عبر `/api/admin/generate`:
```
Browser → POST /api/admin/generate { _api: "/api/generate-quiz", ...body }
  → يتحقق من Supabase session
  → يُمرّر إلى /api/generate-quiz مع Authorization: Bearer GENERATE_SECRET
```

**⚠️ عند إضافة route توليد جديد:** يجب إضافته إلى `ALLOWED_APIS` في `/api/admin/generate/route.ts` وإلا يظهر خطأ `Invalid API endpoint`.

### هـ) Client vs Server Components
- كل مكونات `components/admin/` → `"use client"`
- كل صفحات `app/admin/` → Server Components
- **⚠️ Footer.tsx هو Server Component** — لا `onMouseEnter`/`onMouseLeave`، استخدم CSS `:hover`

### و) PostCard — dispatcher المحتوى
```typescript
chart      → ChartCard (chart_config)
quiz       → QuizCard (quiz_config)
comparison → ComparisonCard (comparison_config)
// كل ما يلي يستخدم content_config:
ranking / numbers / scenarios / timeline / factcheck /
profile / briefing / quotes / explainer / debate /
guide / network / interview / map
// default → ArticleCard
```

### ز) نماذج AI — lib/ai-config.ts (المصدر الوحيد)
```typescript
// lib/ai-config.ts
export const ARTICLE_MODEL = "claude-sonnet-4-5-20250929"; // مقالات فقط — صياغة عربية راقية
export const CONTENT_MODEL = "claude-haiku-4-5-20251001";  // 17 نوعاً هيكلياً — أسرع وأرخص
export const EVAL_MODEL    = "claude-haiku-4-5-20251001";  // quality check خفيف فقط
```
**⚠️ Vercel Hobby = 60 ثانية حد أقصى.** Sonnet مع web_search يستغرق 40-50 ثانية → لا يصلح إلا للمقالات.
إذا أردت Sonnet للجميع → يجب الترقية لـ Vercel Pro (300 ثانية).

### ح) استخراج JSON — lib/json-utils.ts (مشترك بين 15 route)
```typescript
import { extractJSON, stripCiteTags, sanitizeJSON } from "@/lib/json-utils";

// extractJSON تجرب 3 استراتيجيات × 2 محاولة = 6 محاولات:
// 1) النص كاملاً  2) ```json...```  3) أول { ... }
// في كل محاولة: مباشرة ثم بعد sanitizeJSON
const parsed = extractJSON(resultText);
```
**لا تنسخ `extractJSON` محلياً في أي route جديد** — استورد من `@/lib/json-utils`.

**stripCiteTags:** Sonnet مع web_search يُدرج `<cite index="...">نص</cite>` تلقائياً.
`extractJSON` تستدعيها قبل أي parse — لا تحتاج استدعاءها يدوياً في معظم الحالات.

### ط) نمط التوليد الثنائي (Two-Turn) — حرج جداً ⚠️
```typescript
// بعد استدعاء Claude مع web_search:
for (const b of response.content) if (b.type === "text") resultText += b.text;

// ← دائماً افحص tool_use، ولا تعتمد فقط على غياب "{"
const hasToolUse = response.content.some((b: {type:string}) => b.type === "tool_use");
if (hasToolUse || !resultText.trim() || !resultText.includes("{")) {
  resultText = ""; // ← إعادة التعيين ضرورية — بدونها يتلوث JSON بنص الرسالة الأولى
  const followup = await anthropic.messages.create({
    messages: [
      { role: "user", content: promptText },
      { role: "assistant", content: response.content },
      { role: "user", content: "الآن أرجع JSON المطلوب فقط." },
    ],
  });
  for (const b of followup.content) if (b.type === "text") resultText += b.text;
}
```
**سبب الباتيرن:** Claude يبحث أولاً بـ web_search ثم يُنتج النص، لكن بعد البحث يعود بـ `tool_use` blocks قد لا تحتوي JSON نظيف. الرسالة الثانية تطلب JSON خالص.

---

## 4. قاعدة البيانات — المعرفة الحرجة

### جداول رئيسية
```
posts              — id, title_ar, title_en, body_ar, type, status, category_id
                     chart_config, quiz_config, comparison_config, content_config (jsonb)
                     view_count, like_count, published_at
categories         — id, name_ar, name_en, slug, parent_id, color, icon TEXT,
                     is_active, sort_order, post_count
                     (icon = إيموجي يُستخدم في admin فقط — Sidebar/RightPanel تستخدم CAT_SVG)
post_interactions  — post_id UUID, session_id TEXT, action TEXT (like/share/view)
post_flags         — id, post_id, reason, name?, note?, created_at ← جديد
scheduled_jobs     — جدولات التوليد التلقائي الديناميكية
scheduled_job_runs — سجل كل تشغيل مع نتائج تفصيلية
```

### post_flags — جدول التبليغات
```sql
CREATE TABLE post_flags (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id  TEXT NOT NULL,
  reason   TEXT NOT NULL,  -- من قائمة FLAG_REASONS في JCardShell
  name     TEXT,           -- اسم المُبلِّغ (اختياري)
  note     TEXT,           -- ملاحظة إضافية (اختيارية)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS: anon INSERT, authenticated SELECT
```

### posts.type — القيم المسموحة (18 نوعاً)
```sql
CHECK (type IN (
  'article', 'chart', 'quiz', 'comparison',
  'ranking', 'numbers', 'scenarios', 'timeline', 'factcheck',
  'profile', 'briefing', 'quotes', 'explainer', 'debate',
  'guide', 'network', 'interview', 'map'
))
```
**⚠️ عند إضافة نوع جديد:** يجب تحديث هذا الـ constraint في Supabase:
```sql
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN (...));
```

### جداول الجدولة — scheduled_jobs
```sql
id               UUID PK
name             TEXT
is_active        BOOLEAN DEFAULT true
recurrence       TEXT CHECK IN ('once','daily','interval')
run_at_hour      SMALLINT (0-23) NULLABLE   -- UTC — null لجدولات interval
run_at_minute    SMALLINT (0-55) NULLABLE   -- كل 5 دقائق — null لجدولات interval
interval_minutes INT CHECK (>= 5) NULLABLE  -- لنوع interval فقط
post_types       TEXT[]                     -- تُختار عشوائياً
posts_count      SMALLINT (1-10)
category_slugs   TEXT[] NULLABLE            -- NULL = كل التصنيفات النشطة
last_run_at      TIMESTAMPTZ
total_runs / total_succeeded / total_failed INT
```

**أنواع التكرار:**
- `once` — يعمل مرة واحدة عند run_at_hour:run_at_minute ثم يُعطَّل تلقائياً
- `daily` — يعمل يومياً في run_at_hour:run_at_minute
- `interval` — يعمل كل `interval_minutes` دقيقة باستمرار (run_at_hour/minute = null)

### ⚠️ RLS — تحذير مهم
RLS مُفعَّل على جميع الجداول. **إذا فشلت عملية كتابة:** `/admin/diagnostics` → قسم RLS.

---

## 5. متغيرات البيئة

```bash
NEXT_PUBLIC_SUPABASE_URL        # https://kzxphzobrkgqqshxzvjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   # eyJ...
ANTHROPIC_API_KEY               # sk-ant-...
GENERATE_SECRET                 # يحمي /api/generate* و /api/admin/generate
CRON_SECRET                     # يحمي /api/cron/scheduler
NEXT_PUBLIC_SITE_URL            # https://jamhara.com
REPLICATE_API_TOKEN             # اختياري — Flux Schnell للصور
SUPABASE_SERVICE_ROLE_KEY       # للعمليات الحساسة (createAdminClient)
GNEWS_API_KEY                   # 6f64bce4838846052ccde0426948a76b — أخبار GNews
PUPPETEER_SERVICE_URL           # https://puppeteer-screenshot.up.railway.app ← جديد
PUPPET_SECRET                   # مشترك مع Railway — يحمي /screenshot endpoint ← جديد
```

---

## 6. أنواع المحتوى الكاملة — 18 نوعاً، 43 قالباً

### جدول كامل

| النوع | العمود في DB | المكوّن | API | القالب في الأدمن |
|---|---|---|---|---|
| `article` | body_ar/en | ArticleCard | `/api/generate` | 1 |
| `chart` | chart_config | ChartCard → Recharts | `/api/generate-chart` | 16 (auto + 15 نوع) |
| `quiz` | quiz_config | QuizCard | `/api/generate-quiz` | 6 أنواع |
| `comparison` | comparison_config | ComparisonCard | `/api/generate-comparison` | 6 أنواع |
| `ranking` | content_config | RankingCard | `/api/generate-ranking` | 1 |
| `numbers` | content_config | NumbersCard | `/api/generate-numbers` | 1 |
| `scenarios` | content_config | ScenariosCard | `/api/generate-scenarios` | 1 |
| `timeline` | content_config | TimelineCard | `/api/generate-timeline` | 1 |
| `factcheck` | content_config | FactCheckCard | `/api/generate-factcheck` | 1 |
| `profile` | content_config | ProfileCard | `/api/generate-profile` | 1 |
| `briefing` | content_config | BriefingCard | `/api/generate-briefing` | 1 |
| `quotes` | content_config | QuotesCard | `/api/generate-quotes` | 1 |
| `explainer` | content_config | ExplainerCard | `/api/generate-explainer` | 1 |
| `debate` | content_config | DebateCard | `/api/generate-debate` | 1 |
| `guide` | content_config | GuideCard | `/api/generate-guide` | 1 |
| `network` | content_config | NetworkCard | `/api/generate-network` | 1 |
| `interview` | content_config | InterviewCard | `/api/generate-interview` | 1 |
| `map` | content_config | MapCard | `/api/generate-map` | 1 |

### توزيع القوالب في الأدمن (43 قالب)
```
مقال     (1)  → /api/generate
اختبار   (6)  → mcq, true_false, timeline, matching, guess_who, speed
مقارنة   (6)  → bars, matrix, profile, timeline_duel, stance, spectrum
مخطط    (16)  → auto + area, line, bar, bar-h, bar-stacked, bar-100,
                  area-stacked, pie, donut, scatter, radar, composed,
                  treemap, funnel, radialbar
متقدم   (14)  → ranking, numbers, scenarios, timeline, factcheck,
                  profile, briefing, quotes, explainer, debate,
                  guide, network, interview, map
```

### ربط نوع المحتوى بـ API في الكرون
```typescript
const TYPE_API: Record<string, string> = {
  article:    "/api/generate",
  chart:      "/api/generate-chart",
  quiz:       "/api/generate-quiz",
  comparison: "/api/generate-comparison",
  ranking:    "/api/generate-ranking",
  numbers:    "/api/generate-numbers",
  scenarios:  "/api/generate-scenarios",
  timeline:   "/api/generate-timeline",
  factcheck:  "/api/generate-factcheck",
  profile:    "/api/generate-profile",
  briefing:   "/api/generate-briefing",
  quotes:     "/api/generate-quotes",
  explainer:  "/api/generate-explainer",
  debate:     "/api/generate-debate",
  guide:      "/api/generate-guide",
  network:    "/api/generate-network",
  interview:  "/api/generate-interview",
  map:        "/api/generate-map",
};
```

---

## 7. أنواع المحتوى المتقدمة — تفاصيل التصميم

### البروفايل (profile)
تعريف صحفي ثري حول شخص أو جهة.
```typescript
interface ProfilePostConfig {
  subject_type: "person" | "organization" | "country" | "movement" | "other";
  full_name_ar/en, known_as_ar/en, tagline_ar/en
  avatar_emoji: string;   // إيموجي الهوية
  avatar_color: string;   // hex — يُحدد كل الألوان في البطاقة
  image_url?: string;     // صورة حقيقية إن وُجدت (https فقط)
  quick_facts: ProfilePostQuickFact[];  // 3-5 حقائق سريعة
  stats?: ProfilePostStat[];            // 3-5 أرقام بارزة
  timeline?: ProfilePostTimelineItem[]; // 5-10 أحداث زمنية
  sections?: ProfilePostSection[];      // 3-5 محاور تحريرية (تفاصيل فقط)
}
```
**ألوان أنواع الموضوع:** person=#7B5EA7, organization=#2196F3, country=#4CB36C, movement=#E05A2B
**ألوان خط الزمن:** milestone=#4CB36C, award=#F59E0B, crisis=#E05A2B, founding=#2196F3, death=#6B7280

### الموجز (briefing)
ملخص تنفيذي: نقاط رئيسية + اقتباس بارز + أرقام مفتاحية + خلاصة.
```typescript
interface BriefingConfig {
  key_points: BriefingKeyPoint[];       // 5-7 نقاط
  featured_quote?: BriefingFeaturedQuote;
  key_numbers?: BriefingKeyNumber[];    // 3-4 أرقام
  bottom_line_ar/en?: string;           // الخلاصة الرئيسية
}
```

### الاقتباسات (quotes)
5-8 اقتباسات بارزة لشخصيات متنوعة حول قضية واحدة.
```typescript
interface QuotesConfig {
  topic_ar/en: string;
  quotes: QuoteItem[];  // text, author, role, date, sentiment
}
// sentiment: "positive" | "negative" | "neutral" | "warning"
```

### أسئلة شارحة (explainer)
قالب صحفي: 6-10 أسئلة وأجوبة تشرح موضوعاً معقداً.
```typescript
interface ExplainerConfig {
  intro_ar/en?: string;
  questions: ExplainerQuestion[];  // question + answer + icon?
}
```

### المناظرة (debate)
عرض موضوع خلافي بمنطق التأييد والمعارضة.
```typescript
interface DebateConfig {
  question_ar/en: string;
  side_a: DebateSide;  // label, emoji, color, arguments[4-5], summary?
  side_b: DebateSide;
  verdict_ar/en?: string;  // خلاصة المحرر
}
```

### خطوات عملية (guide)
دليل مرقّم قابل للتنفيذ مع أوقات تقديرية وتحذيرات.
```typescript
interface GuideConfig {
  goal_ar/en: string;         // الهدف من الدليل
  difficulty?: "easy"|"medium"|"hard";
  total_duration_ar/en?: string;
  steps: GuideStep[];  // step#, icon, title, description, duration?, warning?
}
```
**اللون:** `#0891B2` (teal). **FEED_LIMIT:** 4 خطوات.

### خريطة الصلات (network)
شبكة علاقات مركزية بأنواع وقوة.
```typescript
interface NetworkConfig {
  center_ar/en: string;   // الجهة المركزية
  center_emoji?: string;
  center_role_ar/en?: string;
  nodes: NetworkNode[];   // name, emoji, role, relation_type, strength, description
}
// relation_type: ally|rival|partner|client|parent|subsidiary|competitor|neutral|other
// strength: strong|medium|weak → يُعرض كـ 3 نقاط
```
**ألوان العلاقات:** ally=#2D7A46, rival=#B45309, partner=#1D4ED8, competitor=#DC2626, neutral=#6B7280

### المقابلة (interview)
حوار Q&A صحفي مع هيدر الشخصية.
```typescript
interface InterviewConfig {
  interviewee_ar/en: string;
  role_ar/en?: string;
  date?: string;
  context_ar/en?: string;   // سياق المقابلة
  qa: InterviewQA[];        // question + answer
}
```
**اللون:** `#1D4ED8`. **FEED_LIMIT:** 3 أسئلة.

### التوزيع الجغرافي (map)
بيانات مقارنة عبر دول ومناطق مع أشرطة نسبية وعلم.
```typescript
interface MapConfig {
  topic_ar/en: string;
  metric_ar/en?: string;    // المقياس المُقارَن
  regions: MapRegion[];     // name, flag, value, unit, highlight?, note?
  insight_ar/en?: string;   // الاستنتاج الرئيسي
}
// highlight: true → حدود خضراء + خلفية مميزة
// الأشرطة نسبية: barPct = (value / maxValue) * 100
```
**اللون:** `#059669`. **FEED_LIMIT:** 8 مناطق.

---

## 8. نظام المصادر والبحث

### SOURCE_INSTRUCTION — في `lib/generate-utils.ts`
```typescript
export const SOURCE_INSTRUCTION = `
**تعليمات البحث والمصادر — مهم جداً:**
- استخدم أداة web_search للبحث قبل الكتابة
- ابحث في: الجزيرة نت، العربية، سكاي نيوز عربي، BBC عربي، فرانس 24، رويترز، AFP...
- يُمنع استخدام ويكيبيديا أو المواقع غير الموثوقة
- استخدم فقط روابط حقيقية من نتائج بحثك الفعلي
- إذا لم تجد رابطاً حقيقياً، اترك sourceUrl فارغاً`;
```
**مُضمَّن في:** جميع الـ 18 route (يُلحق بنهاية كل prompt).

### نمط المصادر المتعددة في JCardShell
```typescript
// sources[] مفضّل على sourceUrl الفردي
sources?: { name: string; url: string }[];
// 0 مصادر → زر معطّل | 1 مصدر → رابط مباشر | 2+ → dropdown
```
المقالات تخزّن مصادرها في `content_config: { sources: [{name, url}] }`.

---

## 9. نظام بطاقات القوائم — أنماط CSS مشتركة

### التدرج اللوني + "اعرض الكل" (feed فقط)
```tsx
// لكل بطاقة تحتوي قائمة طويلة (timeline, factcheck, ranking, numbers,
// scenarios, comparison, profile, guide, network, interview, map)

const hasMore = !isDetail && items.length > FEED_LIMIT;

<div className={hasMore ? "jcard-fade-wrap" : ""}>
  {itemsToShow.map(...)}
  {hasMore && <div className="jcard-fade-overlay" />}
</div>
{hasMore && (
  <Link href={postHref} className="jcard-more">
    {isAr ? `اعرض الكل (${items.length}) ←` : `Show all (${items.length}) →`}
  </Link>
)}
```

### CSS في globals.css
```css
.jcard-fade-wrap    { position: relative; }
.jcard-fade-overlay { position: absolute; bottom:0; height:90px;
                      background: linear-gradient(to bottom, rgba(255,255,255,0), #fff);
                      z-index:1; pointer-events:none; width:100%; }
.jcard-more         { justify-content: center; font-size:.82rem; font-weight:700;
                      position: relative; z-index:2; /* فوق التدرج */ }
```

### الوصف يظهر أعلى القائمة (feed فقط)
```tsx
{!isDetail && body && <p>{body}</p>}   {/* أعلى */}
<div className={...}>{items}</div>     {/* القائمة */}
{isDetail && body && <p>{body}</p>}    {/* أسفل في صفحة التفاصيل */}
```

---

## 10. زر التحقق (تبليغ) — JCardShell

كل بطاقة تحتوي زر **دقّق** يفتح modal تبليغ:

```typescript
// FLAG_REASONS في JCardShell.tsx (6 أسباب)
const FLAG_REASONS = [
  { id: "inaccurate",    ar: "معلومات غير دقيقة",    en: "Inaccurate information" },
  { id: "outdated",      ar: "محتوى قديم أو منتهي",   en: "Outdated content" },
  { id: "misleading",    ar: "مضلل أو مبتور السياق",  en: "Misleading" },
  { id: "offensive",     ar: "محتوى مسيء",            en: "Offensive content" },
  { id: "wrong_source",  ar: "مصدر خاطئ أو مزوّر",   en: "Wrong/fake source" },
  { id: "other",         ar: "سبب آخر",               en: "Other" },
];

// API: POST /api/flag-post
// Body: { post_id, reason, name?, note? }
// يُحفظ في جدول post_flags
```

CSS classes: `.jflag-overlay`, `.jflag-modal`, `.jflag-reasons`, `.jflag-done`

---

## 11. أنواع المخططات البيانية (15 نوعاً + auto)

| القالب في الأدمن | chartType | المكتبة |
|---|---|---|
| 🤖 تلقائي | — | Claude يختار |
| 📈 منطقة | `area` | Recharts AreaChart |
| 📉 خطي | `line` | Recharts LineChart |
| 📊 أعمدة | `bar` | Recharts BarChart |
| ⬛ أعمدة أفقية | `bar-horizontal` | BarChart layout="vertical" |
| 🗂️ أعمدة مكدسة | `bar-stacked` | stackId="a" |
| 💯 أعمدة 100% | `bar-100` | normalizes to 100% |
| 🌊 منطقة مكدسة | `area-stacked` | Area stackId="a" |
| 🥧 دائري | `pie` | Recharts PieChart |
| 🍩 حلقي | `donut` | PieChart innerRadius |
| 🫧 نقطي/فقاعي | `scatter` | Recharts ScatterChart |
| 🕸️ رادار | `radar` | Recharts RadarChart |
| 🔀 مركّب | `composed` | Recharts ComposedChart |
| 🟩 شجرة النسب | `treemap` | Recharts Treemap |
| 🔻 قمع | `funnel` | Recharts FunnelChart |
| 🎯 أعمدة دائرية | `radialbar` | Recharts RadialBarChart |

**المكوّن:** `components/charts/ChartRenderer.tsx`
**التمرير من الأدمن:** `if (template.chartType !== "auto") body.chart_type = template.chartType`

---

## 12. نظام الجدولة التلقائية

### البنية الكاملة
```
cron-job.org (كل 30 دقيقة)
    ↓ GET /api/cron/scheduler (Authorization: Bearer CRON_SECRET)
    ↓ يقرأ scheduled_jobs المفعَّلة التي حان وقتها
    ↓ يُنشئ سجل في scheduled_job_runs (status: 'running')
    ↓ يُولّد المنشورات (نوع عشوائي من post_types، تصنيف عشوائي)
    ↓ يُحدّث السجل: done / partial / failed + results[]
    ↓ يُحدّث scheduled_jobs: last_run_at + total_*
```

### منطق اختيار الجدولات (في الكود)
```typescript
// interval: يعمل حين last_run_at + interval_minutes <= now
if (job.recurrence === "interval") {
  if (!job.last_run_at) return true;  // لم يعمل قط
  return now.getTime() >= new Date(job.last_run_at).getTime() + mins * 60_000;
}
// once/daily: يتحقق من hour + minute + إذا لم يعمل اليوم
```

### إعداد cron-job.org
- **URL:** `https://jamhara.com/api/cron/scheduler`
- **جدول:** كل **5 دقائق** (مطلوب لدعم interval < 30 دقيقة)
- **Header:** `Authorization: Bearer [قيمة CRON_SECRET]`
- **Vercel fallback:** `vercel.json` → `"0 3 * * *"` (مرة يومياً)

**⚠️ إذا كان cron-job.org يعمل كل 30 دقيقة فقط:** جدولات interval أقل من 30 دقيقة لن تعمل بدقة.

---

## 13. نظام التصميم — CSS Variables

```css
/* globals.css */
--green:       #4CB36C   /* اللون الأساسي */
--green-dark:  #3A9558
--green-deep:  #2D7A46
--green-light: #E8F6ED
--green-pale:  #F2FAF5
--navy:        #373C55   /* Header + Footer */
--ink:         #1E2130   /* النص الرئيسي */
--muted:       #6B7280
--slate:       #DBE3EA
--slate3:      #EDF1F5
--rust:        #E05A2B   /* تحذيرات */

/* admin.css */
--a-green:  #4CB36C
--a-border: #E8EBF0
```

**الخطوط:**
- نصوص: `IBM Plex Sans Arabic` — weight 300
- عناوين: `Cairo` — weight 700

**التخطيط (Desktop):**
```
Sidebar(210px) | Main(660px max) | RightPanel(250px)
Header sticky: top:0  |  Sidebar/Panel sticky: top:108px + align-self:start
```

---

## 14. نمط الأيقونات — NavIcon + CAT_SVG

### NavIcon — نمط موحّد في Sidebar و RightPanel
```tsx
// مربع ملوّن (28×28، borderRadius:8) + SVG stroke بداخله
function NavIcon({ d, d2, color, bg, size = 15 }) {
  return (
    <span style={{ width: 28, height: 28, borderRadius: 8, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
        {d2 && <path d={d2} />}
      </svg>
    </span>
  );
}
```
**المبدأ:** `bg = color + "1A"` (ألفا 10%) — يمكن تعديله لكل نوع.

### Sidebar — ألوان أنواع المحتوى (TYPE_LINKS)
| النوع | color | مسار SVG (Heroicons v2 outline) |
|---|---|---|
| article | #3B6CC4 | M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652... |
| chart | #2D7A46 | M2.25 18L9 11.25l4.306 4.307... (trend up) |
| quiz | #7C3AED | M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0... |
| comparison | #C05E1A | M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5... |
| profile | #4338CA | M15.75 6a3.75 3.75 0 11-7.5 0... |
| numbers | #4338CA | M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0... |
| advanced | #6366F1 | M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75... |

### RightPanel — CAT_SVG (slug → SVG paths للتصنيفات)
```typescript
const CAT_SVG: Record<string, { d: string; d2?: string }> = {
  "politics":               { d: "M3 21h18M5 21V7l7-5 7 5v14M9 21v-6h6v6" },
  "economics-and-business": { d: "M2.25 18L9 11.25l4.306 4.307..." },
  "society":                { d: "M17 20H7...", d2: "M12 10a4 4 0 100-8..." },
  "religions":              { d: "M21.752 15.002A9.718 9.718 0 0118 15.75..." },
  "technology":             { d: "M3.75 13.5l10.5-11.25L12 10.5h8.25..." },
  "history":                { d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0..." },
  "geography":              { d: "M12 2a10 10 0 100 20A10 10 0 0012 2z", d2: "M2 12h20..." },
  "sciences":               { d: "M9 3v7.5L4 18h16l-5-7.5V3M6 3h12" },
  "medicine-and-health":    { d: "M9 12h6m-3-3v6", d2: "M12 22a10 10 0..." },
  "humanities":             { d: "M12 6.253v13m0-13C10.832 5.477..." },
  "lifestyle":              { d: "M12 3v1m0 16v1...", d2: "M16 12a4 4 0 11-8 0..." },
  "culture":                { d: "M2.25 15.75l5.159-5.159a2.25 2.25 0..." },
  "sports":                 { d: "M9 12l2 2 4-4m5.618-4.016A11.955..." },
  "misc":                   { d: "M9.879 7.519c1.171-1.025 3.071-1.025..." },
};
// الألوان من cat.color (DB) — bg = color + "15"
```

### تحريك RightPanel (globals.css)
```css
@keyframes rcard-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rcard { animation: rcard-in .45s cubic-bezier(.22,.68,0,1.2) both; }
.rcard:nth-child(2) { animation-delay: .07s; }
.rcard:nth-child(3) { animation-delay: .14s; }
.rpanel-cat-row { transition: background .15s; }
.rpanel-cat-row:hover { background: var(--slate3); }
```

### ألوان الأيقونات في إحصائيات الأنواع (statistics/page.tsx → TYPE_NAMES)
| النوع | إيموجي | color |
|---|---|---|
| article | ✍️ | #3B6CC4 |
| chart | 📈 | #2D7A46 |
| quiz | 🎯 | #7C3AED |
| comparison | ⚡ | #C05E1A |
| ranking | 🥇 | #D97706 |
| numbers | 🔣 | #4338CA |
| scenarios | 🌀 | #BE185D |
| timeline | ⏳ | #0D9488 |
| factcheck | 🔍 | #DC2626 |
| profile | 🪪 | #4338CA |
| briefing | 🗞️ | #1D4ED8 |
| quotes | 🗣️ | #7C3AED |
| explainer | 💡 | #16A34A |
| debate | 🏛️ | #C2410C |
| guide | 🧭 | #0891B2 |
| network | 🔗 | #9333EA |
| interview | 🎙️ | #D97706 |
| map | 🌍 | #059669 |

---

## 15. التواصل الاجتماعي — معرّف جمهرة

المعرف: `jamharacom` على جميع المنصات.

| المنصة | الرابط |
|---|---|
| X (Twitter) | https://x.com/jamharacom |
| Instagram | https://instagram.com/jamharacom |
| YouTube | https://youtube.com/@jamharacom |
| LinkedIn | https://linkedin.com/company/jamharacom |
| Threads | https://threads.net/@jamharacom |
| TikTok | https://tiktok.com/@jamharacom |

**الأيقونات في:** Topbar (`Header.tsx`) + Footer (`Footer.tsx`) — **ليست** في Sidebar.

---

## 16. مشاكل شائعة وحلولها

### ❌ "Invalid API endpoint" عند التوليد من الأدمن
**السبب:** route جديد لم يُضف إلى `ALLOWED_APIS` في `/api/admin/generate/route.ts`.
**الحل:** أضف مسار الـ API إلى المصفوفة ثم انشر.

### ❌ "Invalid X config" — فشل توليد أي نوع محتوى
**السبب الأول:** الـ followup يُضاف فوق نص الرسالة الأولى → JSON ملوّث.
**الحل:** تأكد من `resultText = ""` قبل حلقة الـ followup، وتأكد من `hasToolUse` check.
**السبب الثاني:** نوع المحتوى غير موجود في `posts_type_check` constraint.
**الحل:** `ALTER TABLE posts DROP/ADD CONSTRAINT posts_type_check CHECK (type IN (...))`.

### ❌ "new row violates check constraint posts_type_check"
**السبب:** إضافة نوع محتوى جديد بدون تحديث DB constraint.
**الحل:** Migration عبر Supabase MCP أو Dashboard.

### ❌ "خطأ 401 من API التوليد في صفحة الأدمن"
**الحل:** استخدم proxy `/api/admin/generate` مع `{ _api: "/api/generate-X", ...body }`.

### ❌ "500 في الصفحة الرئيسية — لا تفاصيل"
```
Vercel MCP → get_runtime_logs
projectId: prj_thVfJ013J8WkVcRORiS4oxdg46p0
teamId: team_JAlIfUla2hOgxNMKI9qB09vc
```

### ❌ نصوص تحتوي `<cite index="...">` مرئية للقارئ
**السبب:** Sonnet مع web_search يُدرج citation tags تلقائياً داخل النص المُولَّد.
**الحل في `/api/generate`:** `stripCiteTags()` في `lib/json-utils.ts` تُطبَّق بعد parse.
**الحل في routes الأخرى:** `extractJSON()` من `lib/json-utils.ts` تستدعيها تلقائياً.
**لا تنسخ `extractJSON` محلياً** — استورد من `@/lib/json-utils` دائماً.

### ❌ 504 Timeout عند استخدام Sonnet لجميع الأنواع
**السبب:** Vercel Hobby = 60 ثانية. Sonnet + web_search + followup = 40-50 ثانية للمقالة.
بقية الأنواع (profile، comparison...) أطول بكثير بسبب JSON الضخم → تتجاوز 60 ثانية.
**الحل:** CONTENT_MODEL = Haiku، ARTICLE_MODEL = Sonnet (مقالات فقط).
**للترقية مستقبلاً:** Vercel Pro → maxDuration يصل 300 ثانية.

### ❌ "JSON parse failed" في generate-profile أو غيره
**السبب الأول:** `<cite>` tags تكسر JSON values التي تحتوي روابط.
**السبب الثاني:** trailing commas أو تعليقات في JSON مُولَّد.
**السبب الثالث:** `sanitizeJSON` القديمة كانت تحذف `//` من URLs.
**الحل:** استخدم `extractJSON` من `lib/json-utils.ts` — تعالج الثلاثة تلقائياً.

### ❌ عدادات التصنيفات خاطئة (post_count)
**السبب:** الـ trigger القديم كان يعمل على INSERT/DELETE فقط — لا UPDATE.
تفعيل منشور من الأدمن (draft→published) لا يُحدِّث العداد.
**الحل (مُنفَّذ):**
```sql
-- 1. إعادة حساب من الصفر
UPDATE categories SET post_count = (SELECT COUNT(*) FROM posts WHERE category_id = c.id AND status = 'published');
-- 2. trigger جديد يشمل UPDATE على status
CREATE OR REPLACE FUNCTION update_category_post_count() ...
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') ...
```

### ❌ like_count يفقد إعجابات عند التزامن
**السبب:** الكود القديم كان يعمل `update({ like_count: likes + 1 })` بقيمة محلية — race condition.
**الحل (مُنفَّذ):** RPC `increment_post_like(p_post_id, p_session_id)` — atomic toggle في DB.
```sql
-- يدعم الإعجاب والإلغاء، يعيد { liked: bool, count: int }
GRANT EXECUTE ON FUNCTION increment_post_like(TEXT, TEXT) TO anon;
```

### ❌ "null value in column run_at_hour violates not-null constraint" عند إنشاء interval job
**السبب:** العمود كان NOT NULL، لكن interval jobs لا تحتاجه.
**الحل (مُنفَّذ):**
```sql
ALTER TABLE scheduled_jobs ALTER COLUMN run_at_hour DROP NOT NULL;
ALTER TABLE scheduled_jobs ALTER COLUMN run_at_minute DROP NOT NULL;
```

### ❌ "Event handlers cannot be passed to Client Component"
**الحل:** استبدل `onMouseEnter` بـ CSS `:hover` في globals.css.

### ❌ "القائمة الجانبية مقطوعة أو فيها scrollbar"
**الحل:** احذف `overflow: hidden` من `.rcard`، استخدم `align-self: start` في `.rpanel`.

### ❌ "Vercel Cron يرفض `*/30 * * * *`"
**السبب:** خطة Hobby. **الحل:** cron-job.org (مُعدَّد ✅).

### ❌ "ESLint: component defined inside component"
**الحل:** انقل تعريف Component خارج الدالة الرئيسية.

### ❌ عدادات المشاهدات لا تتزايد — view_count يبقى صفراً
**السبب:** `increment_post_view(p_post_id TEXT)` بينما `post_interactions.post_id` من نوع `UUID`.
PostgreSQL لا يُحوّل TEXT→UUID ضمنياً في INSERT — تفشل العملية برمّتها صمتاً.
`ON CONFLICT DO NOTHING` لا يُخفي أخطاء النوع، لكن API `/api/view-post` يُهدر الخطأ بـ `try/catch` وViewTracker يُهدره بـ `.catch(() => {})`.
**الحل:** إضافة cast صريح `::uuid` في الدالة:
```sql
CREATE OR REPLACE FUNCTION public.increment_post_view(p_post_id text, p_session_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE already_viewed BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM post_interactions
    WHERE post_id = p_post_id::uuid   -- ← الإصلاح
      AND session_id = p_session_id AND action = 'view'
  ) INTO already_viewed;
  IF NOT already_viewed THEN
    INSERT INTO post_interactions (post_id, session_id, action)
    VALUES (p_post_id::uuid, p_session_id, 'view')  -- ← الإصلاح
    ON CONFLICT DO NOTHING;
    UPDATE posts SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_post_id::uuid;  -- ← الإصلاح
  END IF;
END;
$function$;
```
**تحذير:** أي دالة أو query تُدرج في `post_interactions.post_id` يجب أن تستخدم `::uuid`.

---

## 17. i18n — قواعد هامة

```typescript
locales: ["ar", "en"], defaultLocale: "ar", localePrefix: "as-needed"
// ar → /  (بلا بادئة) | en → /en/
```
- `locale === "ar"` → `dir="rtl"` | `locale === "en"` → `dir="ltr"`
- `useTranslations()` في Client | `getTranslations()` في Server

---

## 18. النشر

```bash
npx vercel deploy --prod
# المشروع في ~/Downloads/jamhara — لا يوجد git remote
# بعد كل تغيير: تحقق من /admin/diagnostics
```

**⚠️ بعد إضافة متغير بيئة جديد:** أعد النشر لأن الدوال لا تقرأ القيمة الجديدة تلقائياً.

---

## 19. ملاحظات معمارية

- **لا Clerk** — Auth بـ Supabase فقط
- **لا Tailwind في الأدمن** — `admin.css` مستقل
- **لا service_role في API routes العادية** — `anon key` + RLS
- **البيانات JSON** — Supabase يُعيدها كـ object، لا `JSON.parse()`
- **`content_config`** — union type لـ 14 نوعاً، افحص `post.type` أولاً
- **`router.refresh()`** — يُحدّث Server Components بعد mutations
- **Replicate** — اختياري، Flux Schnell، فقط إذا `REPLICATE_API_TOKEN` مضبوط
- **web_search_20250305** — مدمج في Anthropic، **اختياري per-route** بـ `use_web_search` param:
  - أنواع إخبارية (article, profile, factcheck, map): default `true`
  - 14 نوعاً هيكلياً: default `false` — أسرع وأرخص بلا Two-Turn
  - toggle في صفحة الأدمن Generate: badge أزرق "بحث" أو برتقالي "⚡ بدون بحث"
- **الكرون يعمل بـ anon key** — RLS policies تسمح له بالقراءة والكتابة
- **لا Tavily** — محذوف كلياً، `lib/prompts/shared/sources.ts` هو المصدر الوحيد
- **`lib/ai-config.ts`** — النموذج لا يُكتب في أي route مباشرةً — استورد ARTICLE_MODEL/CONTENT_MODEL
- **`lib/json-utils.ts`** — `extractJSON` لا تُنسخ محلياً — استورد دائماً
- **like_count** — لا تستخدم `.update({ like_count: n })` — استخدم RPC `increment_post_like`
- **post_count في categories** — يُحدَّث تلقائياً بـ trigger على INSERT/UPDATE/DELETE في posts

---

## 20. ما تم إنجازه — سجل المهام

### جلسة مارس 2026 — المجموعة الأولى
- [x] نافذة التوليد الموحدة (19 قالب)
- [x] Admin Generate Proxy (حل مشكلة 401)
- [x] topic اختياري في جميع generate routes
- [x] تحسينات Header/Footer/Sidebar/RightPanel

### جلسة مارس 2026 — المجموعة الثانية
- [x] نظام الجدولة الديناميكية الكامل (scheduled_jobs + scheduled_job_runs)
- [x] محرك الكرون `/api/cron/scheduler`
- [x] إعداد cron-job.org

### جلسة مارس 2026 — المجموعة الثالثة
- [x] حذف Tavily كلياً + `lib/generate-utils.ts` بـ SOURCE_INSTRUCTION
- [x] بحث حقيقي عبر web_search في جميع routes + تصفية Wikipedia
- [x] نظام المصادر الحقيقية (sources[] array) في JCardShell
- [x] الاختبارات تبدأ تلقائياً في صفحة التفاصيل
- [x] زر "دقّق" (تبليغ) وظيفي + post_flags table + /api/flag-post
- [x] تحسينات بطاقات القوائم: وصف أعلى + "اعرض الكل" مُوسَّط + تدرج لوني
- [x] تطبيق التحسينات على: timeline, factcheck, ranking, numbers, scenarios, comparison (6)
- [x] 16 نوع مخطط في الأدمن (auto + 15 نوع محدد)
- [x] 7 أنواع مخططات جديدة في ChartRenderer: bar-h, bar-stacked, bar-100, area-stacked, treemap, funnel, radialbar
- [x] **نوع البروفايل (profile)** — كامل: route + card + types + DB
- [x] **4 أنواع متقدمة:** briefing, quotes, explainer, debate
- [x] **4 أنواع متقدمة:** guide, network, interview, map
- [x] إصلاح خلل Two-Turn: `resultText = ""` + `hasToolUse` check في جميع الـ 9 routes
- [x] تحديث DB constraint لـ 18 نوعاً
- [x] الكل موصول بـ: PostCard dispatcher + detail page + admin + cron + RightPanel icons

### جلسة مارس 2026 — المجموعة الرابعة (UI + إصلاح المشاهدات)
- [x] **Sidebar — إعادة تصميم كاملة:** حذف قسم التصنيفات + "كل التصنيفات"، NavIcon pattern (مربع ملوّن + stroke SVG)، تحديث TYPE_LINKS بألوان per-type، QUICK_LINKS بنفس النمط، شارة "شائع" بدل النقطة الحمراء
- [x] **RightPanel — أيقونات CAT_SVG:** نفس نمط NavIcon للتصنيفات (slug → SVG paths)، حذف رابط الإحصائيات
- [x] **RightPanel animation:** `@keyframes rcard-in` (translateY + opacity) مع nth-child delays، hover = `var(--slate3)` فقط (بدون translateX)
- [x] **إيموجيات محدّثة لـ 18 نوع محتوى:** article:✍️، chart:📈، quiz:🎯، comparison:⚡، ranking:🥇، numbers:🔣، scenarios:🌀، timeline:⏳، factcheck:🔍، profile:🪪، briefing:🗞️، quotes:🗣️، explainer:💡، debate:🏛️، guide:🧭، network:🔗، interview:🎙️، map:🌍
- [x] **أيقونات التصنيفات في DB:** تحديث `icon` column لـ 14 تصنيف + تعديل ألوان lifestyle/humanities
- [x] **صفحة /statistics:** حذف 4 بطاقات (مشاهدات، إعجابات، هذا الأسبوع، جلسات AI)، إبقاء 3 بطاقات بـ SVG icon boxes، تلوين أشرطة توزيع الأنواع per-type
- [x] **إصلاح عداد المشاهدات:** تشخيص خطأ TEXT vs UUID في `increment_post_view`، إضافة `::uuid` cast في 3 أماكن، تحقق ناجح (view_count → 1، صف في post_interactions)

### جلسة مارس 2026 — المجموعة الخامسة (جودة التوليد + العدادات + الجدولة المتقدمة)

**برومبت المقالة v2.0:**
- [x] `lib/prompts/types/article.ts` — فورمولا الـ Hook (3 أنواع)، بنية 3 طبقات بأوزان كلمات، قاعدة التحديد (أرقام/تواريخ إلزامية)، قائمة محظورات حرفية (يُعدّ / في ظل...)، فورمولا العنوان 5-9 كلمات، رفع الطول إلى 100-160 كلمة

**نظام النماذج المركزي:**
- [x] `lib/ai-config.ts` — ARTICLE_MODEL (Sonnet 4.5) + CONTENT_MODEL (Haiku 4.5) + EVAL_MODEL
- [x] مقالات على Sonnet 4.5 (`claude-sonnet-4-5-20250929`) — صياغة عربية راقية
- [x] 17 نوعاً هيكلياً على Haiku — أسرع من 60 ثانية (حد Vercel Hobby)
- [x] تشخيص وتوثيق سبب 504 Timeout عند محاولة Sonnet للجميع

**إصلاحات JSON وCite Tags:**
- [x] `lib/json-utils.ts` — `extractJSON` (3 استراتيجيات × 2) + `sanitizeJSON` + `stripCiteTags`
- [x] 15 route تستورد من `lib/json-utils` بدل نسخ محلية
- [x] إصلاح `sanitizeJSON` التي كانت تحذف `//` من URLs وتكسر الروابط
- [x] إصلاح max_tokens (1200→2500) وإضافة hasToolUse check في `/api/generate`

**إصلاح العدادات:**
- [x] إعادة حساب post_count لجميع التصنيفات (14 تصنيف) من الصفر
- [x] trigger جديد يشمل UPDATE على status (draft→published)
- [x] RPC `increment_post_like` — atomic toggle مع إعادة count الحقيقي
- [x] `JCardShell.tsx` — يستخدم RPC بدل direct update، يدعم الإلغاء

**الجدولة المتقدمة (interval):**
- [x] عمود `interval_minutes` في `scheduled_jobs`
- [x] نوع ثالث `interval` في recurrence — `run_at_hour/minute` nullable
- [x] Scheduler يكتشف interval jobs بـ `last_run_at + interval_minutes <= now`
- [x] UI — خيار ثالث "⏱ كل N دقيقة" مع picker (5د → 4س)
- [x] API routes تقبل وتحفظ `interval_minutes`
- [x] إعداد cron-job.org كل 5 دقائق مطلوب للفواصل الصغيرة

**تحسينات متفرقة:**
- [x] إصلاح خطوط Google: className على `<html>` بدل `<body>` + latin subset لـ IBM Plex

### جلسة مارس 2026 — المجموعة السادسة (تحسينات AI + الصفحة الرئيسية + فلسفتنا)

**تحسينات نظام AI:**
- [x] **ARTICLE_MODEL → Haiku** — تحويل المقالات من Sonnet إلى Haiku لخفض التكلفة (~94%)
- [x] **web_search اختياري per-route** — `use_web_search` param في جميع 18 route:
  - أنواع إخبارية (article/profile/factcheck/map): default `true` — يحتفظ بـ Two-Turn
  - 14 نوعاً هيكلياً: default `false` — single call بلا بحث، أسرع وأرخص
- [x] **Toggle في أدمن Generate:** يتغير تلقائياً عند تغيير المجموعة + badge ديناميكي

**برومبت المقالة v3.0 (`lib/prompts/types/article.ts`):**
- [x] **Anchor Fact requirement:** قبل الكتابة يجب تحديد حدث يجتاز: ماذا؟ متى؟ من؟ كم؟
- [x] **نافذة بحث مقسّمة:**
  - سياسي/اقتصادي → **آخر 12 ساعة** (يوسّع إلى 48 عند الضرورة)
  - علمي/تاريخي/ثقافي → آخر 30 يوماً
- [x] **حظر صريح للتعميم والملخصات:** ممنوع "وضع" / "تحديات" / "فرص" / "آفاق" / "مستجدات" كأساس
- [x] **مبدأ "الحدث لا الموضوع":** لا نظرة عامة — حدث واحد + تعمق حوله فقط

**إعادة تصميم الصفحة الرئيسية (`app/[locale]/page.tsx`):**
- [x] إزالة interleaveFeed → ترتيب زمني تنازلي بسيط
- [x] إضافة `HomeHero` Client Component في أعلى الفيد
- [x] إخفاء "أحدث المنشورات" و"الأكثر قراءة" من Sidebar (محفوظان بـ `{false && ...}`)

**HomeHero (`components/feed/HomeHero.tsx`) — جديد:**
- [x] خلفية: navy/blue gradient + شبكة متحركة + orbs عائمة
- [x] Live badge: خلفية بيضاء، نبض أحمر، نص أحمر
- [x] زر refresh دوّار (router.refresh() بدون full reload)
- [x] عنوان "سلام أيها الجمهريون" بخط Rubik (Google Fonts)
- [x] subtitle: "نسخّر قوة الذكاء الاصطناعي لنقدم لكم وجبات معرفية مذهلة"
- [x] إحصائيات: عدد المنشورات (Latin numerals) + 43 قالب
- [x] زر "فلسفتنا" / "Our DNA": خلفية بيضاء، نص أخضر، أيقونة DNA، رابط `/our-dna`

**خط Rubik (`app/layout.tsx`):**
- [x] إضافة `Rubik` من next/font/google (weights: 700/800/900)
- [x] CSS variable: `--font-rubik`

**صفحة فلسفتنا (`app/[locale]/our-dna/`) — جديدة:**
- [x] URL: `/our-dna` (سابقاً `/philosophy`)
- [x] Hero: تدرج داكن + إحصائيات 3 أرقام (2014، 43، 18)
- [x] 5 أقسام: القصة / لماذا جمهرة؟ / فلسفة المعرفة / منهج 80/20 / القوالب الـ43
- [x] اقتباس محمود شاكر + جدول 80/20 بصري (AI 80% vs Human 20%)
- [x] 18 بطاقة قالب بمعاينات بصرية مخصصة لكل نوع (18 مكوّن preview)
- [x] تحديث MobileNav: `/philosophy` → `/our-dna`

### جلسة مارس 2026 — المجموعة السابعة (نظام منع التكرار — 3 طبقات)

**البنية المعمارية:**
- [x] `lib/dedup/index.ts` — مكتبة dedup مركزية (4 دوال)
- [x] Supabase migration: جدول `topic_registry` + `pg_trgm` + دالتان SQL

**الطبقة 1 — Scheduler Diversity:**
- [x] `app/api/cron/scheduler/route.ts` → `pickDiverseCombinations()` بدل `shuffle()+pickRandom()`
- [x] يختار المجموعة (category+type) الأقدم استخداماً عبر topic_registry

**الطبقة 2 — Topic Registry:**
- [x] `checkTopicDuplicate()` — فحص قبل التوليد (topic صريح فقط) — FAIL OPEN
- [x] `registerTopic()` — تسجيل بعد الحفظ في جميع 18 route
- [x] عتبات مختلفة per-type: article=0.30 (صارم) ... profile=0.40 (متساهل)
- [x] cooldown periods مختلفة: quiz=7 يوم ... interview=30 يوم
- [x] إذا تكرر الموضوع → HTTP 409 مع تفاصيل المنشور المشابه

**الطبقة 3 — Context Injection:**
- [x] `getRecentTopics()` — جلب آخر 10 مواضيع في نفس التصنيف
- [x] `lib/prompts/types/article.ts` → `recentTopics` param → قسم "لا تكرر" في البرومبت
- [x] فقط في route المقالة حالياً (الأكثر أهمية)

**قاعدة البيانات:**
```sql
-- topic_registry
id, topic_normalized, topic_original, post_type, category_slug, post_id, generated_at
-- GIN index على topic_normalized للبحث بالـ trigram
-- normalize_arabic_text() — يعالج: ألف variants + تاء مربوطة + ألف مقصورة + تشكيل
-- check_topic_duplicate() RPC — p_topic, p_post_type, p_category_slug, p_days_back, p_threshold
```

### جلسة مارس 2026 — المجموعة الثامنة (dedup كامل + تعديل البروفايل + تطوير البرومبت)

**تعميم نظام منع التكرار على جميع الأنواع:**
- [x] 16 route كانت تفتقد Layer 2a و Layer 3 — أُضيفت لجميعها
- [x] الآن: جميع الـ 18 نوع لديها checkTopicDuplicate + getRecentTopics + registerTopic
- [x] recentTopicsBlock يُلحق بنهاية promptText/prompt في كل route تلقائياً

**تعديل البروفايل في لوحة التحكم (محرر كامل):**
- [x] `components/admin/ProfileConfigEditor.tsx` — مكوّن جديد بـ 6 أقسام قابلة للفتح/الإغلاق:
  - المعلومات الأساسية: subject_type، الأسماء، tagline، avatar_emoji، avatar_color (color picker)، image_url، المصدر
  - الحقائق السريعة: إضافة/حذف/تعديل كل حقيقة (أيقونة، تسمية ع/en، قيمة ع/en)
  - الإحصائيات البارزة: إضافة/حذف/تعديل (أيقونة، تسمية، قيمة، وحدة)
  - خط الزمن: إضافة/حذف/تعديل (سنة، حدث ع/en، نوع: milestone/award/crisis/founding/death)
  - الأقسام التفصيلية: إضافة/حذف/تعديل (عنوان + محتوى ع/en)
  - الوسوم: tags_ar وtags_en (مفصولة بفواصل)
- [x] `components/admin/EditPostForm.tsx` — يكتشف `post.type === "profile"` ويُظهر ProfileConfigEditor
- [x] `app/admin/posts/[id]/page.tsx` — يجلب `type` و`content_config` من DB
- [x] `app/api/admin/posts/update/route.ts` — يقبل ويحفظ `content_config`

**تطوير برومبت البروفايل (v2.1):**
- [x] v2.0: سبب النشر الآن (آخر 90 يوماً) + فورمولا tagline + قواعد sections (60-100 كلمة + رقم إلزامي) + قسم الجدل الإلزامي + quick_facts مفاجئة + avatar_color ذكي بحسب subject_type
- [x] v2.1: إصلاح هيكل البرومبت — حذف الخطوات المتعددة مع ━━━ (كانت تُنتج نصاً قبل JSON) → هيكل مسطّح موثوق
- [x] quick_facts: هيكل هجين — 3 حقائق هوية أساسية (ميلاد/جنسية/منصب) + 1-2 مفاجئة — كل قيمة ≤ 7 كلمات

**ملاحظة مهمة — سبب فشل الهيكل متعدد الخطوات:**
برومبت بخطوات مرقّمة وفواصل ━━━ يدفع Haiku لمحاكاة التنسيق وإنتاج نص توضيحي بدل JSON.
القاعدة: تعليمات الجودة تُدمج داخل وصف حقول JSON نفسها — لا خطوات منفصلة.

### جلسة مارس 2026 — المجموعة التاسعة (ميزة الأخبار — GNews)

**البنية الكاملة:**
- [x] DB: `source_url TEXT` column + index + `posts_type_check` يشمل `'news'` + فئة `news` (slug, color #E05A2B, icon 📰)
- [x] `lib/prompts/types/news.ts` — `buildNewsPrompt({ title, description, content, sourceName })` → JSON `{title_ar, body_ar}` فقط
- [x] `app/api/generate-news/route.ts` — توليد يدوي: يجلب من GNews (lang=ar أولاً، MENA إنجليزي fallback)، يفحص source_url، يُعيد صياغة بـ Haiku (1200 tokens)
- [x] `app/api/cron/fetch-news/route.ts` — كرون كل 15 دقيقة: 4 queries متوازية، dedup بـ source_url، max 6 مقالات per run
- [x] `components/news/NewsCard.tsx` — صورة 16/9 + شارة المصدر + 5-line clamp في feed + رابط للمصدر في detail
- [x] `app/[locale]/news/page.tsx` — صفحة قسم الأخبار (revalidate 60s)، hero أحمر مع badge "مباشر"
- [x] PostCard + p/[id]/page.tsx + JCardShell + ALLOWED_APIS + TYPE_API: دعم نوع news
- [x] GeneratePageClient: مجموعة "أخبار" (Group جديدة) + قالب "خبر"
- [x] Sidebar: رابط "الأخبار" في QUICK_LINKS
- [x] `lib/supabase/types.ts`: `NewsConfig` + `"news"` في Post.type union + ContentConfig
- [x] `lib/prompts/index.ts`: تصدير `buildNewsPrompt`
- [x] `GNEWS_API_KEY` مضبوط في Vercel env
- [x] TypeScript ✓ — بدون أخطاء

**GNews API:**
- Key: `6f64bce4838846052ccde0426948a76b`
- Endpoint أخبار عربية: `top-headlines?lang=ar&topic=politics/business`
- Endpoint MENA إنجليزي: `search?q=Middle East OR Arab&lang=en`
- Dedup: بـ `source_url` column في DB (لا trigram)
- **⚠️ يجب ضبط cron-job.org لاستدعاء `/api/cron/fetch-news` كل 15 دقيقة**

### جلسة مارس 2026 — المجموعة الثانية عشرة (بطاقة مشاركة مخصصة للبروفايل والأخبار)

**ProfileShareCard — بطاقة بروفايل غنية:**
- [x] `components/shared/ProfileShareCard.tsx` — مكوّن جديد مخصص لنوع profile
- [x] 3 أحجام: مربع (هيرو متدرج + chips + إحصاءات + خط زمن) / أفقي (لوحة يسرى 400px + grid يميني) / ستوري (space-between 3 أقسام)
- [x] هيدر: سلوغن "قيمة المرء ما يعرفه" italic بدل شارة النوع + شعار جمهرة
- [x] فوتر: "البروفايل كاملاً في موقع جمهرة" + `jamhara.com` بالأخضر
- [x] `ProfileShareData` interface في `lib/share-card-data.ts` + تعبئة كاملة من `ProfilePostConfig`
- [x] `ShareCard.tsx` — يُفوِّض لـ `ProfileShareCard` تلقائياً عند `data.profileData`
- [x] إصلاح قطع العنوان: حذف `webkit-line-clamp` والاستعاضة بـ `maxHeight + overflow:hidden`
- [x] إصلاح Story layout: `justifyContent: space-between` لتوزيع المحتوى على 1920px كاملاً

**NewsShareCard — بطاقة خبر مخصصة:**
- [x] `components/shared/NewsShareCard.tsx` — مكوّن جديد مخصص لنوع news
- [x] هيدر/فوتر بنفس نمط ProfileShareCard (سلوغن + شعار + "الخبر كاملاً في موقع جمهرة")
- [x] مربع: صورة كاملة العرض + عنوان + لده + نقاط مرقمة + "ما سبب أهميته؟"
- [x] أفقي: صورة يسرى + عنوان + لده + نقاط
- [x] ستوري: صورة + كل التفاصيل (نقاط + أهمية + اقتباس + ما التالي؟)
- [x] إزالة شارة المصدر (SourceBadge) من جميع أحجام البطاقة
- [x] إصلاح قطع العنوان: `Title` بلا `lines` prop — النص يظهر كاملاً
- [x] `newsData?: NewsShareData` في `ShareCardData` + تعبئة في `buildShareCardData`
- [x] حذف `components/news/ShareCard.tsx` و`components/news/ShareCardModal.tsx` (كود ميت)

**إصلاحات عامة:**
- [x] جميع 19 card component تمرر `post={post}` لـ `ShareButton` في `isDetail` mode
- [x] `ShareButton` → `ShareCardModal` → `buildShareCardData(post)` → يُفوِّض للبطاقة المناسبة

---

### جلسة مارس 2026 — المجموعة الحادية عشرة (تعميم بطاقة المشاركة على 19 نوعاً)

**بطاقة المشاركة الموحدة — 19 نوعاً:**
- [x] `lib/share-card-data.ts` — `ShareCardData` interface + `TYPE_META` لـ 19 نوع + `buildShareCardData()` تُحوّل أي `PostWithRelations` لبيانات بطاقة
- [x] `components/shared/ShareCard.tsx` — مكوّن موحّد يستخدم `ShareCardData` (بدل props خاصة بالأخبار)، يعرض `typeEmoji + typeLabel` badge بدل "خبر" فقط
- [x] `components/shared/ShareCardModal.tsx` — يستدعي `buildShareCardData(post)` تلقائياً — يعمل مع كل الأنواع
- [x] `components/shared/ShareButton.tsx` — يقبل `PostWithRelations` — نفس الزر لكل الأنواع
- [x] جميع 19 بطاقة تستورد `ShareButton` من `@/components/shared/ShareButton` وتمرر `post` في `isDetail` mode
- [x] صفحة التفاصيل `app/[locale]/p/[id]/page.tsx` — تمرر `post={p}` لجميع البطاقات
- [x] حذف `components/news/ShareCard.tsx` و `components/news/ShareCardModal.tsx` (كود ميت)

**بيانات كل نوع في `buildShareCardData()`:**
- article: lede (أول 220 حرف)
- news: lede + key_points_ar (3 نقاط)
- ranking: metric_ar + أفضل 5 عناصر (رقم + اسم + قيمة)
- numbers: أبرز 5 إحصاءات (أيقونة + رقم + تسمية)
- scenarios: question_ar + سيناريوهات مع ألوان التفاؤل
- timeline: أبرز 5 أحداث (emoji + سنة + عنوان)
- factcheck: أبرز 4 ادعاءات مع verdict emoji
- profile: tagline + حقائق سريعة + صورة البروفايل
- briefing: bottom_line + 4 نقاط رئيسية
- quotes: topic_ar + 3 اقتباسات (نص + صاحب)
- explainer: intro + 4 أسئلة
- debate: السؤال + موقف A + موقف B + الحكم
- guide: هدف + 4 خطوات (أيقونة + رقم + عنوان)
- network: المركز + 4 عقد (علاقة)
- interview: اسم الضيف + 3 أسئلة
- map: insight + 5 مناطق (علم + قيمة)
- chart: body + أسماء السلاسل
- quiz: 3 أسئلة
- comparison: كيان A مقابل B + المحاور

---

### جلسة مارس 2026 — المجموعة العاشرة (نظام الوسوم SEO + أسلوب Axios للأخبار + بطاقة المشاركة)

**نظام الوسوم (SEO Tags) — 19 نوعاً:**
- [x] `lib/prompts/shared/tags.ts` — `TAGS_INSTRUCTION` مشترك: 5-10 وسوم عربية إلزامية في JSON
- [x] جميع 18 برومبت builder يُنتج `"tags": [...]` في JSON الناتج
- [x] `lib/tags.ts` — `normalizeTags()` + `tagToSlug()` + `slugToTag()` + `tagHref()`
- [x] جميع 19 route handler تستخرج وسوم وتحفظها في `posts.tags`
- [x] `components/shared/JCardShell.tsx` — prop `tags` + rendering كـ `#chips` مع رابط
- [x] `app/globals.css` — `.jcard-tags` + `.jcard-tag` (chip style + hover)
- [x] جميع 19 card component تمرر `tags` لـ JCardShell
- [x] `components/feed/PostCard.tsx` — `tags: post.tags ?? []` في sharedProps
- [x] `app/[locale]/tag/[slug]/page.tsx` — صفحة وسم: `.contains("tags", [tag])` + SEO كامل

**أسلوب Axios Smart Brevity للأخبار:**
- [x] `lib/prompts/types/news.ts` v2.0 — هيكل JSON جديد: `lede_ar` + `why_it_matters_ar` + `key_points_ar[]` + `quote?` + `whats_next_ar?`
- [x] `lib/supabase/types.ts` — توسيع `NewsConfig` بـ 4 حقول Axios + `NewsQuote` interface
- [x] `app/api/generate-news/route.ts` — وضع يدوي (context) + وضع GNews + استخراج og:image + حفظ هيكل Axios في `content_config`
- [x] `app/api/cron/fetch-news/route.ts` — نفس التحديث للكرون التلقائي
- [x] `components/news/NewsCard.tsx` — تصميم Axios في التفاصيل: لده + "ما سبب أهميته؟" (خلفية خضراء) + نقاط مرقمة + blockquote + "ما التالي؟"؛ في Feed: لده + 3 نقاط بنقاط برتقالية

**بطاقة المشاركة الاجتماعية (Share Card) — للخبر:**
- [x] `app/api/image-proxy/route.ts` — proxy لحل CORS على الصور الخارجية
- [x] `components/news/ShareCard.tsx` — بطاقة مشاركة مخصصة (inline styles):
  - 3 قياسات: مربع 1080×1080، أفقي 1200×628 (عمودين)، ستوري 1080×1920
  - هيدر: شعار `/logo.png` (base64 data URL) + سلوغن "قيمة المرء ما يعرفه"
  - محتوى: عنوان + لده + نقاط مرقمة + "ما سبب أهميته؟" (story فقط)
  - فوتر: المصدر + jamhara.com (سطر واحد)
- [x] `components/news/ShareCardModal.tsx` — مودال المعاينة والتحميل:
  - `toDataUrl()` — يُحوّل logo + صورة الخبر لـ base64 (يحل CORS)
  - `buildFontEmbedCSS()` — يستخرج خطوط next/font من stylesheets ويُضمّنها يدوياً (تجاوز bug html-to-image)
  - معاينة مُصغَّرة بـ CSS transform + `pixelRatio: 2` (دقة 2160×2160 للمربع)
  - `skipFonts: true` + `fontEmbedCSS` — الحل الصحيح لـ TypeError في Firefox
- [x] `components/news/NewsCard.tsx` — زر "📸 مشاركة" في صفحة التفاصيل
- [x] `html-to-image@1.11.13` — dependency جديد

**ملاحظات تقنية مهمة:**
- `html-to-image` يتعطل على `@font-face` rules من `next/font` بسبب bug → الحل: `skipFonts: true` + `fontEmbedCSS` مبني يدوياً
- الشعار يجب أن يكون base64 data URL في ShareCard (ليس `/logo.png`) وإلا html-to-image لا يُضمّنه
- `pixelRatio: 2` = 4× البكسل الكلية = جودة مثالية للنشر الاجتماعي

### جلسة مارس 2026 — المجموعة الثالثة عشرة (نظام Puppeteer + تحسينات بطاقات المشاركة)

**نظام Puppeteer Screenshot (معزول تماماً):**
- [x] `puppeteer-service/server.js` — Express + Puppeteer: `POST /screenshot` + `GET /health`
  - Auth: `x-secret` header مقابل `PUPPET_SECRET`
  - `deviceScaleFactor: 2` → دقة 2160×2160 للمربع
  - `waitUntil: "networkidle0"` + 800ms انتظار → خطوط React مكتملة
- [x] `puppeteer-service/Dockerfile` — `node:20-slim` + `chromium` via apt، `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- [x] `puppeteer-service/railway.toml` — builder: DOCKERFILE، healthcheck: `/health`
- [x] `puppeteer-service/package.json` — express + puppeteer v22
- [x] Railway deployment: `https://puppeteer-screenshot.up.railway.app`
- [x] `app/share-preview/[id]/page.tsx` — صفحة نظيفة بلا Header/Sidebar/Footer لـ Puppeteer
  - params: `?size=square|landscape|story&locale=ar|en`
  - `logoSrc` و`imgSrc` كـ URLs مباشرة (Chrome حقيقي يحمّلها بلا مشاكل)
- [x] `components/shared/SharePreviewRenderer.tsx` — "use client" wrapper حول ShareCard بلا ref
- [x] `app/api/share-image/route.ts` — GET → يبني preview URL → POST لـ Railway → يُعيد PNG
  - AbortSignal.timeout(55_000) ← Vercel Hobby = 60s
  - Content-Disposition: attachment → تحميل مباشر
- [x] `components/shared/PuppeteerShareButton.tsx` — زر "🖼️ صورة احترافية" مستقل
  - dropdown بـ 3 أحجام (مربع/أفقي/ستوري) مع أبعاد ودقة مضاعفة
  - يستدعي `/api/share-image` ويُحمّل PNG مباشرة
- [x] `app/[locale]/p/[id]/page.tsx` — `PuppeteerShareButton` مضاف لجميع 19 نوع
- [x] Vercel env vars: `PUPPETEER_SERVICE_URL` + `PUPPET_SECRET` مضبوطان ومنشوران

**تحسينات بطاقات المشاركة (ProfileShareCard + NewsShareCard):**
- [x] `ProfileShareCard`: سلوغن "قيمة المرء ما يعرفه" بدل شارة النوع + شعار جمهرة، فوتر "البروفايل كاملاً في موقع جمهرة"، story layout بـ space-between، landscape panel 400px
- [x] `NewsShareCard`: نفس هيدر/فوتر ProfileShareCard، 3 أحجام بمحتوى Axios Smart Brevity (لده + نقاط + أهمية + اقتباس + ما التالي؟)، إزالة source badge، إصلاح قطع العنوان
- [x] إصلاح `webkit-line-clamp` في Title component — حذف `lines` prop والسماح بالعنوان الكامل

**نظام tags_en — وسوم إنجليزية:**
- [x] DB column `tags_en TEXT[]` مضاف لجدول posts
- [x] `lib/prompts/shared/tags.ts` — `TAGS_INSTRUCTION` يُنتج `tags` (عربي) + `tags_en` (ASCII slugs) معاً
- [x] جميع 19 route تستخرج `tags_en` وتحفظها في DB
- [x] `lib/tags.ts` — `tagHref()` يكتشف ASCII tags ويتخطى encoding
- [x] `JCardShell.tsx` — `tags_en` prop، يعرض `tags_en` في `locale="en"`
- [x] `app/[locale]/tag/[slug]/page.tsx` — يستعلم `tags_en` عند `locale="en"`

**NewsCard ثنائي اللغة:**
- [x] `lib/prompts/types/news.ts` v2.0 — يُنتج هيكل Axios كامل بالعربية والإنجليزية
- [x] `lib/supabase/types.ts` — `NewsConfig` موسّع بـ `_en` fields + `NewsQuote` بـ `text_en/author_en/role_en`
- [x] `NewsCard.tsx` — يختار `_en` fields عند `locale="en"` مع fallback للعربية
- [x] إصلاح الاقتباس: يعرض `text_en/author_en/role_en` في الواجهة الإنجليزية

**الفرق بين النظامَين:**
```
html-to-image (قديم):  يُحوّل DOM → PNG في المتصفح، يحتاج base64 للصور والخطوط، قد يفشل مع CSS vars
Puppeteer (جديد):      Chrome حقيقي على Railway يصوّر /share-preview/[id]، يدعم كل CSS + خطوط + RTL
```

### قيد الانتظار (مقترحات للمستقبل)
- [ ] إعداد cron-job.org لـ /api/cron/fetch-news كل 15 دقيقة
- [ ] إشعارات بريد عند فشل جدولة (Resend/SendGrid)
- [ ] تحسين صفحة المنشور — تصميم أغنى + منشورات مقترحة ذكية
- [ ] Analytics أعمق — أي أنواع المحتوى أكثر قراءة
- [ ] معاينة سريعة في جدول المنشورات بالأدمن
- [ ] فلترة متقدمة في جدول المنشورات (بالنوع)
- [ ] قراءة sources من tool_result blocks مباشرة بدل JSON self-report (دقة أعلى)
- [ ] تطبيق Context Injection (Layer 3) على بقية برومبتات الأنواع (حالياً مُلحق كنص في route فقط)
- [ ] لوحة في Admin لعرض topic_registry مع إمكانية الحذف اليدوي
- [ ] محرر كامل لأنواع المحتوى الأخرى (briefing، quotes، debate...) على غرار ProfileConfigEditor

---

## 21. قائمة التحقق عند إضافة نوع محتوى جديد

عند إضافة نوع `X` جديد، يجب تحديث **10 أماكن**:

```
1. lib/supabase/types.ts         → interface XConfig + ContentConfig union + Post.type
2. app/api/generate-X/route.ts   → route توليد جديد (two-turn pattern إلزامي)
3. components/X/XCard.tsx        → بطاقة العرض (JCardShell + fade pattern)
4. components/feed/PostCard.tsx  → import + dispatch
5. app/[locale]/p/[id]/page.tsx  → import + newTypes array + CardComponent ternary
6. components/admin/GeneratePageClient.tsx → template في TEMPLATES + count في GROUPS
7. app/api/admin/generate/route.ts → ALLOWED_APIS
8. app/api/cron/scheduler/route.ts → TYPE_API
9. components/layout/RightPanel.tsx → أضف slug في CAT_SVG map (نمط NavIcon)
10. Supabase DB → ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (...)
```

---

## 22. نظام منع التكرار — Deduplication (3 طبقات)

### البنية العامة
```
توليد منشور جديد
    │
    ├── Layer 1 (Scheduler): pickDiverseCombinations()
    │     ← يختار category+type الأقل استخداماً حديثاً
    │
    ├── Layer 2a (قبل التوليد): checkTopicDuplicate()
    │     ← إذا topic صريح → فحص trigram في topic_registry
    │     ← إذا isDuplicate → HTTP 409 + تفاصيل المنشور المشابه
    │
    ├── Layer 3 (في البرومبت): getRecentTopics() → recentTopics[]
    │     ← يُحقن في جميع 18 route كـ recentTopicsBlock يُلحق بنهاية البرومبت
    │     ← buildArticlePrompt و buildProfilePrompt يدعمانه داخلياً
    │     ← باقي الـ 16 نوع: يُلحق recentTopicsBlock بعد buildXPrompt() في الـ route مباشرة
    │
    └── Layer 2b (بعد الحفظ): registerTopic()
          ← يُسجّل title_ar في topic_registry دائماً
```

### المكتبة: `lib/dedup/index.ts`
```typescript
checkTopicDuplicate(topic, postType, categorySlug?)  → DuplicateCheckResult
registerTopic(topic, postType, categorySlug, postId?)
getRecentTopics(categorySlug, postType, limit?, daysBack?) → string[]
pickDiverseCombinations(slugs, types, count)          → {categorySlug, postType}[]
```

### قاعدة البيانات: `topic_registry`
```sql
id, topic_normalized TEXT, topic_original TEXT,
post_type TEXT, category_slug TEXT,
post_id UUID REFERENCES posts(id),
generated_at TIMESTAMPTZ

-- GIN index على topic_normalized gin_trgm_ops
-- normalize_arabic_text(TEXT) — يُطبَّق قبل المقارنة
-- check_topic_duplicate() RPC — فحص مع دعم p_days_back + p_threshold
```

### إعدادات مهمة في `lib/dedup/index.ts`
```typescript
COOLDOWN_DAYS   — كم يوم cooldown لكل نوع (7-30 يوم)
SIMILARITY_THRESHOLD — عتبة التشابه لكل نوع (0.30-0.40)
// أرقام أصغر = أكثر حساسية للتكرار
```

### مبدأ Fail Open
كل استدعاء لـ dedup مُغلَّف بـ try/catch ويُعيد false عند الخطأ.
**خطأ في dedup لا يوقف التوليد أبداً.**

## 23. نقاط الاستعادة (Restore Points)

### كيفية العودة إلى نقطة استعادة
```bash
# عرض كل نقاط الاستعادة
git log --oneline | grep "restore-point"

# العودة لملف محدد من نقطة استعادة
git checkout ae79f0e -- app/[locale]/page.tsx

# العودة الكاملة (خطير — يحذف التغييرات الحالية)
git reset --hard ae79f0e
```

### نقاط الاستعادة المتاحة

| الـ hash | التاريخ | الوصف |
|---|---|---|
| `ae79f0e` | مارس 2026 | **قبل إعادة التصميم الكبرى** — 7 مجموعات كاملة |
| `76b219d` | مارس 2026 | **المجموعة الثامنة** — dedup كامل + محرر البروفايل + برومبت v2.1 |
| `a193e3c` | مارس 2026 | **المجموعة التاسعة** — ميزة الأخبار الكاملة (GNews + NewsCard + /news page) |
| `a4ebda5` | مارس 2026 | **المجموعة العاشرة** — SEO Tags (19 نوع) + Axios Smart Brevity + Share Card للأخبار |
| `3f33b44` | مارس 2026 | **المجموعة الثانية عشرة** — ProfileShareCard + NewsShareCard مخصصتان + إصلاح العنوان |
| `ec26334` | مارس 2026 | **المجموعة الثالثة عشرة** — Puppeteer على Railway + tags_en + NewsCard ثنائي اللغة |

### محتوى `ae79f0e`
- 18 نوع محتوى، 43 قالب، جميع الـ routes والمكونات
- نظام الجدولة الديناميكية الكامل
- نظام منع التكرار (3 طبقات: topic_registry + pg_trgm)
- HomeHero، صفحة our-dna، برومبت المقالة v3.0
- lib/dedup، lib/ai-config، lib/json-utils، lib/prompts

---

## 24. ملفات التوثيق

- `CLAUDE.md` — هذا الملف (للذكاء الاصطناعي)
- `DOCS.md` — توثيق للمشروع (للبشر)
- `/admin/diagnostics` — فحص صحة المشروع في الإنتاج (20+ فحص)
- `~/.claude/projects/memory/` — ذاكرة الجلسات (project_state، feedback، user_profile)

---

*آخر تحديث: مارس 2026 — المجموعة الثالثة عشرة: نظام Puppeteer على Railway (معزول) + tags_en (19 نوع) + NewsCard ثنائي اللغة + ProfileShareCard/NewsShareCard مع هيدر/فوتر موحّد*
