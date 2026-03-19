# جمهرة — توثيق المشروع الكامل
**Jamhara Platform — Full Technical Documentation**

> سلوغن: *قيمة المرء ما يعرفه*
> آخر تحديث: مارس 2026

---

## جدول المحتويات

1. [نظرة عامة](#1-نظرة-عامة)
2. [التقنيات المستخدمة](#2-التقنيات-المستخدمة)
3. [هيكل المشروع](#3-هيكل-المشروع)
4. [قاعدة البيانات Supabase](#4-قاعدة-البيانات-supabase)
5. [أنواع المحتوى التسعة](#5-أنواع-المحتوى-التسعة)
6. [واجهة برمجة التطبيقات API Routes](#6-واجهة-برمجة-التطبيقات-api-routes)
7. [المكوّنات Components](#7-المكوّنات-components)
8. [الصفحات Pages](#8-الصفحات-pages)
9. [لوحة الإدارة Admin Panel](#9-لوحة-الإدارة-admin-panel)
10. [نظام التصميم Design System](#10-نظام-التصميم-design-system)
11. [الخطوط والطباعة](#11-الخطوط-والطباعة)
12. [الترجمة والتوطين i18n](#12-الترجمة-والتوطين-i18n)
13. [نظام التوليد بالذكاء الاصطناعي](#13-نظام-التوليد-بالذكاء-الاصطناعي)
14. [متغيرات البيئة](#14-متغيرات-البيئة)
15. [النشر والإنتاج](#15-النشر-والإنتاج)
16. [المهام المستقبلية](#16-المهام-المستقبلية)
17. [ملحق — TypeScript Types الكاملة](#17-ملحق--typescript-types-الكاملة)

---

## 1. نظرة عامة

**جمهرة** منصة معرفية عربية تُقدّم محتوى موثوقاً ومنظّماً في العلوم والثقافة والفكر. تعتمد على نماذج الذكاء الاصطناعي لتوليد المحتوى تلقائياً، وتُقدّمه في قوالب بصرية متنوعة تشمل المقالات، والمخططات، والاختبارات التفاعلية، والمقارنات، والتسلسلات الزمنية وغيرها.

- **الموقع:** https://jamhara.vercel.app
- **اللغات:** العربية (الافتراضية) · الإنجليزية (`/en/`)
- **عنوان المتصفح:** جمهرة - قيمة المرء ما يعرفه
- **الجمهور:** قرّاء عرب مهتمون بالمعرفة المنظّمة

---

## 2. التقنيات المستخدمة

| التقنية | الإصدار | الغرض |
|---|---|---|
| Next.js | ^15.5.13 | إطار العمل الرئيسي (App Router) |
| TypeScript | ^5 | لغة البرمجة |
| Supabase | ^2.49.1 | قاعدة البيانات PostgreSQL + Auth + Storage |
| @anthropic-ai/sdk | ^0.79.0 | توليد المحتوى بالذكاء الاصطناعي |
| next-intl | ^3.26.3 | الترجمة وتعدد اللغات |
| Recharts | ^3.8.0 | المخططات البيانية التفاعلية |
| Tailwind CSS | ^3.4.1 | أدوات CSS المساعدة |
| Vercel | — | منصة النشر والاستضافة |

---

## 3. هيكل المشروع

```
jamhara/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, metadata, viewport
│   ├── globals.css                 # Design system, CSS variables, all classes
│   ├── [locale]/
│   │   ├── layout.tsx              # Locale layout: intl provider, dir RTL/LTR
│   │   ├── page.tsx                # الرئيسية — latest posts feed
│   │   ├── [category]/page.tsx     # Category feed page
│   │   ├── p/[id]/page.tsx         # Post detail page (all 9 content types)
│   │   ├── search/page.tsx         # Search results with pagination
│   │   ├── sections/page.tsx       # All categories overview grid
│   │   ├── most-read/page.tsx      # Most viewed posts
│   │   ├── about/page.tsx          # Static: من نحن
│   │   ├── contact/page.tsx        # Static: اتصل بنا
│   │   ├── terms/page.tsx          # Static: شروط الخدمة
│   │   ├── privacy/page.tsx        # Static: الخصوصية
│   │   └── cookies/page.tsx        # Static: سياسة الكوكيز
│   ├── admin/
│   │   └── page.tsx                # Admin panel (no auth — restrict IP on Vercel)
│   └── api/
│       ├── generate/route.ts           # POST — article generation
│       ├── generate-chart/route.ts     # POST — chart/visualization
│       ├── generate-quiz/route.ts      # POST — quiz (6 types)
│       ├── generate-comparison/route.ts# POST — comparison (6 types)
│       ├── generate-ranking/route.ts   # POST — ranking list
│       ├── generate-numbers/route.ts   # POST — statistics post
│       ├── generate-scenarios/route.ts # POST — future scenarios
│       ├── generate-timeline/route.ts  # POST — historical timeline
│       ├── generate-factcheck/route.ts # POST — fact-check
│       └── search/route.ts             # GET  — full-text search
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Topbar + logo + search icon + lang switcher
│   │   ├── Sidebar.tsx         # Left sidebar: browse + categories
│   │   ├── RightPanel.tsx      # Right panel: stats + most-read + latest
│   │   ├── Footer.tsx          # Footer: brand + quick links + legal
│   │   ├── MobileNav.tsx       # Bottom mobile navigation bar
│   │   └── CategoryNav.tsx     # Horizontal category tabs strip
│   ├── feed/
│   │   ├── PostCard.tsx            # Universal post dispatcher (all 9 types)
│   │   └── PostDetailActions.tsx   # Like / Share on detail page
│   ├── search/
│   │   └── SearchModal.tsx         # Full-screen overlay with blur + debounce
│   ├── charts/
│   │   ├── ChartCard.tsx           # Chart post wrapper
│   │   └── ChartRenderer.tsx       # Recharts renderer
│   ├── quiz/
│   │   ├── QuizCard.tsx            # Quiz container with progress + score
│   │   └── renderers/
│   │       ├── MCQRenderer.tsx
│   │       ├── TrueFalseRenderer.tsx
│   │       ├── TimelineRenderer.tsx
│   │       ├── MatchingRenderer.tsx
│   │       ├── GuessWhoRenderer.tsx
│   │       └── SpeedRenderer.tsx
│   ├── comparison/
│   │   ├── ComparisonCard.tsx
│   │   └── renderers/
│   │       ├── BarsRenderer.tsx
│   │       ├── MatrixRenderer.tsx
│   │       ├── ProfileRenderer.tsx
│   │       ├── TimelineDuelRenderer.tsx
│   │       ├── StanceRenderer.tsx
│   │       └── SpectrumRenderer.tsx
│   ├── ranking/RankingCard.tsx
│   ├── numbers/NumbersCard.tsx
│   ├── scenarios/ScenariosCard.tsx
│   ├── timeline/TimelineCard.tsx
│   └── factcheck/FactCheckCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client (SSR cookies)
│   │   └── types.ts            # All TypeScript types & interfaces
│   └── utils.ts                # fmt, getSessionId, timeAgo, postUrl, categoryUrl
├── i18n/
│   ├── routing.ts              # Locale config
│   └── request.ts              # next-intl server setup
├── messages/
│   ├── ar.json                 # Arabic translations
│   └── en.json                 # English translations
├── middleware.ts               # next-intl locale routing
├── next.config.ts              # Next.js + next-intl plugin + image domains
├── tailwind.config.ts          # Tailwind (preflight disabled)
├── tsconfig.json               # TypeScript strict + @/* alias
├── supabase/migrations/
│   ├── 001_schema.sql          # Core tables, RLS, triggers, extensions
│   └── 002_seed_categories.sql # 24 main + ~120 subcategories
└── public/
    └── logo.png                # Site logo (also used as favicon)
```

---

## 4. قاعدة البيانات Supabase

**Project ID:** `kzxphzobrkgqqshxzvjr` | **Region:** eu-central-1

### الجداول

#### `categories`
| العمود | النوع | الوصف |
|---|---|---|
| id | uuid PK | المعرّف |
| name_ar | text | الاسم بالعربية |
| name_en | text | الاسم بالإنجليزية |
| slug | text UNIQUE | الرابط المختصر |
| parent_id | uuid FK→categories | null = تصنيف رئيسي |
| color | text | لون التصنيف (hex) |
| icon | text | أيقونة |
| post_count | int | عدد المنشورات (auto-updated بـ trigger) |
| is_active | bool | نشط/معطّل |
| sort_order | int | ترتيب العرض |

#### `posts`
| العمود | النوع | الوصف |
|---|---|---|
| id | uuid PK | المعرّف |
| title_ar | text | العنوان العربي |
| title_en | text | العنوان الإنجليزي |
| body_ar | text | المحتوى العربي |
| body_en | text | المحتوى الإنجليزي |
| slug | text | الرابط المختصر |
| category_id | uuid FK | التصنيف الرئيسي |
| subcategory_id | uuid FK | التصنيف الفرعي |
| source_id | uuid FK | المصدر |
| image_url | text | رابط الصورة |
| status | enum | `draft` / `published` / `flagged` |
| **type** | enum | **9 أنواع** — انظر §5 |
| quality_score | int | درجة الجودة (0-100) |
| like_count | int | عدد الإعجابات |
| share_count | int | عدد المشاركات |
| view_count | int | عدد المشاهدات |
| reading_time | int | وقت القراءة (دقائق) |
| is_featured | bool | منشور مميز |
| **chart_config** | jsonb | إعدادات المخطط البياني |
| **quiz_config** | jsonb | إعدادات الاختبار |
| **comparison_config** | jsonb | إعدادات المقارنة |
| **content_config** | jsonb | ranking / numbers / scenarios / timeline / factcheck |
| hash_fingerprint | text | بصمة لمنع التكرار |
| search_vector | tsvector | فهرس البحث النصي (auto) |
| published_at | timestamptz | تاريخ النشر |
| created_at | timestamptz | تاريخ الإنشاء |

#### `post_interactions`
```sql
(post_id, session_id, action) UNIQUE
action: 'like' | 'share' | 'view'
```

#### `generation_jobs`
```
id, category_id, status: pending|running|done|failed
posts_generated, quality_passed, quality_failed
cost_usd, error_message, created_at, completed_at
```

#### `sources`
```
name, domain, badge_letter, badge_color, reliability_score, language
```

#### `generation_prompts`
```
category_id, prompt_text, version, performance_score, is_active
```

### Triggers
```sql
-- تحديث فهرس البحث تلقائياً عند النشر
update_post_search_vector() → ON posts INSERT/UPDATE

-- تحديث عداد المنشورات في التصنيف تلقائياً
update_category_post_count() → ON posts INSERT/UPDATE/DELETE
```

### سياسات RLS
| الجدول | السياسة |
|---|---|
| posts | قراءة عامة للمنشورات المنشورة فقط |
| categories / sources | قراءة عامة للعناصر النشطة |
| post_interactions | كتابة وقراءة مجهولة (anonymous) |
| generation_jobs / prompts | service_role فقط |

---

## 5. أنواع المحتوى التسعة

يُخزَّن النوع في `posts.type` — يُفرَّق في `PostCard.tsx` و`p/[id]/page.tsx`.

### 1. `article` — مقال
- **البيانات:** `body_ar`, `body_en`, `image_url`
- **القالب:** بطاقة مع صورة + عنوان + مقتطف + أزرار

### 2. `chart` — مخطط بياني
- **البيانات:** `chart_config: ChartConfig`
- **الأنواع الفرعية:** `line | bar | area | pie | donut | scatter | radar | composed`
- **القالب:** `ChartCard` → `ChartRenderer` (Recharts)

### 3. `quiz` — اختبار تفاعلي
- **البيانات:** `quiz_config: QuizConfig`
- **الأنواع الفرعية:**

| النوع | الوصف |
|---|---|
| `mcq` | اختيار من متعدد (4 خيارات) |
| `true_false` | صواب أو خطأ |
| `timeline` | رتّب الأحداث الزمنياً |
| `matching` | طابق الأزواج |
| `guess_who` | من أنا؟ (تلميحات تدريجية) |
| `speed` | سباق الوقت (مؤقت 15 ثانية) |

- **القالب:** `QuizCard` → يختار الـ Renderer المناسب تلقائياً

### 4. `comparison` — مقارنة
- **البيانات:** `comparison_config: ComparisonConfig`
- **الأنواع الفرعية:**

| النوع | الوصف |
|---|---|
| `bars` | أشرطة مزدوجة متوازية |
| `matrix` | مصفوفة ✓/✗/◐ |
| `profile` | بطاقات ملف شخصي مقارن |
| `timeline_duel` | خط زمني مزدوج (Recharts LineChart) |
| `stance` | مواقف وآراء نصية |
| `spectrum` | طيف ومقياس (نقاط متحركة) |

- **ملاحظة:** "مقابل" بدلاً من "VS" — بلا فائز

### 5. `ranking` — ترتيب وتصنيف
- **البيانات:** `content_config: RankingConfig`
- **القالب:** `RankingCard` — أول 3: ذهبي/فضي/برونزي
- **العرض:** أول 10 في الفيد، الكل في صفحة المنشور

### 6. `numbers` — بالأرقام
- **البيانات:** `content_config: NumbersConfig`
- **القالب:** `NumbersCard` — شبكة أرقام كبيرة بألوان دوّارة

### 7. `scenarios` — سيناريوهات
- **البيانات:** `content_config: ScenariosConfig`
- **القالب:** `ScenariosCard` — 3 بطاقات: أخضر/أزرق/أحمر
- **قاعدة:** دائماً 3 سيناريوهات (متفائل/واقعي/متشائم)

### 8. `timeline` — خط زمني
- **البيانات:** `content_config: TimelinePostConfig`
- **القالب:** `TimelineCard` — خط عمودي 2px مع ألوان حسب النوع
- **أنواع الأحداث:** `milestone(ذهبي) | crisis(أحمر) | innovation(أخضر) | discovery(أزرق) | default(رمادي)`
- **العرض:** أول 6 في الفيد، الكل في صفحة المنشور

### 9. `factcheck` — تحقق من الحقيقة
- **البيانات:** `content_config: FactCheckConfig`
- **القالب:** `FactCheckCard` — ادعاء + حكم ملوّن
- **الأحكام:** `true(أخضر) | false(أحمر) | misleading(برتقالي) | partial(أزرق) | unverified(رمادي)`

---

## 6. واجهة برمجة التطبيقات API Routes

### نمط التحقق من الهوية (مشترك لكل الـ routes)
```typescript
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.GENERATE_SECRET?.trim();
  if (!secret) return true; // dev mode: open
  const auth = (req.headers.get("authorization") ??
    req.nextUrl.searchParams.get("secret") ?? "").trim();
  return auth === secret || auth === `Bearer ${secret}`;
}
```

---

### `POST /api/generate` — مقال
**الطلب:**
```json
{ "category_slug": "philosophy", "subcategory_slug": "ethics" }
```
**العملية:**
1. Claude Haiku → مقال عربي + إنجليزي
2. فحص الجودة (quality_score ≥ 60)
3. فحص التكرار (hash_fingerprint)
4. توليد صورة بـ Replicate Flux Schnell
5. حفظ في Supabase

**الاستجابة:**
```json
{ "success": true, "post": {...}, "image_generated": true }
```

---

### `POST /api/generate-chart` — مخطط
**الطلب:** `{ "topic": "تطور التضخم", "category_slug": "economics" }`

Claude + web_search → `ChartConfig`:
```typescript
{
  chartType: "line"|"bar"|"area"|"pie"|"donut"|"scatter"|"radar"|"composed";
  title_ar: string; title_en: string;
  series: { name_ar, name_en, color, seriesType, data: {x,y}[] }[];
  xAxis?: { key, label_ar, label_en };
  yAxis?: { label_ar, label_en, unit };
  annotations?: { x, label, color }[];
  stats?: { label_ar, label_en, value, unit }[];
  source: string; sourceUrl: string;
}
```

---

### `POST /api/generate-quiz` — اختبار
**الطلب:**
```json
{
  "topic": "الفلاسفة اليونانيون",
  "category_slug": "philosophy",
  "difficulty": "medium",
  "quiz_type": "mcq"
}
```

أنواع وهياكل بيانات الأسئلة:
```typescript
MCQ:         { question_ar/en, options_ar/en[4], correct_index, explanation_ar/en }
TrueFalse:   { statement_ar/en, is_true, explanation_ar/en }
Timeline:    { instruction_ar/en, events: [{id, text_ar/en, correct_order}] }
Matching:    { instruction_ar/en, pairs: [{id, left_ar/en, right_ar/en}] }
GuessWho:    { hints_ar/en[4], options_ar/en[4], correct_index, explanation_ar/en }
Speed:       { question_ar/en, options_ar/en[4], correct_index, time_limit:15, explanation_ar/en }
```

---

### `POST /api/generate-comparison` — مقارنة
**الطلب:**
```json
{ "topic": "الاشتراكية مقابل الرأسمالية", "category_slug": "economics", "comparison_type": "bars" }
```

```typescript
ComparisonConfig {
  comparison_type: "bars"|"matrix"|"profile"|"timeline_duel"|"stance"|"spectrum";
  title_ar/en: string;
  entity_a: { name_ar/en, emoji, color, summary_ar/en };
  entity_b: { ... };
  // حسب النوع:
  dimensions?:   [{ name_ar/en, score_a, score_b, note_ar/en }]  // bars
  features?:     [{ name_ar/en, value_a, value_b, note_ar/en }]  // matrix
  data_points?:  [{ year, value_a, value_b }]                    // timeline_duel
  topics?:       [{ topic_ar/en, stance_a/b_ar/en }]             // stance
  axes?:         [{ name_ar/en, min/max_label, position_a/b }]   // spectrum
}
```

---

### `POST /api/generate-ranking` — ترتيب
**الطلب:** `{ "topic": "أعظم العلماء العرب", "category_slug": "history" }`
```typescript
RankingConfig {
  metric_ar/en: string;
  items: [{ rank, name_ar/en, value, unit_ar/en, note_ar/en, emoji, change: "up"|"down"|"same" }];
  source, sourceUrl;
}
```

---

### `POST /api/generate-numbers` — أرقام
**الطلب:** `{ "topic": "أرقام مذهلة عن الكون", "category_slug": "space" }`
```typescript
NumbersConfig {
  stats: [{ number, label_ar/en, context_ar/en, icon, color }];
  source, sourceUrl;
}
```

---

### `POST /api/generate-scenarios` — سيناريوهات
**الطلب:** `{ "topic": "مستقبل الذكاء الاصطناعي", "category_slug": "ai" }`
```typescript
ScenariosConfig {
  question_ar/en: string;
  horizon_ar/en: string; // "خلال 10 سنوات"
  scenarios: [  // دائماً 3 بالضبط
    { tone: "optimistic", title_ar/en, probability, conditions_ar/en[], outcome_ar/en },
    { tone: "realistic",  ... },
    { tone: "pessimistic", ... },
  ];
}
```

---

### `POST /api/generate-timeline` — خط زمني
**الطلب:** `{ "topic": "تاريخ الإمبراطورية العثمانية", "category_slug": "history" }`
```typescript
TimelinePostConfig {
  events: [{ year, title_ar/en, description_ar/en,
             type: "milestone"|"crisis"|"innovation"|"discovery"|"default",
             emoji }]; // 8-15 حدث
  source, sourceUrl;
}
```

---

### `POST /api/generate-factcheck` — تحقق
**الطلب:** `{ "topic": "خرافات شائعة عن الصحة", "category_slug": "medicine" }`
```typescript
FactCheckConfig {
  claims: [{ claim_ar/en,
             verdict: "true"|"false"|"misleading"|"partial"|"unverified",
             explanation_ar/en, sources: string[] }]; // 4-8 ادعاءات
}
```

---

### `GET /api/search` — بحث
**المعاملات:** `?q=الفلسفة&locale=ar&limit=8`

- بحث `ilike` في: `title_ar`, `title_en`, `body_ar`, `body_en`
- يُجرَّد HTML من مقتطف النص
- **الاستجابة:**
```typescript
{ results: [{ id, title, body_excerpt, type, category_name, category_slug, category_color }] }
```

---

## 7. المكوّنات Components

### `Header.tsx`
```
┌─────────────────────────────────────────────────────────────┐
│ Topbar (36px, أخضر)                                         │
│  قيمة المرء ما يعرفه  ←────────────────  من نحن | اتصل بنا│
├─────────────────────────────────────────────────────────────┤
│ Header (72px, نيفي)                                         │
│  [شعار 68px]                    [🔍]  [EN]                  │
└─────────────────────────────────────────────────────────────┘
```
- شعار 68px — fallback نصي إذا فشل تحميل الصورة
- أيقونة بحث → `<SearchModal>` (useState: open/close)
- مبدّل اللغة: `AR ↔ EN`
- `position: sticky; top: 0; z-index: 200`

---

### `Sidebar.tsx`
```
تصفح
├── 🏠 الرئيسية           → /
├── ⊞  كل التصنيفات       → /sections
├── 📊 الأكثر قراءة       → /most-read  ● (نقطة حمراء)
├── ✓  العاب واختبارات    → /search?type=quiz
├── ◉  مخططات             → /search?type=chart
├── ⇄  مقارنات            → /search?type=comparison
└── ↗  تفاعلي             → /search?type=interactive
──────────────────────────
التصنيفات
├── فلسفة / Philosophy
├── أديان / Religions
└── ... (24 قسم رئيسي)
```
- **الأيقونات:** SVG 19×19 `fill="currentColor"` — `opacity: .7`
- **الخط:** `.93rem` / `font-weight: 500`
- **Active:** خلفية `--green-light` + لون `--green-deep`
- **`isContentTypeActive`:** يفحص `pathname` فقط (بدون `window.location.search` في SSR)

---

### `RightPanel.tsx`
Server Component — `async` — 5 استعلامات متوازية:
```typescript
Promise.all([postCount, catCount, jobCount, topPosts(5), recentPosts(3)])
```

**الصناديق:**
| الصندوق | الأيقونة | البيانات |
|---|---|---|
| إحصائيات جمهرة | أعمدة بيانية (أخضر) | منشورات / أقسام / جلسات / تخصصات |
| الأكثر قراءة | سهم صاعد (أخضر) | أعلى 5 بـ `view_count` + دوائر ملوّنة |
| أحدث المنشورات | ساعة (أخضر) | آخر 3 + أيقونة نوع SVG + `timeAgo` |

**ألوان الترتيب:** أحمر → برتقالي → ذهبي → أخضر → أزرق

---

### `Footer.tsx`
```
┌─────────────────────────────────────────────────────────────┐
│ [شعار أبيض]   روابط سريعة        قانوني                    │
│ نبذة تعريفية  ─ الرئيسية         ─ شروط الخدمة             │
│ قيمة المرء    ─ الأكثر قراءة     ─ الخصوصية               │
│ ما يعرفه      ─ من نحن           ─ الكوكيز                 │
│               ─ اتصل بنا                                    │
├─────────────────────────────────────────────────────────────┤
│ © 2026 جمهرة                          مُحدَّث يوميًا ⏰     │
└─────────────────────────────────────────────────────────────┘
```
- الشعار: `filter: brightness(0) invert(1)` (أبيض)
- تخطيط: `grid-template-columns: 1fr auto auto`
- النبذة: "منصة معرفية عربية توفر محتوى موثوقاً ومنظماً في العلوم والثقافة والفكر"

---

### `SearchModal.tsx`
- backdrop: `backdrop-filter: blur(6px)` + `rgba(0,0,0,0.55)`
- debounce: 300ms — حد أدنى حرفان
- skeleton: 3 صفوف shimmer أثناء التحميل
- النتائج: أيقونة SVG دائرية + عنوان + مقتطف + شارة التصنيف + نوع
- إغلاق: `Escape` + نقر الخلفية
- scroll lock على `body` عند الفتح

---

### `PostCard.tsx`
Universal dispatcher:
```typescript
const cc = (post as any).content_config;

if (post.type === "chart"      && post.chart_config)      → ChartCard
if (post.type === "quiz"       && post.quiz_config)       → QuizCard
if (post.type === "comparison" && post.comparison_config) → ComparisonCard
if (post.type === "ranking"    && cc) → RankingCard
if (post.type === "numbers"    && cc) → NumbersCard
if (post.type === "scenarios"  && cc) → ScenariosCard
if (post.type === "timeline"   && cc) → TimelineCard
if (post.type === "factcheck"  && cc) → FactCheckCard
// default → article card
```

**الخصائص المشتركة (sharedProps):**
```typescript
{ id, title, body, categoryName, categorySlug, categoryColor,
  likeCount, publishedAt, locale, timeAgoStr, isDetail }
```

**التفاعلات:**
- إعجاب / مشاركة → `post_interactions` عبر Supabase
- `fireBurst()` — رسوم متحركة عند الإعجاب
- session UUID مخزّن في `localStorage`

---

## 8. الصفحات Pages

### `/` — الرئيسية
```typescript
export const revalidate = 3600;
// أحدث 20 منشوراً — published_at DESC
// بدون ترويسة "أحدث المنشورات"
```

### `/[category]` — صفحة التصنيف
- جلب منشورات التصنيف + التصنيفات الفرعية كـ tabs
- Breadcrumb: الرئيسية → التصنيف

### `/p/[id]` — صفحة المنشور
```typescript
export const revalidate = 300; // 5 دقائق
```
- تحديث `view_count++` عند كل زيارة (non-blocking)
- **صندوق التحليلات:** مشاهدات + إعجابات + مشاركات + وقت قراءة + تاريخ+وقت النشر
- تاريخ النشر: يظهر **فقط** في صفحة المنشور (لا في الفيد)
- منشورات ذات صلة (نفس التصنيف)
- يُعرض بـ `isDetail=true` — يُفعّل إظهار كل البيانات

### `/search` — البحث
```typescript
export const revalidate = 0;
// 12 نتيجة لكل صفحة — .range(from, to)
```
- ترقيم صفحات رقمي
- حالة فارغة مع اقتراحات
- حالة بدون استعلام (idle)

### `/sections` — كل التصنيفات
```typescript
export const revalidate = 3600;
```
- شبكة بطاقات: `repeat(auto-fill, minmax(300px, 1fr))`
- كل بطاقة: لون + اسم + عداد + التصنيفات الفرعية كـ tags

### `/most-read` — الأكثر قراءة
```typescript
export const revalidate = 600;
// أعلى 30 — view_count DESC
```

### الصفحات الثابتة (Static)
`/about` · `/contact` · `/terms` · `/privacy` · `/cookies`
- بدون Sidebar/RightPanel (تخطيط مبسّط)

---

## 9. لوحة الإدارة Admin Panel

**المسار:** `/admin` — بدون حماية (يُوصى بـ IP restriction على Vercel)

### الأقسام

| القسم | الـ API | الوصف |
|---|---|---|
| مولّد المقالات | `POST /api/generate` | مقال عربي + إنجليزي + صورة |
| مولّد المحتوى | `POST /api/generate-{type}` | ranking/numbers/scenarios/timeline/factcheck |
| مولّد المخططات | `POST /api/generate-chart` | مخطط Recharts |
| مولّد الاختبارات | `POST /api/generate-quiz` | 6 أنواع + 3 مستويات صعوبة |
| مولّد المقارنات | `POST /api/generate-comparison` | 6 أنواع |
| إحصائيات سريعة | — | منشورات / أقسام / جلسات |
| سجل النشاط | — | آخر 50 عملية بالوقت والنتيجة |

### اختيار نوع المقارنة (شبكة 3×2)
```
[ أعمدة  ] [ مصفوفة ] [ ملف شخصي ]
[ خط زمني] [ مواقف  ] [ طيف       ]
```

---

## 10. نظام التصميم Design System

### متغيرات CSS

```css
:root {
  /* ألوان العلامة التجارية */
  --green:       #4CB36C;   /* اللون الأساسي — زر، أيقونات نشطة */
  --green-dark:  #3A9558;
  --green-deep:  #2D7A46;
  --green-light: #E8F6ED;   /* خلفية العناصر النشطة */
  --green-pale:  #F2FAF5;
  --navy:        #373C55;   /* هيدر + فوتر */
  --navy2:       #2F3348;

  /* الخلفيات */
  --slate:   #DBE3EA;   /* حدود */
  --slate2:  #CDD6DF;   /* حدود داكنة */
  --slate3:  #EDF1F5;   /* خلفيات خفيفة */
  --white:   #FFFFFF;

  /* النصوص */
  --ink:    #1E2130;   /* الرئيسي */
  --ink2:   #3A3F52;   /* الثانوي */
  --muted:  #6B7280;   /* خافت */
  --muted2: #9CA3AF;   /* خافت جداً */

  /* تمييز */
  --rust: #E05A2B;     /* تحذيرات، أخطاء */
}
```

### تخطيط الصفحة (Desktop)

```
┌────────────────────────────────────────────────────────────┐
│ Topbar 36px (أخضر)                                         │
├────────────────────────────────────────────────────────────┤
│ Header 72px (نيفي) [sticky, z:200]                         │
├───────────┬────────────────────────────┬───────────────────┤
│  Sidebar  │      Main Content          │   Right Panel     │
│   210px   │   minmax(0, 660px)         │     250px         │
│  [sticky, │                            │   [sticky,        │
│  top:108] │                            │    top:108]       │
├───────────┴────────────────────────────┴───────────────────┤
│ Footer (نيفي، 3 أعمدة)                                     │
└────────────────────────────────────────────────────────────┘
```

```css
.page {
  display: grid;
  grid-template-columns: 210px minmax(0, 660px) 250px;
  max-width: 1180px;
  gap: clamp(.5rem, 1.5vw, 1.25rem);
}
.sidebar, .rpanel { top: 108px; } /* 72px header + 36px topbar */
```

### نقاط التوقف Breakpoints

| العرض | التأثير |
|---|---|
| ≤ 1180px | حد عرض المحتوى |
| ≤ 1100px | تضغّط السايدبار |
| ≤ 960px | إخفاء sidebar + rpanel (tablet) |
| ≤ 640px | إخفاء topbar-links، هيدر 56px |
| ≤ 380px | شعار 30px |

### فئات CSS الرئيسية

```
Layout:    .page-shell .page .sidebar .rpanel
Header:    .topbar .topbar-inner .topbar-slogan .topbar-links
           .hdr .hdr-inner .hdr-logo .hdr-right .hdr-lang
Nav:       .nav-item .nav-section .nav-divider .nav-count
Cards:     .rcard .rcard-title .stats-grid .stat-box .stat-num .stat-lbl
Feed:      .feed .feed-hdr .post .post-img-wrap .post-title .post-text
Actions:   .post-actions .act-btn
Footer:    .footer-link .footer-section-title .footer-copy
Search:    .skeleton (shimmer animation)
Mobile:    .mobile-nav .mnav-item
Utility:   .sr-only .toast
```

---

## 11. الخطوط والطباعة

### الخطوط المُحمَّلة (next/font/google)

```typescript
Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
});

IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm",
  display: "swap",
});
```

### قواعد الاستخدام

```css
/* كل النصوص الأساسية — IBM Plex Sans Arabic Light */
body, p, span, li, td, th, .post-body {
  font-family: var(--font-ibm), 'IBM Plex Sans Arabic', sans-serif;
  font-weight: 300;
}

/* عناوين المحتوى فقط — Cairo Bold */
h1, h2, h3, h4, h5, h6,
.post-title, .card-title, .rcard-title {
  font-family: var(--font-cairo), 'Cairo', sans-serif;
  font-weight: 700;
}
```

---

## 12. الترجمة والتوطين i18n

### الإعداد
```typescript
// i18n/routing.ts
{
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed"
  // ar → /      (بدون بادئة)
  // en → /en/
}
```

### مفاتيح الترجمة
```json
{
  "site":     { "name", "tagline", "description" },
  "nav":      { "home", "latest", "popular", "categories", "search" },
  "post":     { "like", "share", "copied", "readMore", "source", "relatedPosts" },
  "feed":     { "empty", "loading" },
  "category": { "posts", "allPosts" }
}
```

### الاتجاه RTL/LTR
```tsx
// app/[locale]/layout.tsx
<html dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
```

---

## 13. نظام التوليد بالذكاء الاصطناعي

### النموذج
```typescript
const MODEL = "claude-haiku-4-5-20251001";
// مع أداة البحث:
tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }]
```

### سير العملية
```
طلب من الأدمن
    ↓
isAuthorized() ← GENERATE_SECRET
    ↓
بناء Prompt (عربي + إنجليزي + JSON schema صارم)
    ↓
Claude Haiku + web_search (بيانات حقيقية)
    ↓
extractJSON() → validation
    ↓
[مقالات]: فحص جودة (quality_score ≥ 60)
    ↓
[مقالات]: فحص تكرار (hash_fingerprint)
    ↓
[مقالات]: توليد صورة — Replicate Flux Schnell
    ↓
INSERT في Supabase (posts + content_config)
    ↓
{ success: true, post: {...} }
```

### دالة استخراج JSON
```typescript
function extractJSON(text: string): unknown {
  // 1. يبحث عن ```json ... ```
  // 2. يبحث عن أول { ... } في النص
  // 3. throws إذا لم يجد JSON صالح
}
```

---

## 14. متغيرات البيئة

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kzxphzobrkgqqshxzvjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # للكتابة في API routes

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Replicate (توليد الصور)
REPLICATE_API_TOKEN=r8_...

# حماية API (اختياري — إذا فارغ: مفتوح للجميع)
GENERATE_SECRET=your-secret-here
```

---

## 15. النشر والإنتاج

### Vercel
```bash
npx vercel --prod --yes   # نشر من CLI
```

**إعدادات:**
- **Project ID:** `prj_thVfJ013J8WkVcRORiS4oxdg46p0`
- **Org:** `team_JAlIfUla2hOgxNMKI9qB09vc`
- **URL الإنتاج:** https://jamhara.vercel.app

### استراتيجية ISR Cache

| الصفحة | revalidate | السبب |
|---|---|---|
| `/` (الرئيسية) | 3600s | محتوى يتجدد كل ساعة |
| `/[category]` | 3600s | نفس المعدل |
| `/sections` | 3600s | بيانات شبه ثابتة |
| `/most-read` | 600s | يتجدد كل 10 دقائق |
| `/p/[id]` | 300s | view_count يتغير مستمر |
| `/search` | 0 | دائماً fresh |

### الـ Image Domains المسموح بها
```typescript
// next.config.ts
remotePatterns: [
  { hostname: "images.unsplash.com" },
  { hostname: "**.supabase.co" },
  { hostname: "**.replicate.delivery" },
  { hostname: "replicate.delivery" },
]
```

---

## 16. المهام المستقبلية

### عاجل
- [ ] حماية `/admin` بـ Clerk Auth أو middleware
- [ ] محتوى حقيقي لـ `/about` و `/contact`
- [ ] Sitemap.xml ديناميكي

### تحسينات تقنية
- [ ] بيانات الدول (Geo) في صندوق تحليلات المنشور
- [ ] صور OG ديناميكية بـ `next/og`
- [ ] RSS Feed لكل تصنيف
- [ ] Structured data JSON-LD لـ SEO
- [ ] نظام إشعارات (Push Notifications)

### تحسينات UX
- [ ] فلترة البحث بالنوع والتصنيف والتاريخ
- [ ] وضع القراءة المظلم (Dark Mode)
- [ ] تصدير PDF للمقالات
- [ ] نظام المفضّلة / القوائم الشخصية

### محتوى
- [ ] نظام التعليقات
- [ ] اشتراك البريد الإلكتروني
- [ ] إضافة أنواع محتوى جديدة (poll, infographic)

---

## 17. ملحق — TypeScript Types الكاملة

```typescript
// ===== Post Types =====
type PostType =
  | "article" | "chart" | "quiz" | "comparison"
  | "ranking" | "numbers" | "scenarios" | "timeline" | "factcheck";

// content_config يحمل أحد هذه (حسب post.type):
type ContentConfig =
  | RankingConfig       // ranking
  | NumbersConfig       // numbers
  | ScenariosConfig     // scenarios
  | TimelinePostConfig  // timeline
  | FactCheckConfig;    // factcheck

// comparison_config منفصل:
// posts.comparison_config: ComparisonConfig (6 أنواع)

// ===== Chart =====
interface ChartConfig {
  chartType: "line"|"bar"|"area"|"pie"|"donut"|"scatter"|"radar"|"composed";
  title_ar: string; title_en: string;
  series: ChartSeries[];
  xAxis?: { key: string; label_ar: string; label_en: string; };
  yAxis?: { label_ar: string; label_en: string; unit?: string; };
  annotations?: ChartAnnotation[];
  stats?: StatCard[];
  source: string; sourceUrl: string;
}

// ===== Quiz =====
type QuizType = "mcq"|"true_false"|"timeline"|"matching"|"guess_who"|"speed";
interface QuizConfig {
  quiz_type: QuizType;
  title_ar: string; title_en: string;
  difficulty: "easy"|"medium"|"hard";
  questions: AnyQuizQuestion[];
  source?: string; sourceUrl?: string;
}

// ===== Comparison =====
type ComparisonType = "bars"|"matrix"|"profile"|"timeline_duel"|"stance"|"spectrum";
interface ComparisonConfig {
  comparison_type: ComparisonType;
  title_ar: string; title_en: string;
  entity_a: ComparisonEntity;
  entity_b: ComparisonEntity;
  dimensions?: ComparisonDimension[];
  features?: MatrixFeature[];
  data_points?: TimelineDuelPoint[];
  topics?: StanceTopic[];
  axes?: SpectrumAxis[];
}

// ===== Ranking =====
interface RankingConfig {
  metric_ar: string; metric_en: string;
  items: RankingItem[];
  source: string; sourceUrl: string;
}
interface RankingItem {
  rank: number;
  name_ar: string; name_en: string;
  value: number; unit_ar: string; unit_en: string;
  note_ar?: string; note_en?: string;
  emoji?: string;
  change?: "up"|"down"|"same"; change_amount?: number;
}

// ===== Numbers =====
interface NumbersConfig {
  stats: NumberStat[];
  source: string; sourceUrl: string;
}
interface NumberStat {
  number: string;
  label_ar: string; label_en: string;
  context_ar: string; context_en: string;
  icon?: string; color?: string;
}

// ===== Scenarios =====
type ScenarioTone = "optimistic"|"realistic"|"pessimistic";
interface ScenariosConfig {
  question_ar: string; question_en: string;
  horizon_ar: string; horizon_en: string;
  scenarios: ScenarioItem[]; // exactly 3
}
interface ScenarioItem {
  tone: ScenarioTone;
  title_ar: string; title_en: string;
  probability: number; // 0-100
  conditions_ar: string[]; conditions_en: string[];
  outcome_ar: string; outcome_en: string;
}

// ===== Timeline Post =====
type TimelineEventType = "milestone"|"crisis"|"innovation"|"discovery"|"default";
interface TimelinePostConfig {
  events: TimelinePostEvent[]; // 8-15
  source: string; sourceUrl: string;
}
interface TimelinePostEvent {
  year: number;
  title_ar: string; title_en: string;
  description_ar: string; description_en: string;
  type: TimelineEventType;
  emoji?: string;
}

// ===== Fact Check =====
type FactVerdict = "true"|"false"|"misleading"|"partial"|"unverified";
interface FactCheckConfig {
  claims: FactCheckClaim[]; // 4-8
}
interface FactCheckClaim {
  claim_ar: string; claim_en: string;
  verdict: FactVerdict;
  explanation_ar: string; explanation_en: string;
  sources: string[];
}
```

---

*التوثيق مكتمل — مارس 2026*
*jamhara.vercel.app — قيمة المرء ما يعرفه*
