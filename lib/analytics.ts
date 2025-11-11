// Google Analytics 4 Event Tracking Helper Functions

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams)
  }
}

// Contact Form Submission
export const trackContactSubmission = (formLocation: string = "homepage") => {
  trackEvent("form_submission", {
    form_name: "contact",
    form_location: formLocation,
  })
}

// Resume Download
export const trackResumeDownload = (fileType: string = "pdf", source: string = "nav") => {
  trackEvent("file_download", {
    file_name: `resume.${fileType}`,
    file_type: fileType,
    source: source,
  })
}

// Calendar CTA Click
export const trackCalendarClick = (location: string, eventType: string = "consultation") => {
  trackEvent("calendar_cta_click", {
    location: location,
    event_type: eventType,
  })
}

// Newsletter Signup
export const trackNewsletterSignup = (method: string = "mailerlite") => {
  trackEvent("newsletter_signup", {
    method: method,
  })
}

// Project View
export const trackProjectView = (projectName: string, category: string = "featured") => {
  trackEvent("project_view", {
    project_name: projectName,
    project_category: category,
  })
}

// Social Link Click
export const trackSocialClick = (platform: string, location: string = "header") => {
  trackEvent("social_click", {
    platform: platform,
    location: location,
  })
}

// Dark Mode Toggle
export const trackThemeToggle = (fromTheme: string, toTheme: string) => {
  trackEvent("dark_mode_toggle", {
    from_theme: fromTheme,
    to_theme: toTheme,
  })
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}
