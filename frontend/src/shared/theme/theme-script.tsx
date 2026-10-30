import { THEME_STORAGE_KEY } from "./theme-types";

/**
 * Blocking boot script — defaultTheme "system", class attribute, no flash.
 */
export function ThemeScript() {
  const code = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=document.documentElement;var dark=t==="dark"||((t!=="light")&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark);d.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
