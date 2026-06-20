export interface SkillCategory {
  category: string
  skills: string[]
}

// Capability groups, intentionally unrated. Seniority is signalled by the
// breadth and specificity of the stack, not by self-assigned percentages.
export const skillCategories: SkillCategory[] = [
  {
    category: "AI & LLM Engineering",
    skills: [
      "Azure OpenAI",
      "RAG Systems",
      "Multi-Agent Orchestration",
      "Prompt Engineering",
      "Model Evaluation",
      "IBM watsonx",
    ],
  },
  {
    category: "API & Integration Platforms",
    skills: [
      "Layer7 API Gateway",
      "OAuth 2.0 / OIDC",
      "REST API Design",
      "SCIM",
      "API Security",
      "Reverse Proxy Architecture",
    ],
  },
  {
    category: "Cloud & DevOps",
    skills: ["Azure", "AWS", "Terraform", "Docker", "Kubernetes", "CI/CD", "Azure DevOps"],
  },
  {
    category: "Languages & Frameworks",
    skills: ["Python", "TypeScript / JavaScript", "ASP.NET", "React", "Bash", "Groovy"],
  },
  {
    category: "Observability & Reliability",
    skills: ["Azure Monitor", "Application Insights", "ELK / Kibana", "JMeter", "Postman"],
  },
  {
    category: "Architecture & Delivery",
    skills: [
      "Solution Architecture",
      "Scalability",
      "Resilience",
      "Secure SDLC",
      "Performance",
      "Technical Documentation",
    ],
  },
]
