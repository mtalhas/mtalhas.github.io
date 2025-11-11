"use client"

import { useState, useEffect } from "react"
import Cal, { getCalApi } from "@calcom/embed-react"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface MeetingOption {
  id: string
  label: string
  duration: string
  calLink: string
  description: string
  icon: string
}

const meetingOptions: MeetingOption[] = [
  {
    id: "15min",
    label: "Quick Chat",
    duration: "15 minutes",
    calLink: "mtalhas/15min",
    description: "Perfect for quick questions or brief updates",
    icon: "⚡",
  },
  {
    id: "30min",
    label: "Deep Dive",
    duration: "30 minutes",
    calLink: "mtalhas/30min",
    description: "Ideal for detailed discussions and planning",
    icon: "🎯",
  },
]

export function CalScheduler() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("15min")

  const activeOption = meetingOptions.find((opt) => opt.id === activeTab)
  const calTheme = resolvedTheme === "dark" ? "dark" : "light"

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize Cal.com API with theme
  useEffect(() => {
    if (!mounted) return

    ;(async function () {
      const cal = await getCalApi()
      cal("ui", {
        theme: calTheme,
        styles: {
          branding: {
            brandColor: calTheme === "dark" ? "#A78BFA" : "#7C3AED",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      })
    })()
  }, [calTheme, mounted])

  // Show loading placeholder during hydration
  if (!mounted) {
    return (
      <Card>
        <CardContent className="min-h-[600px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Meeting Type Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {meetingOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveTab(option.id)}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all relative ${
              activeTab === option.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{option.icon}</span>
              <div className="font-josefin font-bold text-lg">{option.label}</div>
              <div className="text-xs opacity-75">{option.duration}</div>
            </div>
            {activeTab === option.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Active Meeting Description */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            {activeOption?.description}
          </p>
        </CardContent>
      </Card>

      {/* Calendar Embed - Conditional Rendering to Avoid Multiple Embed Bug */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {activeTab === "15min" && (
            <Cal
              namespace="15min"
              calLink="mtalhas/15min"
              style={{
                width: "100%",
                height: "600px",
                overflow: "scroll",
              }}
              config={{
                layout: "month_view",
                theme: calTheme,
              }}
            />
          )}
          {activeTab === "30min" && (
            <Cal
              namespace="30min"
              calLink="mtalhas/30min"
              style={{
                width: "100%",
                height: "600px",
                overflow: "scroll",
              }}
              config={{
                layout: "month_view",
                theme: calTheme,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Alternative Contact Info */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Prefer email?{" "}
            <a
              href="mailto:mtalha.dev@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              mtalha.dev@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
