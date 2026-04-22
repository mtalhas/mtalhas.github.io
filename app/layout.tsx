import type { Metadata } from "next"
import { Josefin_Sans, Lato } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@/components/analytics"
import { Toaster } from "@/components/ui/toaster"

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-josefin",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "M. Talha Siddiqui - AI/ML Tech Lead | Solutions Architect",
  description: "AI/LLM leader with over 10 years of experience in software engineering, cloud architecture, and enterprise systems. Building production-grade AI agents, RAG systems, and multi-agent orchestration solutions.",
  keywords: ["AI", "LLM", "Machine Learning", "Solutions Architect", "Azure OpenAI", "RAG", "Multi-Agent", "Cloud Computing", "DevOps", "API Management"],
  authors: [{ name: "M. Talha Siddiqui", url: "https://mtalhas.github.io" }],
  creator: "M. Talha Siddiqui",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mtalhas.github.io",
    title: "M. Talha Siddiqui - AI/ML Tech Lead | Solutions Architect",
    description: "AI/LLM leader building production-grade AI agents, RAG systems, and multi-agent orchestration solutions across Azure, IBM watsonx, and open-source platforms.",
    siteName: "M. Talha Siddiqui Portfolio",
    images: [{
      url: "https://s.gravatar.com/avatar/e995c3c7d4395ab283924b105fc6f2a2?s=400",
      width: 400,
      height: 400,
      alt: "M. Talha Siddiqui",
    }],
  },
  twitter: {
    card: "summary",
    title: "M. Talha Siddiqui - Software Engineer",
    description: "Software Engineer specializing in Azure, AI, and API Management",
    creator: "@mdtalhas",
    images: ["https://s.gravatar.com/avatar/e995c3c7d4395ab283924b105fc6f2a2?s=400"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${josefinSans.variable} ${lato.variable}`}>
      <body className="font-lato antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
