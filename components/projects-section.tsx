"use client"

import { Container } from "@/components/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { projects } from "@/data/projects"
import { motion } from "framer-motion"
import { Calendar, Folder } from "lucide-react"
import { trackProjectView } from "@/lib/analytics"

export function ProjectsSection() {
  return (
    <section id="projects" className="py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-josefin text-3xl sm:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Key projects showcasing expertise in Azure AI, API Management, and enterprise solutions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => trackProjectView(project.title, project.category)}
              className="cursor-pointer"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Folder className="h-6 w-6 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{project.startDate} - {project.endDate}</span>
                    </div>
                  </div>
                  <CardTitle className="font-josefin text-lg leading-tight group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    <Badge variant="secondary" className="mt-1">{project.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 4} more
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-1 text-xs">
                    {project.highlights.slice(0, 2).map((highlight, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                        <span className="line-clamp-2">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
