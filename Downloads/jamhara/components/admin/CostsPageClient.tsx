"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

interface Props {
  totalPosts: number;
  articlePosts: number;
  nonArticlePosts: number;
  postsWithImages: number;
  totalJobs: number;
  totalFailed: number;
  trackedCost: number;
  totalEstimated: number;
  anthropicEstimated: number;
  webSearchEstimated: number;
  replicateEstimated: number;
  thisMonthCost: number;
  thisMonthPosts: number;
  dailyData: { date: string; anthropic: number; webSearch: number; replicate: number }[];
}

function fmtUsd(n: number, digits = 4) {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(digits)}`;
  return `$${n.toFixed(2)}`;
}

function fmtUsdFull(n: number) {
  return `$${n.toFixed(4)}`;
}

const HAIKU_INPUT_PER_M  = 0.80;
const HAIKU_OUTPUT_PER_M = 4.00;
const ARTICLE_INPUT  = 700;
const ARTICLE_OUTPUT = 650;
const OTHER_INPUT    = 1200;
const OTHER_OUTPUT   = 900;
const WEB_SEARCH_PRICE = 0.01;
const REPLICATE_PER_IMAGE = 0.003;
const AVG_SEARCHES = 2;

const COST_PER_ARTICLE =
  (ARTICLE_INPUT * HAIKU_INPUT_PER_M + ARTICLE_OUTPUT * HAIKU_OUTPUT_PER_M) / 1_000_000;
const COST_PER_OTHER_TOKENS =
  (OTHER_INPUT * HAIKU_INPUT_PER_M + OTHER_OUTPUT * HAIKU_OUTPUT_PER_M) / 1_000_000;
const COST_PER_OTHER_TOTAL =
  COST_PER_OTHER_TOKENS + AVG_SEARCHES * WEB_SEARCH_PRICE;

export function CostsPageClient({
  totalPosts, articlePosts, nonArticlePosts, postsWithImages,
  totalJobs, totalFailed, trackedCost,
  totalEstimated, anthropicEstimated, webSearchEstimated, replicateEstimated,
  thisMonthCost, thisMonthPosts, dailyData,
}: Props) {

  const avgCostPerPost = totalPosts > 0 ? totalEstimated / totalPosts : 0;
  const daysInMonth = new Date().getDate();
  const projectedMonth = thisMonthPosts > 0
    ? (thisMonthCost / daysInMonth) * 30
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Estimation notice ────────────────────────────────────── */}
      <div className="a-cost-notice">
        <span>📌</span>
        <div>
          <strong>تكاليف تقديرية</strong> — مبنية على أسعار كل خدمة وعدد المنشورات الفعلي.
          {trackedCost > 0
            ? ` التتبع الدقيق للتوكن يغطي ${fmtUsd(trackedCost)} من تكاليف المقالات.`
            : " التتبع الدقيق للتوكن يبدأ مع المنشورات الجديدة."}
        </div>
      </div>

      {/* ── Summary cards ────────────────────────────────────────── */}
      <div className="a-stat-grid">
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#2196F3" }}>
            {fmtUsd(totalEstimated, 2)}
          </span>
          <span className="a-stat-label">إجمالي التكلفة (كل الوقت)</span>
        </div>
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#4CB36C" }}>
            {fmtUsd(thisMonthCost, 2)}
          </span>
          <span className="a-stat-label">الشهر الحالي</span>
        </div>
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#7B5EA7" }}>
            {fmtUsd(avgCostPerPost)}
          </span>
          <span className="a-stat-label">متوسط تكلفة المنشور</span>
        </div>
        <div className="a-stat">
          <span className="a-stat-num" style={{ color: "#F59E0B" }}>
            {totalPosts}
          </span>
          <span className="a-stat-label">
            منشور ({totalFailed > 0 ? `${totalFailed} فشل` : "جميعها نجح"})
          </span>
        </div>
      </div>

      {/* ── Cost breakdown by service ────────────────────────────── */}
      <div className="a-card">
        <p className="a-card-title">تفصيل التكاليف حسب الخدمة</p>
        <div className="a-cost-services">

          {/* Vercel */}
          <div className="a-cost-service">
            <div className="a-cost-service-header">
              <span className="a-cost-service-logo" style={{ background: "#000" }}>▲</span>
              <div>
                <strong>Vercel</strong>
                <span className="a-cost-service-plan">Hobby Plan</span>
              </div>
              <span className="a-cost-service-price free">$0.00</span>
            </div>
            <ul className="a-cost-service-limits">
              <li>✓ Hosting + CDN مجاني</li>
              <li>✓ 100 GB bandwidth/شهر</li>
              <li>✓ Cron jobs مُدرجة</li>
              <li>✓ Custom domain</li>
            </ul>
            <div className="a-cost-service-footer">
              الترقية عند: &gt;100GB bandwidth أو teamwork
            </div>
          </div>

          {/* Supabase */}
          <div className="a-cost-service">
            <div className="a-cost-service-header">
              <span className="a-cost-service-logo" style={{ background: "#3ECF8E" }}>S</span>
              <div>
                <strong>Supabase</strong>
                <span className="a-cost-service-plan">Free Tier</span>
              </div>
              <span className="a-cost-service-price free">$0.00</span>
            </div>
            <ul className="a-cost-service-limits">
              <li>✓ 500 MB قاعدة بيانات</li>
              <li>✓ 5 GB bandwidth/شهر</li>
              <li>✓ Auth + RLS + Storage</li>
              <li>✓ Edge Functions</li>
            </ul>
            <div className="a-cost-service-footer">
              الترقية عند: &gt;500MB DB أو &gt;5GB bandwidth
            </div>
          </div>

          {/* Anthropic tokens */}
          <div className="a-cost-service">
            <div className="a-cost-service-header">
              <span className="a-cost-service-logo" style={{ background: "#CC785C" }}>A</span>
              <div>
                <strong>Anthropic — توكن</strong>
                <span className="a-cost-service-plan">Claude Haiku 4.5</span>
              </div>
              <span className="a-cost-service-price paid">{fmtUsd(anthropicEstimated)}</span>
            </div>
            <ul className="a-cost-service-limits">
              <li>Input: $0.80 / مليون توكن</li>
              <li>Output: $4.00 / مليون توكن</li>
              <li>{articlePosts} مقال × {fmtUsdFull(COST_PER_ARTICLE)}</li>
              <li>{nonArticlePosts} منشور آخر × {fmtUsdFull(COST_PER_OTHER_TOKENS)}</li>
            </ul>
            <div className="a-cost-service-footer">
              يستخدمه: كل أنواع المحتوى
            </div>
          </div>

          {/* Anthropic web_search */}
          <div className="a-cost-service">
            <div className="a-cost-service-header">
              <span className="a-cost-service-logo" style={{ background: "#CC785C" }}>🔍</span>
              <div>
                <strong>Anthropic — Web Search</strong>
                <span className="a-cost-service-plan">web_search_20250305</span>
              </div>
              <span className="a-cost-service-price paid">{fmtUsd(webSearchEstimated)}</span>
            </div>
            <ul className="a-cost-service-limits">
              <li>السعر: $0.01 لكل بحث</li>
              <li>الحد الأقصى: 3 بحث/منشور</li>
              <li>المتوسط المُستخدم: ~{AVG_SEARCHES} بحث/منشور</li>
              <li>{nonArticlePosts} منشور × ${(AVG_SEARCHES * WEB_SEARCH_PRICE).toFixed(2)}</li>
            </ul>
            <div className="a-cost-service-footer">
              يستخدمه: مخطط، اختبار، مقارنة، ترتيب، أرقام، سيناريو، خط زمني، تحقق
            </div>
          </div>

          {/* Replicate */}
          <div className="a-cost-service">
            <div className="a-cost-service-header">
              <span className="a-cost-service-logo" style={{ background: "#5E35B1" }}>R</span>
              <div>
                <strong>Replicate — صور</strong>
                <span className="a-cost-service-plan">Flux Schnell</span>
              </div>
              <span className="a-cost-service-price" style={{ color: postsWithImages > 0 ? "#2196F3" : "#9BA0B8" }}>
                {postsWithImages > 0 ? fmtUsd(replicateEstimated) : "غير مُفعَّل"}
              </span>
            </div>
            <ul className="a-cost-service-limits">
              <li>~$0.003 لكل صورة</li>
              <li>{postsWithImages} صورة مُولَّدة حتى الآن</li>
              <li>يُفعَّل فقط إذا ضُبط REPLICATE_API_TOKEN</li>
              <li style={{ color: postsWithImages === 0 ? "#E05A2B" : "#4CB36C" }}>
                {postsWithImages === 0 ? "⚠️ غير مُفعَّل حالياً" : "✓ مُفعَّل"}
              </li>
            </ul>
            <div className="a-cost-service-footer">
              يستخدمه: المقالات فقط
            </div>
          </div>

          {/* Total summary */}
          <div className="a-cost-service a-cost-service-total">
            <div className="a-cost-service-header">
              <span className="a-cost-service-logo" style={{ background: "#1E2130" }}>∑</span>
              <div>
                <strong>الإجمالي</strong>
                <span className="a-cost-service-plan">كل الخدمات</span>
              </div>
            </div>
            <div className="a-cost-total-breakdown">
              <div><span>Vercel + Supabase</span><strong style={{color:"#4CB36C"}}>$0.00</strong></div>
              <div><span>Anthropic (توكن)</span><strong>{fmtUsd(anthropicEstimated)}</strong></div>
              <div><span>Anthropic (بحث)</span><strong>{fmtUsd(webSearchEstimated)}</strong></div>
              <div><span>Replicate (صور)</span><strong>{fmtUsd(replicateEstimated)}</strong></div>
              <div className="a-cost-grand-total">
                <span>الإجمالي الكلي</span>
                <strong style={{color:"#2196F3", fontSize:"1.1rem"}}>{fmtUsd(totalEstimated, 2)}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Daily chart ──────────────────────────────────────────── */}
      <div className="a-card">
        <p className="a-card-title">التكاليف اليومية — آخر 30 يوماً</p>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F5" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9BA0B8" }} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#9BA0B8" }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v, name) => [
                `$${Number(v ?? 0).toFixed(4)}`,
                name === "anthropic" ? "توكن" : name === "webSearch" ? "بحث" : "صور",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid #EDF1F5", fontSize: 12 }}
            />
            <Legend formatter={(v) =>
              v === "anthropic" ? "توكن Anthropic" : v === "webSearch" ? "Web Search" : "Replicate صور"
            } />
            <Bar dataKey="anthropic" stackId="a" fill="#CC785C" radius={[0,0,0,0]} maxBarSize={20} />
            <Bar dataKey="webSearch" stackId="a" fill="#2196F3" radius={[0,0,0,0]} maxBarSize={20} />
            <Bar dataKey="replicate" stackId="a" fill="#5E35B1" radius={[3,3,0,0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>

        <div style={{ display: "flex", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
          <div className="a-cost-mini-stat">
            <span>هذا الشهر</span>
            <strong style={{ color: "#2196F3" }}>{fmtUsd(thisMonthCost, 2)}</strong>
          </div>
          <div className="a-cost-mini-stat">
            <span>منشورات هذا الشهر</span>
            <strong>{thisMonthPosts}</strong>
          </div>
          <div className="a-cost-mini-stat">
            <span>توقع الشهر كاملاً</span>
            <strong style={{ color: "#7B5EA7" }}>{fmtUsd(projectedMonth, 2)}</strong>
          </div>
        </div>
      </div>

      {/* ── Per-post cost breakdown + projections ─────────────────── */}
      <div className="a-cost-two-col">

        <div className="a-card">
          <p className="a-card-title">تكلفة كل نوع منشور</p>
          <table className="a-cost-token-table">
            <thead>
              <tr>
                <th style={{textAlign:"start",fontWeight:600,fontSize:".78rem",color:"#6B7280",paddingBottom:8}}>النوع</th>
                <th style={{textAlign:"center",fontWeight:600,fontSize:".78rem",color:"#6B7280",paddingBottom:8}}>توكن</th>
                <th style={{textAlign:"center",fontWeight:600,fontSize:".78rem",color:"#6B7280",paddingBottom:8}}>بحث</th>
                <th style={{textAlign:"end",fontWeight:600,fontSize:".78rem",color:"#6B7280",paddingBottom:8}}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>📰 مقال (+ صورة)</td>
                <td className="num">{fmtUsdFull(COST_PER_ARTICLE)}</td>
                <td className="num" style={{color:"#9BA0B8"}}>—</td>
                <td className="price">{fmtUsdFull(COST_PER_ARTICLE + REPLICATE_PER_IMAGE)}</td>
              </tr>
              <tr>
                <td>📰 مقال (بدون صورة)</td>
                <td className="num">{fmtUsdFull(COST_PER_ARTICLE)}</td>
                <td className="num" style={{color:"#9BA0B8"}}>—</td>
                <td className="price">{fmtUsdFull(COST_PER_ARTICLE)}</td>
              </tr>
              {[
                { icon: "📊", label: "مخطط / مقارنة / اختبار" },
                { icon: "📋", label: "ترتيب / أرقام / سيناريو / خط زمني / تحقق" },
              ].map(({ icon, label }) => (
                <tr key={label}>
                  <td>{icon} {label}</td>
                  <td className="num">{fmtUsdFull(COST_PER_OTHER_TOKENS)}</td>
                  <td className="num" style={{color:"#2196F3"}}>${(AVG_SEARCHES * WEB_SEARCH_PRICE).toFixed(2)}</td>
                  <td className="price">{fmtUsdFull(COST_PER_OTHER_TOTAL)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>المتوسط الحالي</strong></td>
                <td className="num" colSpan={2} style={{textAlign:"center"}}>{totalPosts} منشور</td>
                <td className="price"><strong>{fmtUsdFull(avgCostPerPost)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="a-card">
          <p className="a-card-title">توقعات التكلفة الشهرية</p>
          <div className="a-cost-projection">
            <p className="a-cost-projection-title">حسب عدد المنشورات اليومية (مقالات فقط)</p>
            {[1, 2, 5].map((n) => {
              const monthly = n * 30;
              const cost = monthly * COST_PER_ARTICLE;
              return (
                <div key={n} className="a-cost-projection-row">
                  <span>{n} مقال/يوم ({monthly}/شهر)</span>
                  <strong>{fmtUsd(cost, 2)}/شهر</strong>
                </div>
              );
            })}
          </div>
          <div className="a-cost-projection" style={{ marginTop: 12 }}>
            <p className="a-cost-projection-title">مع تنوع المحتوى (50% مقال، 50% محتوى ذكي)</p>
            {[1, 2, 5].map((n) => {
              const monthly = n * 30;
              const half = Math.round(monthly / 2);
              const cost = half * COST_PER_ARTICLE + half * COST_PER_OTHER_TOTAL;
              return (
                <div key={n} className="a-cost-projection-row">
                  <span>{n} منشور/يوم ({monthly}/شهر)</span>
                  <strong>{fmtUsd(cost, 2)}/شهر</strong>
                </div>
              );
            })}
          </div>
          <div className="a-cost-token-divider" style={{ margin: "14px 0" }} />
          <div className="a-cost-token-row">
            <span style={{ fontSize: ".78rem", color: "#9BA0B8" }}>
              أكبر عامل تكلفة:
            </span>
            <span style={{ fontSize: ".78rem", color: "#2196F3", fontWeight: 600 }}>
              Web Search ($0.01/بحث)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
