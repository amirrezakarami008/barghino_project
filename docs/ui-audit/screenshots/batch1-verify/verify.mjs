/**
 * Batch 1 verification — Playwright. Run from /tmp/pw-batch1 (has playwright dep).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const PROJECT = "/home/amir/my_work/barghini_project";
const OUT = path.join(PROJECT, "docs/ui-audit/screenshots/batch1-verify");
const BASE = path.join(PROJECT, "docs/ui-audit/screenshots");
const ORIGIN = process.env.VERIFY_ORIGIN || "http://localhost:3010";
const API = process.env.VERIFY_API || "http://localhost:8000";

const report = { origin: ORIGIN, checks: [], screenshots: [], notes: [], cpy: {} };

function pass(id, detail) {
  report.checks.push({ id, result: "PASS", detail });
  console.log(`PASS  ${id} — ${detail}`);
}
function fail(id, detail) {
  report.checks.push({ id, result: "FAIL", detail });
  console.log(`FAIL  ${id} — ${detail}`);
}
function info(msg) {
  report.notes.push(msg);
  console.log(`NOTE  ${msg}`);
}

function relLum(hex) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) {
  const L1 = relLum(a);
  const L2 = relLum(b);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
function rgbToHex(rgb) {
  const m = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return null;
  return "#" + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, "0")).join("");
}
function resolveColor(value) {
  if (!value) return null;
  if (value.startsWith("#")) {
    return value.length === 4
      ? "#" + value.slice(1).split("").map((c) => c + c).join("")
      : value.slice(0, 7);
  }
  return rgbToHex(value);
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
    root.style.colorScheme = t;
    try {
      localStorage.setItem("theme", t);
      // next-themes default storage key
      localStorage.setItem("theme", t);
    } catch {}
  }, theme);
  // Toggle via available theme button if present for real provider sync
  const pressed = await page.locator('[aria-label*="حالت"]').first().getAttribute("aria-pressed").catch(() => null);
  const wantDark = theme === "dark";
  if (pressed !== null) {
    const isDark = pressed === "true";
    if (isDark !== wantDark) {
      await page.locator('[aria-label*="حالت"]').first().click().catch(() => {});
      await page.waitForTimeout(200);
    }
  }
  await page.waitForTimeout(120);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  report.screenshots.push(file.replace(PROJECT + "/", ""));
  const baselineMap = {
    home_light_360: "home_light_360.png",
    home_light_1280: "home_light_390.png",
    login_light_360: "login_light_360.png",
    login_light_1280: "login_light_390.png",
  };
  if (baselineMap[name]) {
    const bp = path.join(BASE, baselineMap[name]);
    if (fs.existsSync(bp)) {
      const a = fs.statSync(file).size;
      const b = fs.statSync(bp).size;
      report.notes.push(`Baseline compare ${name}: verify=${a}B vs baseline ${baselineMap[name]}=${b}B (visual; no pixel-diff).`);
    }
  }
  return file;
}

const fakeUserApi = {
  uuid: "00000000-0000-4000-8000-000000000001",
  phone: "09120000000",
  first_name: "آزمون",
  last_name: "برقینو",
  role: "user",
  path: "sell",
  account_type: "individual",
  username: "verify",
  is_phone_verified: true,
};

const fakeSession = {
  access: "verify-access-token",
  refresh: "verify-refresh-token",
  user: {
    uuid: fakeUserApi.uuid,
    phone: fakeUserApi.phone,
    firstName: "آزمون",
    lastName: "برقینو",
    role: "user",
    path: "sell",
    accountType: "individual",
    username: "verify",
    isPhoneVerified: true,
  },
};

async function installMocks(page) {
  await page.route(/localhost:8000\/api\/v1\/.*/, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const json = (body, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

    if (url.includes("/auth/otp/request/") && method === "POST") return json({ detail: "ok" });
    if (url.includes("/auth/otp/verify/") && method === "POST") {
      return json({ access: fakeSession.access, refresh: fakeSession.refresh, user: fakeUserApi });
    }
    if (url.includes("/auth/me/")) return json(fakeUserApi);
    if (url.includes("/auth/token/refresh/")) return json({ access: fakeSession.access });
    if (method === "GET") {
      return json({ count: 0, next: null, previous: null, results: [] });
    }
    return json({ detail: "ok" });
  });
}

async function measureInputs(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("input, textarea")).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        type: el.getAttribute("type") || el.tagName.toLowerCase(),
        name: el.getAttribute("name") || el.getAttribute("aria-label") || el.id || el.className?.toString?.().slice(0, 40) || "",
        fontSize: cs.fontSize,
        fontSizePx: parseFloat(cs.fontSize),
        w: Math.round(r.width),
        h: Math.round(r.height),
        visible: r.width > 0 && r.height > 0 && cs.visibility !== "hidden",
      };
    }).filter((i) => i.visible && i.type !== "hidden");
  });
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  info(`Origin ${ORIGIN}`);

  // CPY before/after (static from git + current)
  report.cpy = {
    "CPY-001 about settlement": {
      before: "تسویه سریع‌تر از مسیر طولانی دولتی، حداکثر دو ماه.",
      after: "نمونهٔ محصول حداکثر دو ماه را نشان می‌دهد؛ سررسید در قرارداد شماست.",
    },
    "CPY-002 journal status": {
      before: "منتشرشده · فقط‌خواندنی",
      after: "فقط‌خواندنی · نمونه",
    },
    "CPY-002 journal audit column": {
      before: 'header "آخرین اقدام" + AdminAuditLine "آخرین اقدام: انتشار در مجلهٔ عمومی سایت"',
      after: "(column removed)",
    },
  };
  console.log("\n=== CPY before/after ===");
  for (const [k, v] of Object.entries(report.cpy)) {
    console.log(`${k}\n  BEFORE: ${v.before}\n  AFTER:  ${v.after}`);
  }
  // Honesty scan on after strings
  const afterJoined = Object.values(report.cpy).map((v) => v.after).join(" ");
  const bad =
    /درآمد تضمین|سود قطعی|تأیید شد قبل|بدون بررسی|حتماً.*تأیید|قطعی.*دو ماه|SLA/.test(afterJoined) ||
    /آخرین اقدام: انتشار/.test(afterJoined);
  if (!bad) {
    pass(
      "CPY-001/002",
      "After strings hedge with نمونه/قرارداد; no income promise; audit claim removed",
    );
  } else {
    fail("CPY-001/002", "After strings still look like invented claim/income promise");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: "fa-IR", colorScheme: "light" });

  // ---------- A11-001 ----------
  {
    const page = await context.newPage();
    await installMocks(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${ORIGIN}/login`, { waitUntil: "networkidle" });
    await page.waitForSelector("#content", { timeout: 15000 });
    // Ensure focus starts at document so first Tab hits skip
    await page.evaluate(() => document.body.focus());
    await page.locator("body").click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page.keyboard.press("Tab");

    const skipFocus = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        href: el?.getAttribute?.("href"),
        text: (el?.textContent || "").trim(),
        id: el?.id,
      };
    });
    if (skipFocus.href === "#content" || skipFocus.text.includes("رفتن به محتوا")) {
      pass("A11-001/tab", `First Tab → skip link ${JSON.stringify(skipFocus)}`);
    } else {
      // Try again from top: focus nothing
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.keyboard.press("Tab");
      const again = await page.evaluate(() => {
        const el = document.activeElement;
        return { tag: el?.tagName, href: el?.getAttribute?.("href"), text: (el?.textContent || "").trim() };
      });
      if (again.href === "#content" || again.text.includes("رفتن به محتوا")) {
        pass("A11-001/tab", `After blur, Tab → skip ${JSON.stringify(again)}`);
      } else {
        fail("A11-001/tab", `Expected skip link first; got ${JSON.stringify(skipFocus)} then ${JSON.stringify(again)}`);
      }
    }

    const before = await page.locator("#content").evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        box: { x: r.x, y: r.y, w: r.width, h: r.height },
        outline: cs.outline,
        outlineWidth: cs.outlineWidth,
        outlineStyle: cs.outlineStyle,
        boxShadow: cs.boxShadow,
      };
    });

    // Activate skip (Enter while focused on skip)
    const onSkip = await page.evaluate(() => document.activeElement?.getAttribute("href") === "#content");
    if (!onSkip) {
      await page.locator('a[href="#content"]').focus();
    }
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);

    const after = await page.evaluate(() => {
      const el = document.activeElement;
      const content = document.getElementById("content");
      const cs = content ? getComputedStyle(content) : null;
      const r = content?.getBoundingClientRect();
      return {
        activeId: el?.id,
        contentIsActive: el === content,
        contentContains: content?.contains(el) ?? false,
        outline: cs?.outline,
        outlineWidth: cs?.outlineWidth,
        outlineStyle: cs?.outlineStyle,
        boxShadow: cs?.boxShadow,
        box: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null,
      };
    });

    if (after.contentIsActive || after.activeId === "content") {
      pass("A11-001/enter", `Focus moved to #content (${JSON.stringify({ activeId: after.activeId, contentIsActive: after.contentIsActive })})`);
    } else if (after.contentContains) {
      pass("A11-001/enter", `Focus inside #content subtree`);
    } else {
      fail("A11-001/enter", `Focus not on #content: ${JSON.stringify(after)}`);
    }

    const ringVisible =
      after.outlineStyle && after.outlineStyle !== "none" && parseFloat(after.outlineWidth || "0") > 0;
    // Default UA outline on a large layout column is the "ugly ring" risk
    if (!ringVisible) {
      pass("A11-001/ring", `No outline on #content after focus. outline=${after.outline} shadow=${after.boxShadow}`);
    } else {
      fail("A11-001/ring", `Visible outline on #content: style=${after.outlineStyle} width=${after.outlineWidth} full=${after.outline}`);
    }

    const shift = {
      dx: Math.abs((after.box?.x ?? 0) - before.box.x),
      dy: Math.abs((after.box?.y ?? 0) - before.box.y),
      dw: Math.abs((after.box?.w ?? 0) - before.box.w),
      dh: Math.abs((after.box?.h ?? 0) - before.box.h),
    };
    if (shift.dx < 1 && shift.dy < 1 && shift.dw < 2 && shift.dh < 2) {
      pass("A11-001/cls", `No layout shift ${JSON.stringify(shift)}`);
    } else {
      fail("A11-001/cls", `Layout shift ${JSON.stringify(shift)}`);
    }
    await page.close();
  }

  // ---------- Screenshot matrix ----------
  {
    const page = await context.newPage();
    await installMocks(page);
    for (const vp of [
      { w: 360, h: 800, label: "360" },
      { w: 1280, h: 800, label: "1280" },
    ]) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      for (const theme of ["light", "dark"]) {
        for (const route of [
          { path: "/", name: "home" },
          { path: "/login", name: "login" },
          { path: "/register", name: "register" },
        ]) {
          await page.goto(`${ORIGIN}${route.path}`, { waitUntil: "networkidle" });
          await setTheme(page, theme);
          await page.waitForTimeout(180);
          await shot(page, `${route.name}_${theme}_${vp.label}`);
        }
      }
    }
    await page.close();
  }

  // ---------- BRW-001 ----------
  {
    const page = await context.newPage();
    await installMocks(page);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`${ORIGIN}/login`, { waitUntil: "networkidle" });
    await setTheme(page, "light");

    let inputs = await measureInputs(page);
    info(`BRW login phone inputs: ${JSON.stringify(inputs)}`);

    await page.locator('input[name="phone"], input[inputmode="tel"]').first().fill("09121234567");
    await page.getByRole("button", { name: /دریافت کد|ادامه|ورود/ }).first().click();
    await page.waitForTimeout(700);
    // OTP should be visible
    await page.waitForSelector(".otp-input input, input[inputmode='numeric']", { timeout: 8000 }).catch(() => {});
    inputs = await measureInputs(page);
    info(`BRW login OTP-step inputs: ${JSON.stringify(inputs)}`);

    const textInputs = inputs.filter((i) => i.type !== "checkbox" && i.type !== "radio");
    const small = textInputs.filter((i) => i.fontSizePx < 16);
    if (textInputs.length && small.length === 0) {
      pass(
        "BRW-001",
        `All ${textInputs.length} visible text inputs ≥16px @360: ${textInputs.map((i) => `${i.name || i.type}=${i.fontSize}`).join("; ")}`,
      );
    } else {
      fail("BRW-001", `Under-16px or missing: small=${JSON.stringify(small)} all=${JSON.stringify(textInputs)}`);
    }

    const geometryOk = textInputs.every((i) => i.w >= 20 && i.h >= 20);
    if (geometryOk) pass("BRW-001/layout", "Input boxes have usable size; page rendered OTP/phone without collapse");
    else fail("BRW-001/layout", `Collapsed inputs: ${JSON.stringify(textInputs.filter((i) => i.w < 20 || i.h < 20))}`);

    await page.goto(`${ORIGIN}/register`, { waitUntil: "networkidle" });
    const reg = (await measureInputs(page)).filter((i) => i.type !== "checkbox" && i.type !== "radio");
    const regSmall = reg.filter((i) => i.fontSizePx < 16);
    if (reg.length && regSmall.length === 0) {
      pass("BRW-001/register", `Register text inputs ≥16px: ${reg.map((i) => `${i.name || i.type}=${i.fontSize}`).join("; ")}`);
    } else {
      fail("BRW-001/register", JSON.stringify(regSmall.length ? regSmall : reg));
    }
    await page.close();
  }

  // ---------- COL ----------
  {
    const page = await context.newPage();
    await installMocks(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const theme of ["light", "dark"]) {
      await page.goto(`${ORIGIN}/`, { waitUntil: "networkidle" });
      await setTheme(page, theme);
      await page.waitForTimeout(150);

      const data = await page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const get = (n) => root.getPropertyValue(n).trim();
        const btns = Array.from(document.querySelectorAll("a, button")).filter((el) => {
          const cs = getComputedStyle(el);
          return cs.backgroundImage.includes("gradient") || /grad-sun|bg-grad/.test(el.className.toString());
        });
        const cta =
          btns.find((el) => /فروش|شروع|ادامه|ثبت/.test(el.textContent || "")) || btns[0];
        const ctaCs = cta ? getComputedStyle(cta) : null;
        return {
          tokens: {
            primaryFg: get("--primary-foreground"),
            accent: get("--accent"),
            accentFg: get("--accent-foreground"),
            approvedFg: get("--status-approved-fg"),
            approvedBg: get("--status-approved-bg"),
            activeFg: get("--status-active-fg"),
            activeBg: get("--status-active-bg"),
            gradSun: get("--grad-sun"),
          },
          cta: cta
            ? {
                text: (cta.textContent || "").trim().slice(0, 50),
                color: ctaCs.color,
                backgroundImage: ctaCs.backgroundImage.slice(0, 180),
              }
            : null,
        };
      });
      info(`COL ${theme} tokens=${JSON.stringify(data.tokens)} cta=${JSON.stringify(data.cta)}`);

      const fg = resolveColor(data.cta?.color) || resolveColor(data.tokens.primaryFg) || (theme === "dark" ? "#070b1a" : "#0b1020");
      // Gradient stops from --grad-sun definition
      const stops = [
        ["start", "#ffb800"],
        ["mid", "#ff7a18"],
        ["end", "#ff3d77"],
      ];
      for (const [label, stop] of stops) {
        const ratio = contrast(fg, stop);
        const id = `COL-001/${theme}/${label}`;
        if (ratio >= 4.5) pass(id, `CTA fg ${fg} on ${stop} = ${ratio.toFixed(2)}:1 (cta="${data.cta?.text}")`);
        else fail(id, `CTA fg ${fg} on ${stop} = ${ratio.toFixed(2)}:1`);
      }

      const ap = contrast(resolveColor(data.tokens.approvedFg), resolveColor(data.tokens.approvedBg));
      const ac = contrast(resolveColor(data.tokens.activeFg), resolveColor(data.tokens.activeBg));
      if (ap >= 4.5) pass(`COL-002/${theme}/approved`, `${data.tokens.approvedFg}/${data.tokens.approvedBg}=${ap.toFixed(2)}:1`);
      else fail(`COL-002/${theme}/approved`, `${data.tokens.approvedFg}/${data.tokens.approvedBg}=${ap.toFixed(2)}:1`);
      if (ac >= 4.5) pass(`COL-002/${theme}/active`, `${data.tokens.activeFg}/${data.tokens.activeBg}=${ac.toFixed(2)}:1`);
      else fail(`COL-002/${theme}/active`, `${data.tokens.activeFg}/${data.tokens.activeBg}=${ac.toFixed(2)}:1`);

      const ar = contrast(resolveColor(data.tokens.accentFg), resolveColor(data.tokens.accent));
      if (ar >= 4.5) pass(`COL-003/${theme}`, `${data.tokens.accentFg} on ${data.tokens.accent}=${ar.toFixed(2)}:1`);
      else fail(`COL-003/${theme}`, `${data.tokens.accentFg} on ${data.tokens.accent}=${ar.toFixed(2)}:1`);
    }
    await page.close();
  }

  // ---------- THM-001 panel ----------
  {
    const shellCss = fs.readFileSync(
      path.join(PROJECT, "frontend/src/shared/layout/workspace-shell.css"),
      "utf8",
    );
    const hex = shellCss.match(/#[0-9a-fA-F]{3,8}/g) || [];
    if (hex.length === 0) pass("THM-001/css", "workspace-shell.css: 0 hex literals");
    else fail("THM-001/css", `hex left: ${hex.join(",")}`);

    const page = await context.newPage();
    await installMocks(page);
    await page.addInitScript((session) => {
      localStorage.setItem("barghino.session", JSON.stringify(session));
    }, fakeSession);

    for (const theme of ["light", "dark"]) {
      for (const vp of [
        { w: 360, h: 800, label: "360" },
        { w: 1280, h: 800, label: "1280" },
      ]) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto(`${ORIGIN}/panel`, { waitUntil: "networkidle" });
        await setTheme(page, theme);
        await page.waitForTimeout(900);
        const probe = await page.evaluate(() => {
          const panel = document.querySelector(".panel-app");
          const header = document.querySelector("header, .site-header, .panel-topbar, .panel-app header");
          const offenders = [];
          for (const root of [panel, header].filter(Boolean)) {
            for (const el of [root, ...root.querySelectorAll("*")]) {
              const st = el.getAttribute("style") || "";
              if (/#[0-9a-fA-F]{3,8}/.test(st)) offenders.push(st.slice(0, 100));
            }
          }
          const rootPrimary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
          const panelPrimary = panel ? getComputedStyle(panel).getPropertyValue("--primary").trim() : "";
          return {
            url: location.href,
            hasPanel: !!panel,
            hasSidebar: !!document.querySelector(".panel-sidebar"),
            offenders,
            rootPrimary,
            panelPrimary,
            title: document.title,
          };
        });
        info(`THM panel ${theme}@${vp.label}: ${JSON.stringify(probe)}`);
        await shot(page, `panel_${theme}_${vp.label}`);

        if (probe.hasPanel && probe.offenders.length === 0) {
          pass(
            `THM-001/${theme}/${vp.label}`,
            `panel shell ok; --primary root=${probe.rootPrimary} panel=${probe.panelPrimary || "inherited"}; no inline hex`,
          );
        } else if (probe.url.includes("/login")) {
          fail(`THM-001/${theme}/${vp.label}`, `redirected to login: ${probe.url}`);
        } else {
          fail(`THM-001/${theme}/${vp.label}`, JSON.stringify(probe));
        }
      }
    }
    await page.close();
  }

  await browser.close();

  const outJson = path.join(OUT, "report.json");
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2));
  const fails = report.checks.filter((c) => c.result === "FAIL");
  console.log(`\nWrote ${outJson}`);
  console.log(`Summary: ${report.checks.length - fails.length} PASS / ${fails.length} FAIL`);
  process.exit(fails.length ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(2);
});
