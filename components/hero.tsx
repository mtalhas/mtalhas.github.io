"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { ArrowDown, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-20">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="font-josefin text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                M. Talha Siddiqui
              </h1>
              <h2 className="font-josefin text-xl sm:text-2xl lg:text-3xl font-light text-muted-foreground mt-2">
                Software Engineer
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl"
            >
              I am an experienced Software Engineer with proven expertise in architecting and implementing cutting-edge solutions across AI, cloud, and enterprise systems. Demonstrated success in spearheading next-generation conversational AI platforms using Azure's advanced services while delivering enterprise-grade API solutions for finance and transportation sectors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={scrollToProjects}
                className="group transition-all hover:scale-105"
              >
                View My Work
                <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToContact}
                className="group transition-all hover:scale-105"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Let's Talk
              </Button>
            </motion.div>
          </motion.div>

          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-2xl opacity-20 animate-pulse" />
              <Image
                src="https://s.gravatar.com/avatar/e995c3c7d4395ab283924b105fc6f2a2?s=400"
                alt="M. Talha Siddiqui"
                width={400}
                height={400}
                className="relative rounded-full border-4 border-secondary shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
