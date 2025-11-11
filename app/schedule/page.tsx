import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Schedule a Consultation - M. Talha Siddiqui",
  description: "Book a free consultation to discuss your project needs",
}

export default function SchedulePage() {
  return (
    <main className="min-h-screen py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-josefin text-4xl font-bold mb-4">
              Schedule a Consultation
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a time that works best for you to discuss your project needs
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-josefin">Cal.com Integration</CardTitle>
              <CardDescription>
                Calendar booking will be embedded here
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[600px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Cal.com calendar widget will be embedded here.
                  <br />
                  Please configure your Cal.com account and add the embed code.
                </p>
                <p className="text-sm text-muted-foreground">
                  For now, you can reach me at:{" "}
                  <a
                    href="mailto:mtalha.dev@gmail.com"
                    className="text-primary hover:underline"
                  >
                    mtalha.dev@gmail.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions for adding Cal.com */}
          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">To add Cal.com integration:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Create a free account at cal.com</li>
                <li>Set up your event types (15-min, 30-min, 60-min)</li>
                <li>Get your embed code from Cal.com dashboard</li>
                <li>Replace the placeholder content above with the Cal.com embed</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </Container>
    </main>
  )
}
