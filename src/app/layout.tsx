import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { CustomFontLoader } from "@/components/CustomFontLoader";

export const metadata: Metadata = {
  title: "MD MUBAROK HOSIN | Web Developer - Portfolio",
  description:
    "Professional portfolio of MD MUBAROK HOSIN - A passionate Web Developer from Bangladesh specializing in modern web technologies like React, Next.js, TypeScript, and Node.js.",
  keywords: [
    "MD MUBAROK HOSIN", "Web Developer", "Bangladesh", "Portfolio",
    "Frontend Developer", "Full Stack Developer", "React", "Next.js",
    "TypeScript", "Node.js", "UI/UX Design", "Tailwind CSS",
  ],
  authors: [{ name: "MD MUBAROK HOSIN" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <CustomFontLoader />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}