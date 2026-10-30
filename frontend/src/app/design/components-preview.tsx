"use client";

import { useState, type ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  Input,
  LockedFeature,
  Modal,
  PlanCard,
  Select,
  Skeleton,
  SkeletonText,
  StatCard,
  StatusPill,
  Stepper,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Timeline,
  ToastProvider,
  useToast,
  type StatusTone,
} from "@/components/ui";
import { Icon } from "@/shared/ui/icon";
import { faNumber } from "@/shared/lib/fa";

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <header className="space-y-2">
        <h2 className="text-h2 text-foreground">{title}</h2>
        <p className="max-w-3xl text-body text-foreground-muted">{lede}</p>
      </header>
      {children}
    </section>
  );
}

const statuses: StatusTone[] = [
  "pending",
  "approved",
  "rejected",
  "draft",
  "active",
  "closed",
  "expired",
];

type SampleRow = {
  id: string;
  plant: string;
  kwh: number;
  status: StatusTone;
};

const sampleRows: SampleRow[] = [
  { id: "1", plant: "نیروگاه نمونه شمال", kwh: 1284, status: "active" },
  { id: "2", plant: "نیروگاه نمونه جنوب", kwh: 860, status: "pending" },
  { id: "3", plant: "نیروگاه نمونه غرب", kwh: 420, status: "approved" },
];

function InteractiveDemo() {
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [tableLoading, setTableLoading] = useState(false);

  return (
    <div className="space-y-16">
      <Section id="button" title="Button" lede="primary-gradient، secondary، ghost، danger — اندازه، loading و فقط‌آیکون.">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">ثبت درخواست</Button>
          <Button variant="secondary">انصراف</Button>
          <Button variant="ghost">جزئیات</Button>
          <Button variant="danger">حذف</Button>
          <Button loading>در حال ارسال</Button>
          <Button size="sm" variant="secondary">
            کوچک
          </Button>
          <Button size="lg">بزرگ</Button>
          <Button size="icon" variant="secondary" aria-label="اعلان‌ها">
            <Icon name="bell" className="size-5" />
            اعلان‌ها
          </Button>
          <Button disabled>غیرفعال</Button>
        </div>
      </Section>

      <Section id="fields" title="Input / Textarea / Select" lede="برچسب بالا یا شناور، متن راهنما و خطای اعتبارسنجی — RTL.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="نام کامل" placeholder="مثلاً سارا محمدی" helperText="طبق کارت ملی" />
          <Input label="کد ملی" labelPlacement="floating" error="کد ملی نامعتبر است" />
          <Textarea label="توضیحات" helperText="اختیاری" placeholder="..." />
          <Select
            label="استان"
            labelPlacement="floating"
            options={[
              { value: "tehran", label: "تهران" },
              { value: "isfahan", label: "اصفهان" },
            ]}
            helperText="محل نیروگاه"
          />
        </div>
      </Section>

      <Section id="card" title="Card" lede="solid، glass، gradient-border و interactive با hover-lift.">
        <div className="grid gap-4 md:grid-cols-2">
          <Card variant="solid">
            <p className="text-h4">Solid</p>
            <p className="mt-1 text-sm text-foreground-muted">سطح توپر برای داده و فرم.</p>
          </Card>
          <div className="rounded-xl bg-grad-sun p-4">
            <Card variant="glass">
              <p className="text-h4">Glass</p>
              <p className="mt-1 text-sm text-foreground-muted">فقط روی پس‌زمینه رنگی.</p>
            </Card>
          </div>
          <Card variant="gradient-border">
            <p className="text-h4">Gradient border</p>
            <p className="mt-1 text-sm text-foreground-muted">کارت برجسته مقایسه.</p>
          </Card>
          <Card variant="interactive" tabIndex={0}>
            <p className="text-h4">Interactive</p>
            <p className="mt-1 text-sm text-foreground-muted">با هاور کمی بلند می‌شود.</p>
          </Card>
        </div>
      </Section>

      <Section id="badge" title="Badge / StatusPill" lede="یک وضعیت به‌ازای هر توکن معنایی.">
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
          <Badge tone="accent">ولت</Badge>
          <Badge tone="soft">نمونه</Badge>
        </div>
      </Section>

      <Section id="stepper" title="Stepper" lede="افقی در دسکتاپ، عمودی در موبایل — done / current / blocked / rejected.">
        <Card>
          <Stepper
            steps={[
              { id: "1", label: "ثبت‌نام", description: "حساب تأیید شد", state: "done" },
              { id: "2", label: "مدارک", description: "در حال بررسی", state: "current" },
              { id: "3", label: "بازدید", description: "قفل تا تأیید مدارک", state: "blocked" },
              { id: "4", label: "قرارداد", description: "نمونه رد شده", state: "rejected" },
            ]}
          />
        </Card>
      </Section>

      <Section id="timeline" title="Timeline" lede="تاریخچه رویدادهای قرارداد.">
        <Card>
          <Timeline
            events={[
              {
                id: "e1",
                title: "پیش‌نویس ایجاد شد",
                description: "قرارداد نمونه ذخیره شد.",
                time: "۱۴۰۴/۰۷/۰۱ · ۱۰:۲۰",
                tone: "draft",
              },
              {
                id: "e2",
                title: "ارسال برای بررسی",
                time: "۱۴۰۴/۰۷/۰۲ · ۱۲:۰۰",
                tone: "pending",
              },
              {
                id: "e3",
                title: "تأیید شد",
                description: "آماده امضا.",
                time: "۱۴۰۴/۰۷/۰۳ · ۰۹:۱۵",
                tone: "approved",
              },
            ]}
          />
        </Card>
      </Section>

      <Section id="tabs" title="Tabs" lede="لیست تب با پنل مرتبط.">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="docs">مدارک</TabsTrigger>
            <TabsTrigger value="pay">پرداخت</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>محتوای نمای کلی نمونه</Card>
          </TabsContent>
          <TabsContent value="docs">
            <Card>فهرست مدارک نمونه</Card>
          </TabsContent>
          <TabsContent value="pay">
            <Card>وضعیت پرداخت نمونه</Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section id="overlays" title="Modal / Drawer / Toast" lede="سطوح شیشه‌ای روی پس‌زمینه تیره.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>باز کردن Modal</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            باز کردن Drawer
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              push({
                tone: "success",
                title: "ذخیره شد",
                description: "تغییرات نمونه ثبت شد.",
              })
            }
          >
            نمایش Toast
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="تأیید قرارداد نمونه"
          description="این یک دیالوگ نمایشی است."
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                انصراف
              </Button>
              <Button onClick={() => setModalOpen(false)}>تأیید</Button>
            </div>
          }
        >
          <p className="text-sm text-foreground-muted">متن بدنه مودال روی سطح glass-strong.</p>
        </Modal>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="جزئیات نیروگاه"
          description="کشو نمونه از سمت پایان"
        >
          <p className="text-sm text-foreground-muted">محتوای کشو برای فیلترها یا جزئیات.</p>
        </Drawer>
      </Section>

      <Section id="feedback" title="Alert / Skeleton / Empty / Locked" lede="حالت‌های بازخورد و قفل به‌زودی.">
        <div className="grid gap-4">
          <Alert tone="info" title="اطلاع">
            نرخ‌های صفحه نمونه هستند.
          </Alert>
          <Alert tone="warning" title="هشدار">
            مدارک ناقص است.
          </Alert>
          <Alert tone="success" title="موفق">
            درخواست ثبت شد.
          </Alert>
          <Alert tone="danger" title="خطا">
            اتصال برقرار نشد.
          </Alert>
          <Card className="space-y-3">
            <Skeleton className="h-8 w-1/3" />
            <SkeletonText lines={3} />
          </Card>
          <EmptyState
            title="قراردادی نیست"
            description="هنوز قراردادی برای این حساب ثبت نشده است."
            action={<Button size="sm">شروع قرارداد</Button>}
          />
          <LockedFeature
            title="گزارش تولید پیشرفته"
            description="نمودارهای مقایسه‌ای به‌زودی در پنل فعال می‌شوند."
          />
        </div>
      </Section>

      <Section id="data-table" title="DataTable" lede="سطح توپر، هدر چسبان، هاور ردیف، ستون وضعیت، empty/loading و کارت موبایل.">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setTableLoading((v) => !v)}>
            {tableLoading ? "نمایش داده" : "حالت loading"}
          </Button>
        </div>
        <DataTable
          loading={tableLoading}
          rows={sampleRows}
          getRowId={(row) => row.id}
          statusAccessor={(row) => row.status}
          columns={[
            {
              id: "plant",
              header: "نیروگاه",
              mobilePrimary: true,
              cell: (row) => row.plant,
            },
            {
              id: "kwh",
              header: "تولید نمونه",
              className: "tabular-nums",
              cell: (row) => `${faNumber(row.kwh)} kWh`,
            },
          ]}
        />
        <div className="mt-4">
          <DataTable<SampleRow>
            rows={[]}
            getRowId={(row) => row.id}
            columns={[{ id: "plant", header: "نیروگاه", cell: (row) => row.plant }]}
            emptyTitle="جدول خالی"
            emptyDescription="برای حالت empty طراحی شده است."
          />
        </div>
      </Section>

      <Section id="stat-card" title="StatCard" lede="مقدار، برچسب، روند و تگ نمونه.">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="تولید امروز"
            value={`${faNumber(42.5)} kWh`}
            trend={{ direction: "up", label: `${faNumber(8)}٪ نسبت به دیروز` }}
            sample
          />
          <StatCard
            label="درآمد برآوردی نمونه"
            value={`${faNumber(635000)} تومان`}
            trend={{ direction: "flat", label: "بدون تغییر" }}
            sample
            hint="نمونه نمایشی است، نه تسویه قطعی و نه درآمد تضمینی."
          />
          <StatCard
            label="نیروگاه‌ها"
            value={faNumber(2)}
            trend={{ direction: "down", label: "یکی در انتظار" }}
          />
        </div>
      </Section>

      <Section id="plan-card" title="PlanCard" lede="چیدمان هم‌ارتفاع برای مقایسه؛ روبان پیشنهادی و حالت انتخاب.">
        <div className="grid gap-4 md:grid-cols-3">
          <PlanCard
            name="پایه"
            buyRate={12000}
            energyCommitment="تا ۵ مگاوات‌ساعت در سال"
            benefits={["قرارداد شفاف", "پشتیبانی روزکاری"]}
            selected={selectedPlan === "base"}
            onSelect={() => setSelectedPlan("base")}
          />
          <PlanCard
            name="استاندارد"
            buyRate={15000}
            energyCommitment="تا ۱۲ مگاوات‌ساعت در سال"
            benefits={["تسویه حداکثر دو ماه", "پیگیری وضعیت آنلاین", "اولویت پشتیبانی"]}
            recommended
            selected={selectedPlan === "standard"}
            onSelect={() => setSelectedPlan("standard")}
          />
          <PlanCard
            name="ویژه"
            buyRate={16500}
            energyCommitment="تعهد منعطف توافقی"
            benefits={["نرخ بالاتر نمونه", "مدیر اختصاصی"]}
            selected={selectedPlan === "pro"}
            onSelect={() => setSelectedPlan("pro")}
          />
        </div>
      </Section>
    </div>
  );
}

export function ComponentsPreview() {
  return (
    <ToastProvider>
      <InteractiveDemo />
    </ToastProvider>
  );
}
