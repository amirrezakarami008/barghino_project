"use client";

import type { ReactElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PanelArt } from "@/features/panel/panel-art";
import { ProfileDetails } from "@/features/workspace/profile-details";
import "./admin-workspace.css";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AdminProfile(): ReactElement {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.05 } },
        },
      };

  return (
    <motion.div className="admin-workspace" {...motionProps}>
      <motion.section className="admin-ws-hero" variants={reduceMotion ? undefined : fadeUp}>
        <div className="min-w-0">
          <p className="admin-ws-hero-eyebrow">حساب مدیر</p>
          <h2 className="admin-ws-hero-title">پروفایل و دسترسی</h2>
          <p className="admin-ws-hero-body">
            مشخصات حساب، اطلاعات هویتی و وضعیت دسترسی شما — همان دادهٔ تأییدشدهٔ سرویس.
          </p>
        </div>
        <div className="admin-ws-hero-art">
          <PanelArt name="stat-contracts" width={240} height={240} className="admin-ws-hero-image" />
        </div>
      </motion.section>

      <motion.section className="admin-ws-panel" variants={reduceMotion ? undefined : fadeUp}>
        <ProfileDetails />
      </motion.section>
    </motion.div>
  );
}
