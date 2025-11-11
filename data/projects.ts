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
    title: "Next-Generation Conversational AI Platform",
    startDate: "04/2024",
    endDate: "Present",
    category: "AI & Machine Learning",
    description: "Architected end-to-end technical design using Azure AI Bot Service integrated with Azure OpenAI Services for advanced natural language processing capabilities.",
    technologies: ["Azure AI Bot Service", "Azure OpenAI", "Azure APIM", "Azure AI Search", "Azure Cognitive Services", "Azure DevOps"],
    highlights: [
      "Architected end-to-end technical design using Azure AI Bot Service integrated with Azure OpenAI Services for advanced natural language processing capabilities",
      "Engineered real-time communication system leveraging Azure APIM Websockets and Azure AI Search for intelligent response routing",
      "Orchestrated ML pipeline development using Azure Cognitive Services, enabling contextual question-answering capabilities",
      "Established testing frameworks in Azure DevOps, incorporating continuous integration for rapid feature deployment",
      "Implemented data-driven sprint management through Azure Boards & Azure Devops Connector for Excel, tracking velocity metrics and enhancement cycles",
    ],
  },
  {
    title: "Enterprise Digital Transformation Initiative",
    startDate: "04/2024",
    endDate: "06/2024",
    category: "Cloud Architecture",
    description: "Developed comprehensive system architecture using Azure Solution Architect tools and PlantUML for clear visual documentation.",
    technologies: ["Azure", "PlantUML", "Azure DevOps", "Postman", "Azure Application Insights"],
    highlights: [
      "Developed comprehensive system architecture using Azure Solution Architect tools and PlantUML for clear visual documentation",
      "Leveraged Azure DevOps Boards and Wiki for requirements management and technical documentation",
      "Implemented testing pipelines using Azure Test Plans and Postman for performance validation",
      "Utilized Azure Application Insights for real-time system performance tracking within the chatbot codebase",
      "Orchestrated project delivery through Azure DevOps, maintaining detailed metrics on velocity and quality KPIs using Azure Devops Dashboard",
    ],
  },
  {
    title: "Iterative API Integration & Microservices Modernization",
    startDate: "06/2021",
    endDate: "12/2022",
    category: "API Development",
    description: "Built Twitter and AccuWeather integration APIs using Layer7 API Gateway, implementing OAuth2 security protocols.",
    technologies: ["Layer7 API Gateway", "OAuth2", "React", "Postman", "JMeter", "Docker Swarm"],
    highlights: [
      "Built Twitter and AccuWeather integration APIs using Layer7 API Gateway, implementing OAuth2 security protocols",
      "Engineered reverse proxy architecture for a React based Traintrack application",
      "Developed automated testing suites using Postman Collections and JMeter for load testing",
      "Utilized CI/CD for automated deployment pipelines, reducing deployment time by implementing Infrastructure as Code",
      "Orchestrated containerized deployments using Docker Swarm for enhanced scalability",
    ],
  },
  {
    title: "Fintech API Gateway Modernization",
    startDate: "08/2019",
    endDate: "01/2020",
    category: "Financial Services",
    description: "Implemented Layer7 API Gateway policies using JavaScript and Groovy for advanced request processing in the finance sector.",
    technologies: ["Layer7 API Gateway", "JavaScript", "Groovy", "CI/CD"],
    highlights: [
      "Implemented Layer7 API Gateway policies using JavaScript and Groovy for advanced request processing",
      "Provided cross-functional collaboration to align technical implementation with business requirements",
      "Implemented automated CI/CD pipelines optimizing deployment efficiency and reliability",
      "Established comprehensive API testing frameworks using industry-standard tools",
      "Integrated secure development lifecycle practices ensuring robust API security",
    ],
  },
  {
    title: "Integrated Identity & Access Governance Transformation",
    startDate: "01/2017",
    endDate: "06/2018",
    category: "Security & Identity",
    description: "Engineered Layer7 API Gateway policies using OAuth 2.0 and OIDC protocols for robust authentication.",
    technologies: ["Layer7 API Gateway", "OAuth 2.0", "OIDC", "SCIM", "REST APIs", "JWT", "Swagger/OpenAPI"],
    highlights: [
      "Engineered Layer7 API Gateway policies using OAuth 2.0 and OIDC protocols for robust authentication",
      "Implemented SCIM-based identity management using REST APIs and JSON Web Tokens",
      "Created comprehensive API documentation using Swagger/OpenAPI specifications",
      "Established rapid incident response protocols for API infrastructure, maintaining high service availability",
    ],
  },
]
