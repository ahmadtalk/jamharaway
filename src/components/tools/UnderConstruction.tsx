"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface UnderConstructionProps {
  title: string;
  description: string;
}

export default function UnderConstruction({ title, description }: UnderConstructionProps) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-700">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <Badge variant="warning">قيد التطوير</Badge>
        </div>
      </Card>

      {/* Input */}
      <Card>
        <label className="mb-2 block text-sm font-semibold text-navy-700">
          أدخل النص الصحفي للتحليل
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="الصق النص هنا..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">{text.length} حرف</span>
          <button
            disabled
            className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white opacity-50"
          >
            تحليل النص
          </button>
        </div>
      </Card>

      {/* Results placeholder */}
      <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">نتائج التحليل ستظهر هنا</p>
          <p className="mt-1 text-xs text-gray-400">هذه الميزة قيد التطوير</p>
        </div>
      </Card>
    </div>
  );
}
