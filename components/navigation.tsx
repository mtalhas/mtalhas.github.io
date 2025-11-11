"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { trackResumeDownload } from "@/lib/analytics"

const navItems = [
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleResumeDownload = () => {
    trackResumeDownload("pdf", "nav")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-josefin text-xl font-bold tracking-tight hover:text-primary transition-colors"
          >
            M. Talha Siddiqui
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="transition-all hover:scale-105"
                asChild
              >
                <a
                  href="/resume.pdf"
                  download
                  onClick={handleResumeDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 px-3">
              <Button
                variant="outline"
                className="w-full justify-center"
                asChild
              >
                <a
                  href="/resume.pdf"
                  download
                  onClick={() => {
                    handleResumeDownload()
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
