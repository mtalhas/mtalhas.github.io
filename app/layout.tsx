import type { Metadata } from "next"
import Script from "next/script"
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
  title: "M. Talha Siddiqui - AI/LLM Tech Lead | Solutions Architect",
  description: "Solutions architect with over 10 years in enterprise API and integration platforms, now leading AI engineering: conversational AI, RAG systems, and multi-agent orchestration across Azure, IBM watsonx, and open-source models.",
  keywords: ["Solutions Architect", "AI Engineer", "AI Engineering", "Agentic AI", "Multi-Agent Orchestration", "LangGraph", "LLM", "LLM Evaluation", "RAG", "MCP", "Azure OpenAI", "Azure AI Foundry", "API Gateway", "Layer7", "Integration Platforms", "Cloud", "DevOps"],
  authors: [{ name: "M. Talha Siddiqui", url: "https://mtalhas.github.io" }],
  creator: "M. Talha Siddiqui",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mtalhas.github.io",
    title: "M. Talha Siddiqui - AI/LLM Tech Lead | Solutions Architect",
    description: "A decade in enterprise API and integration platforms, now leading AI engineering: conversational AI, RAG systems, and multi-agent orchestration across Azure, IBM watsonx, and open-source models.",
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
    title: "M. Talha Siddiqui - AI/LLM Tech Lead | Solutions Architect",
    description: "AI/LLM tech lead and solutions architect bridging enterprise API platforms and AI engineering across Azure, IBM watsonx, and open-source models.",
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
        <Script
          src="/chatbot/chatbot.js"
          strategy="lazyOnload"
          data-chat-endpoint="https://func-mtalhas-chat-prod-fx.azurewebsites.net/api"
          data-cal-15="https://cal.com/mtalhas/15min?utm_source=chatbot&utm_medium=site&utm_campaign=portfolio"
          data-cal-30="https://cal.com/mtalhas/30min?utm_source=chatbot&utm_medium=site&utm_campaign=portfolio"
        />
      </body>
    </html>
  )
}
