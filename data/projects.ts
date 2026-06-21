export interface Project {
  title: string
  startDate: string
  endDate: string
  description: string
  highlights: string[]
  technologies: string[]
  category: string
}

export const projects: Project[] = [
  {
    title: "AI Portfolio Assistant (this site)",
    startDate: "05/2026",
    endDate: "Present",
    category: "Personal Project",
    description: "The retrieval assistant on this page. A self-built conversational AI with zero runtime LLM cost and no third-party CRM, entirely my own IP.",
    technologies: ["Go", "Hugot (pure-Go transformer)", "RAG", "Azure Functions", "WebAuthn", "Web Push"],
    highlights: [
      "Built a 105-entry retrieval knowledge base on a pure-Go embedded transformer (Hugot), with no Python and no per-query LLM cost",
      "Designed a 9-state intent state machine with keyword, regex, and fuzzy fallback matching",
      "Shipped a passkey-secured (WebAuthn) admin PWA with Web Push lead notifications",
      "Deployed on Azure Functions via GitHub Actions with OIDC, running at $0/month on free tiers",
    ],
  },
  {
    title: "Healthcare AI Compliance Platform",
    startDate: "01/2026",
    endDate: "Present",
    category: "AI & LLM",
    description: "Architected a regulated, multi-tenant healthcare AI platform that turns compliance review into a verifiable, automated workflow.",
    technologies: ["LangGraph", "Multi-Agent Orchestration", "Azure Container Apps", "Azure OpenAI", "FastAPI", "Azure SQL"],
    highlights: [
      "Designed a LangGraph multi-agent pipeline on Azure for end-to-end compliance analysis",
      "Engineered a tamper-evident cryptographic evidence chain with hardware-backed signing",
      "Produced standards-based interoperable output for downstream healthcare systems",
      "Enforced multi-tenant isolation and a strict data-protection boundary",
    ],
  },
  {
    title: "Enterprise AI Assistant (iaim.io)",
    startDate: "09/2024",
    endDate: "Present",
    category: "AI & LLM",
    description: "Designed, built, and operate the production AI assistant live at iaim.io.",
    technologies: ["Azure Functions", "Azure AI Search", "Azure OpenAI", "RAG", "XState", "Azure Monitor"],
    highlights: [
      "Built a custom Azure-native assistant: Azure Functions, Azure AI Search for RAG, and Azure OpenAI",
      "Refactored the conversation engine to an XState v5 state machine",
      "Added a 15-alert monitoring stack with synthetic tests and an IT runbook",
      "Runs in production at roughly $2-3/month",
    ],
  },
  {
    title: "Multi-Agent Assistant Platform",
    startDate: "01/2025",
    endDate: "Present",
    category: "AI & LLM",
    description: "Led a multi-agent assistant platform across multiple environments with a connector and OAuth integration framework.",
    technologies: ["LangGraph", "Cosmos DB", "Redis", "Azure AI Search", "Terraform / Bicep", "Azure DevOps"],
    highlights: [
      "Built dev, QA, and demo environments on shared AI infrastructure",
      "Designed a connector and OAuth framework for third-party integrations",
      "Established a comprehensive automated test suite (~400 tests)",
      "Authored Terraform and Bicep Infrastructure as Code and Azure DevOps CI/CD pipelines",
    ],
  },
  {
    title: "Integrated Identity & Access Governance",
    startDate: "01/2017",
    endDate: "06/2018",
    category: "Security & Identity",
    description: "Engineered API Gateway policies using OAuth 2.0 and OIDC for robust authentication and SCIM-based identity management.",
    technologies: ["Layer7 API Gateway", "OAuth 2.0", "OIDC", "SCIM", "REST APIs", "JWT", "Swagger/OpenAPI"],
    highlights: [
      "Engineered API Gateway policies using OAuth 2.0 and OIDC protocols for robust authentication",
      "Implemented SCIM-based identity management using REST APIs and JSON Web Tokens",
      "Created comprehensive API documentation using Swagger/OpenAPI specifications",
      "Established rapid incident response protocols, maintaining high service availability",
    ],
  },
  {
    title: "Fintech API Gateway Modernization",
    startDate: "08/2019",
    endDate: "01/2020",
    category: "Financial Services",
    description: "Designed and deployed a robust API gateway solution for the finance sector with CI/CD automation and rigorous testing.",
    technologies: ["Layer7 API Gateway", "JavaScript", "Groovy", "CI/CD", "Postman", "JMeter"],
    highlights: [
      "Implemented API Gateway policies using JavaScript and Groovy for advanced request processing",
      "Built automated CI/CD pipelines optimizing deployment efficiency and reliability",
      "Established comprehensive API testing frameworks using industry-standard tools",
      "Integrated secure development lifecycle practices ensuring robust API security",
    ],
  },
]
