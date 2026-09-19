import Link from "next/link";
import Logo from "./Logo";

const navLinks = [
  { label: "Futsal", href: "/venues?sport=futsal" },
  { label: "Padel", href: "/venues?sport=padel" },
  { label: "Pickleball", href: "/venues?sport=pickleball" },
  { label: "Venues", href: "/venues" },
];

export default function Navbar() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="hidden text-sm text-ink/70 hover:text-ink sm:block"
          >
            My bookings
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-base transition-colors hover:bg-primary-dark"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
