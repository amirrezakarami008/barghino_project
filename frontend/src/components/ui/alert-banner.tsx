"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "./alert";
import { selectBannerAlert, sortAlerts } from "./alert-logic";
import type { AlertDescriptor } from "./alert-types";

type BannerContextValue = {
  alerts: AlertDescriptor[];
  push: (alert: AlertDescriptor) => void;
  dismiss: (id: string) => void;
  setAlerts: (alerts: AlertDescriptor[]) => void;
};

const BannerContext = createContext<BannerContextValue | null>(null);

export function useAlertBanner() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error("useAlertBanner must be used inside <AlertBannerProvider>.");
  return ctx;
}

export function AlertBannerProvider({
  children,
  initial = [],
}: {
  children: ReactNode;
  initial?: AlertDescriptor[];
}) {
  const [alerts, setAlertsState] = useState<AlertDescriptor[]>(() =>
    sortAlerts(initial.map((item) => ({ ...item, placement: "banner" }))),
  );

  const setAlerts = useCallback((next: AlertDescriptor[]) => {
    setAlertsState(sortAlerts(next.map((item) => ({ ...item, placement: "banner" }))));
  }, []);

  const push = useCallback((alert: AlertDescriptor) => {
    setAlertsState((prev) =>
      sortAlerts([...prev.filter((item) => item.id !== alert.id), { ...alert, placement: "banner" }]),
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlertsState((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ alerts, push, dismiss, setAlerts }),
    [alerts, push, dismiss, setAlerts],
  );

  return <BannerContext value={value}>{children}</BannerContext>;
}

/** At most one page banner; highest severity wins, others remain queued. */
export function AlertBanner({ className }: { className?: string }) {
  const { alerts, dismiss } = useAlertBanner();
  const { visible, queued } = selectBannerAlert(alerts);

  if (!visible) return null;

  return (
    <div className={className ? `ui-alert-banner ${className}` : "ui-alert-banner"}>
      <Alert
        key={visible.id}
        variant={visible.variant}
        title={visible.title}
        description={visible.description}
        items={visible.items}
        actions={visible.actions}
        dismissible={visible.dismissible ?? true}
        dismissKey={visible.dismissKey}
        details={visible.details}
        compact={visible.compact}
        icon={visible.icon}
        onDismiss={() => dismiss(visible.id)}
      />
      {queued.length > 0 ? (
        <p className="sr-only" aria-live="polite">
          {`${queued.length} هشدار دیگر در صف است.`}
        </p>
      ) : null}
    </div>
  );
}
