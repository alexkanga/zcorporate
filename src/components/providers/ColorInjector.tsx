import { db } from "@/lib/db";

/**
 * Server component that injects brand colors into the document
 * This runs on the server and sets CSS variables before the page renders
 */
export async function ColorInjector() {
  // Fetch colors from database
  const settings = await db.siteSettings.findUnique({
    where: { id: "site-settings" },
    select: { color1: true, color2: true, color3: true, color4: true },
  });
  
  // Default colors if not found
  const colors = {
    color1: settings?.color1 || "#362981",
    color2: settings?.color2 || "#009446",
    color3: settings?.color3 || "#029CB1",
    color4: settings?.color4 || "#9AD2E2",
  };
  
  // Generate CSS that sets variables on :root
  const css = `
    :root {
      --color-primary: ${colors.color1};
      --color-secondary: ${colors.color2};
      --color-accent: ${colors.color3};
      --color-accent-light: ${colors.color4};
    }
  `;
  
  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      id="brand-colors-inline"
    />
  );
}
