import type { Metadata } from "next"
import { Container } from "@/components/container"
import { Calendar } from "lucide-react"
import { CalScheduler } from "@/components/cal-scheduler"

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

          <CalScheduler />
        </div>
      </Container>
    </main>
  )
}
