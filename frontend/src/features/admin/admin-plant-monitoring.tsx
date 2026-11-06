"use client";

import { type ReactElement } from "react";
import {
  Button,
  Modal,
} from "@/components/ui";
import { AdminPlantDevicesPanel } from "./admin-plant-devices";
import type { AdminPlant } from "./admin-plants-api";

export function AdminPlantMonitoring({
  plant,
  onClose,
}: {
  readonly plant: AdminPlant;
  readonly onClose: () => void;
}): ReactElement {
  return (
    <Modal
      open
      onClose={onClose}
      title={`مدیریت بوردها · ${plant.name}`}
      description="ثبت و مدیریت بوردهای متصل به نیروگاه. کلید API فقط هنگام ثبت یا نوسازی نمایش داده می‌شود."
      className="max-w-3xl"
      footer={
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
        </div>
      }
    >
      <AdminPlantDevicesPanel plant={plant} />
    </Modal>
  );
}
