import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Browse meals", href: "/meals" },
      { label: "Provider hub", href: "/provider/dashboard" },
      { label: "Orders", href: "/orders" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Careers", href: "/#careers" },
      { label: "Press", href: "/#press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Licenses", href: "#" },
    ],
  },
];

const socialLinks = [
  { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-white/10 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.15),_transparent_55%)]" />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 sm:px-8">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">
              Late-night kitchen cloud
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-white">
              Fuel your next drop with curated meals delivered in under 30
              minutes.
            </h2>
            <p className="text-sm text-slate-300">
              Subscribe for chef diaries, product releases, and surprise tasting
              invites. No spam—just edible inspiration.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="footer-email">
                Email
              </label>
              <Input
                id="footer-email"
                type="email"
                placeholder="Enter your work email"
                className="bg-slate-900/60 text-slate-100 placeholder:text-slate-500"
              />
              <Button className="whitespace-nowrap bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900">
                Join list
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="h-4 w-4 text-cyan-300" />
              We launch new ghost kitchens every month—get notified first.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              New drop
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              Bangkok Midnight Set
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Charred lemongrass chicken, kaffir lime jasmine rice, and neon
              mango panna cotta. Ships in insulated crates.
            </p>
            <Button variant="ghost" className="mt-4 px-0 text-cyan-200" asChild>
              <Link href="/meals" className="inline-flex items-center gap-2">
                Explore menu <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-white">FoodHub</p>
            <p className="mt-3 text-slate-400">
              Ultra-fast delivery network built for creators, studio teams, and
              night-shift crews.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                {section.title}
              </p>
              <ul className="space-y-2 text-slate-300">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="transition hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FoodHub. Crafted for the after-hours economy.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="#" className="transition hover:text-white">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
