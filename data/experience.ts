export interface Experience {
  company: string
  position: string
  startDate: string
  endDate: string
  location?: string
  summary: string
  highlights: string[]
}

export const experiences: Experience[] = [
  {
    company: "Architecture In Motion Inc.",
    position: "Senior Devops Engineer",
    startDate: "08/2017",
    endDate: "Present",
    summary: "Successfully implemented API Management solutions, Azure AI Services and improved client satisfaction. Developed custom solutions, automated testing, and reduced system downtime.",
    highlights: [
      "Leading the architecture and implementation of a secure realtime chatbot solution using Azure AI Bot Service along with Azure Cognitive Services and OpenAI Services",
      "Engineered and deployed enterprise-grade API Gateway solutions across multiple industries including finance and transportation, implementing OAuth2 and OIDC security protocols",
      "Developed automated CI/CD pipelines using Azure Devops, incorporating infrastructure as code practices for enhanced deployment reliability",
      "Established comprehensive testing frameworks using Postman, JMeter and Azure Test Plans, ensuring robust performance and security validation",
      "Orchestrated containerized deployments leveraging Docker and Kubernetes, while implementing monitoring solutions using Azure Monitor and Application Insights",
    ],
  },
  {
    company: "Architecture In Motion Inc.",
    position: "API-M Support Consultant",
    startDate: "08/2016",
    endDate: "08/2017",
    summary: "Supervised troubleshooting of production issues and renewed infrastructure with software patches. Automated routine tasks using Bash and API Gateway scripting, boosting productivity and efficiency.",
    highlights: [
      "Engineered and deployed enterprise-grade REST API security policies using Layer7 API Gateway, strengthening cyber defense capabilities",
      "Automated routine operational tasks through Bash scripting and API Gateway policy development, enhancing team productivity",
      "Implemented comprehensive system monitoring using Python for Systems Programming for proactive incident detection",
      "Directed system administration for Linux environments using advanced shell utilities (sed, awk, grep) and managed high-performance MySQL/Oracle SQL databases, resulting in 99.9% system uptime across Production and Lower environments",
      "Maximized ELK Stack capabilities by implementing advanced Lucene search queries in Kibana, enabling rapid root cause analysis and reducing mean time to resolution for production incidents",
    ],
  },
  {
    company: "GeekUnit Private Limited",
    position: "FrontEnd Web Developer",
    startDate: "01/2015",
    endDate: "08/2015",
    summary: "Designed and developed user-friendly web interfaces and implemented new features on existing applications. Collaborated with designers and developers to ensure seamless integration and optimized web page load times through efficient coding practices.",
    highlights: [
      "Designed and developed responsive and user-friendly web interfaces for multiple clients",
      "Implemented new features and functionality on existing web applications using HTML, CSS, and JavaScript",
      "Collaborated with UI/UX designers and backend developers to ensure seamless integration of front-end and back-end code",
      "Optimized web page load times through efficient coding practices and image optimization techniques",
      "Developed and maintained a component library to improve code reusability and consistency",
      "Utilized version control tools such as Git to manage code changes and collaborate with other developers",
      "Kept up-to-date with industry trends and best practices to continuously improve skills and stay current with emerging technologies",
    ],
  },
]
