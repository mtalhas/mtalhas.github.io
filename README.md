# M. Talha Siddiqui - Portfolio Website

A modern, responsive portfolio website built with Next.js 15, TypeScript, and Tailwind CSS. Features subtle animations, dark mode, and comprehensive analytics.

🌐 **Live Site**: [https://mtalhas.github.io](https://mtalhas.github.io)

## Source of Truth

- **Azure DevOps**: [openworkshop/PiLabs/mtalhas.github.io](https://dev.azure.com/openworkshop/PiLabs/_git/mtalhas.github.io) holds the code, pull requests and builds. It is the owner's private working repo.
- **GitHub**: `main` is a mirror, written only by the Azure Pipelines `mirror-site` pipeline.

## ✨ Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Dark Mode**: System-aware theme with smooth transitions
- **Animations**: Subtle Framer Motion animations (respects user preferences)
- **Contact Form**: Web3Forms integration (no backend needed)
- **Analytics**: Microsoft Clarity + Google Analytics 4
- **SEO Optimized**: Metadata API, Open Graph, structured data
- **Performance**: Static generation, 189kB First Load JS
- **Accessibility**: WCAG AA compliant

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mtalhas/mtalhas.github.io.git
cd mtalhas.github.io

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site.

### Build for Production

```bash
npm run build
# Output will be in the /out directory
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── schedule/          # Calendar booking page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── navigation.tsx     # Header
│   ├── hero.tsx           # Hero section
│   ├── projects-section.tsx
│   ├── experience-section.tsx
│   ├── skills-section.tsx
│   ├── contact-section.tsx
│   └── footer.tsx
├── data/                  # Content (TypeScript)
│   ├── projects.ts
│   ├── experience.ts
│   └── skills.ts
├── lib/                   # Utilities
│   ├── analytics.ts       # GA4 tracking
│   └── validations.ts     # Form schemas
└── public/               # Static assets
    ├── CNAME
    └── resume.pdf
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WEB3FORMS_KEY=your_key_here
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_project_id
```

### GitHub Secrets

For deployment, add these secrets in your repository settings:

- `WEB3FORMS_KEY` - From [web3forms.com](https://web3forms.com)
- `GA_MEASUREMENT_ID` - From Google Analytics
- `CLARITY_PROJECT_ID` - From Microsoft Clarity

## 🎨 Customization

### Update Content

Edit the data files in the `data/` directory:

- **Projects**: `data/projects.ts`
- **Experience**: `data/experience.ts`
- **Skills**: `data/skills.ts`

### Modify Colors

Colors are defined in `app/globals.css` as CSS variables. Both light and dark mode supported.

### Add Components

Use shadcn/ui CLI:

```bash
npx shadcn@latest add [component-name]
```

## 📊 Analytics Setup

### Microsoft Clarity

1. Create account at [clarity.microsoft.com](https://clarity.microsoft.com)
2. Create new project
3. Add Project ID to environment variables

### Google Analytics 4

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to environment variables

## 📧 Contact Form Setup

The contact form uses [Web3Forms](https://web3forms.com):

1. Sign up for free account
2. Get access key
3. Add to environment variables
4. Configure recipient email in dashboard

## 🗓️ Calendar Integration

To add Cal.com:

1. Create account at [cal.com](https://cal.com)
2. Set up event types
3. Get embed code
4. Update `app/schedule/page.tsx`

## 📬 Newsletter Setup

To add MailerLite:

1. Create account at [mailerlite.com](https://mailerlite.com)
2. Get API key and group ID
3. Update `components/newsletter-signup.tsx`
4. Add env var `NEXT_PUBLIC_MAILERLITE_GROUP_ID`

## 🚢 Deployment

### GitHub Pages (Automatic)

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Complete a pull request to `main` in Azure DevOps
4. The `mirror-site` pipeline pushes `main` to GitHub
5. Workflow will build and deploy automatically

### Custom Domain

1. Update `public/CNAME` with your domain
2. Configure DNS A records at your registrar
3. Enable HTTPS in GitHub Pages settings

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run build (includes type checking)
```

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 👤 Author

**M. Talha Siddiqui**

- Website: [mtalhas.github.io](https://mtalhas.github.io)
- LinkedIn: [in/mtalhas](https://linkedin.com/in/mtalhas)
- GitHub: [@mtalhas](https://github.com/mtalhas)
- Twitter: [@mdtalhas](https://twitter.com/mdtalhas)
- Email: mtalha.dev@gmail.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Animations with [Framer Motion](https://www.framer.com/motion)

---

**⭐ If you find this portfolio template useful, please consider giving it a star!**
