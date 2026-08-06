"use client";

import { DashboardPage, Panel, PanelHeader } from "@/features/dashboard/components";
import { Button } from "@/shared/ui/Button";
import { Copy, Gift, Share2, Users } from "lucide-react";
import { useState } from "react";

const REFERRAL_CODE = "BRGH-MAHDI-4821";
const REFERRAL_LINK = `https://barghino.ir/register?ref=${REFERRAL_CODE}`;

export default function ReferralPage() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardPage title="دعوت دوستان" subtitle="با معرفی دوستان، پاداش دریافت کنید">
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="لینک دعوت شما"
            description="این لینک را برای دوستانتان بفرستید تا با ثبت‌نام از طریق آن، هر دو پاداش بگیرید."
          />
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">کد معرف</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-lg font-bold tracking-wider text-slate-900">
                  {REFERRAL_CODE}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(REFERRAL_CODE, "code")}
                  className="shrink-0 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied === "code" ? "کپی شد!" : "کپی"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-medium text-slate-500">لینک دعوت</p>
              <div className="flex items-center gap-3">
                <p className="flex-1 truncate text-sm text-slate-700" dir="ltr">
                  {REFERRAL_LINK}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(REFERRAL_LINK, "link")}
                  className="shrink-0 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied === "link" ? "کپی شد!" : "کپی"}
                </Button>
              </div>
            </div>

            <Button className="w-full gap-2 sm:w-auto">
              <Share2 className="h-4 w-4" />
              اشتراک‌گذاری
            </Button>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                <Gift className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">۵۰۰٬۰۰۰</p>
                <p className="text-xs text-slate-500">تومان پاداش هر دعوت</p>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">۳</p>
                <p className="text-xs text-slate-500">دوست دعوت‌شده</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardPage>
  );
}
