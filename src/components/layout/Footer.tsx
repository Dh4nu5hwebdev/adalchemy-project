export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-primary/10 py-6 text-center text-sm text-foreground/80 mt-auto">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} AdAlchemy. All rights reserved.</p>
        <p className="mt-1">Crafted with AI, for amazing Ads.</p>
      </div>
    </footer>
  );
}
