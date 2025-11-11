export interface SkillCategory {
  category: string
  level: "Expert" | "Advanced" | "Proficient" | "Competent"
  skills: string[]
}

export const skillCategories: SkillCategory[] = [
  {
    category: "Web Development",
    level: "Expert",
    skills: ["Python", "ASP.NET", "Javascript"],
  },
  {
    category: "DevOps",
    level: "Advanced",
    skills: ["Terraform", "AWS", "Azure"],
  },
  {
    category: "Software Architecture",
    level: "Advanced",
    skills: ["Scalability", "Modularity", "Resilience", "API design", "Performance"],
  },
  {
    category: "Software Development",
    level: "Proficient",
    skills: ["Sustainability", "Portability", "Scalability"],
  },
  {
    category: "Problem Solving",
    level: "Advanced",
    skills: ["Troubleshooting", "Root Cause Analysis", "Debugging", "Optimization"],
  },
  {
    category: "Draft documentation",
    level: "Proficient",
    skills: ["docsify", "Github", "MARP", "Joplin", "MermaidJS", "Form.IO"],
  },
  {
    category: "Communication",
    level: "Competent",
    skills: ["face-2-face", "emails", "presentations", "layman conversions", "1:1s"],
  },
]

// Skill level percentages for progress bars
export const skillLevelPercentages = {
  Expert: 95,
  Advanced: 80,
  Proficient: 65,
  Competent: 50,
}
