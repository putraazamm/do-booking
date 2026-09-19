export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Do Arena. All rights reserved.</p>
          <p>Futsal · Padel · Pickleball courts across Kuala Lumpur</p>
        </div>
      </div>
    </footer>
  );
}
