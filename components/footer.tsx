import Link from "next/link"
import { Github, Linkedin, Twitter, Mail, MapPin, Phone, Globe } from "lucide-react"
import { NewsletterSignup } from "@/components/newsletter-signup"

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/mtalhas",
    icon: Github,
    username: "mtalhas",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/mtalhas",
    icon: Linkedin,
    username: "in/mtalhas",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/mdtalhas",
    icon: Twitter,
    username: "@mdtalhas",
  },
]

const contactInfo = [
  {
    icon: Mail,
    text: "mtalha.dev@gmail.com",
    href: "mailto:mtalha.dev@gmail.com",
  },
  {
    icon: Phone,
    text: "(0092) 3122853636",
    href: "tel:+923122853636",
  },
  {
    icon: MapPin,
    text: "Karachi, Pakistan",
    href: null,
  },
  {
    icon: Globe,
    text: "about.me/mtalhas",
    href: "https://www.about.me/mtalhas",
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-josefin text-lg font-bold">M. Talha Siddiqui</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experienced Software Engineer specializing in architecting cutting-edge solutions across AI, cloud, and enterprise systems.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-josefin text-lg font-bold">Contact</h3>
            <ul className="space-y-2">
              {contactInfo.map((item) => {
                const Icon = item.icon
                const content = (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.text}</span>
                  </span>
                )

                return (
                  <li key={item.text}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-josefin text-lg font-bold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get monthly insights on DevOps, API Design, and Azure
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} M. Talha Siddiqui. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                    aria-label={`Visit ${social.name} profile`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
