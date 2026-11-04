"use client";

import { type ReactElement } from "react";
import {
  Button,
  Modal,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { AdminPlantDevicesPanel } from "./admin-plant-devices";
import { AdminPlantProductionPanel } from "./admin-plant-production";
import { AdminPlantReadingsPanel } from "./admin-plant-readings";
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
      title={plant.name}
      description="بوردها، قرائت‌های خام و نمودار تولید. کلید API فقط یک‌بار نمایش داده می‌شود."
      className="max-w-3xl"
      footer={
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="devices">
        <TabsList aria-label="بخش‌های مانیتورینگ نیروگاه">
          <TabsTrigger value="devices">بوردها</TabsTrigger>
          <TabsTrigger value="readings">قرائت‌ها</TabsTrigger>
          <TabsTrigger value="production">تولید</TabsTrigger>
        </TabsList>
        <TabsContent value="devices">
          <AdminPlantDevicesPanel plant={plant} />
        </TabsContent>
        <TabsContent value="readings">
          <AdminPlantReadingsPanel plant={plant} />
        </TabsContent>
        <TabsContent value="production">
          <AdminPlantProductionPanel plant={plant} />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
