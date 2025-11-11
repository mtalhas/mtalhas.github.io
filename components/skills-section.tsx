"use client"

import * as React from "react"
import { Container } from "@/components/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { skillCategories, skillLevelPercentages } from "@/data/skills"
import { motion, useInView } from "framer-motion"

interface SkillProgressBarProps {
  level: keyof typeof skillLevelPercentages
  delay: number
}

function SkillProgressBar({ level, delay }: SkillProgressBarProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })
  const percentage = skillLevelPercentages[level]

  const getColorClass = () => {
    switch (level) {
      case "Expert":
        return "bg-green-500"
      case "Advanced":
        return "bg-blue-500"
      case "Proficient":
        return "bg-yellow-500"
      case "Competent":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{level}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColorClass()} rounded-full`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export function SkillsSection() {
  return (
    <section id="skills" className="py-20 bg-muted/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-josefin text-3xl sm:text-4xl font-bold mb-4">
            Skills & Expertise
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technical competencies across development, DevOps, and architecture
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="font-josefin text-lg">
                    {category.category}
                  </CardTitle>
                  <SkillProgressBar level={category.level} delay={index * 0.1 + 0.3} />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Languages & Interests */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-josefin text-lg">Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Urdu</span>
                  <Badge variant="outline">Native speaker</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">English</span>
                  <Badge variant="outline">Fluent</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-josefin text-lg">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <p className="font-medium">Software based home solutions</p>
                      <p className="text-muted-foreground text-xs">Nextcloud, Odoo, Kodi</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <div>
                      <p className="font-medium">Watching documentaries</p>
                      <p className="text-muted-foreground text-xs">TED Talks, Kurzgesagt, PBS Space Time</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
