import { User, Mail, Code } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto pt-12 pb-2">
      <div className="flex flex-col items-center gap-4">
        <div className="h-px w-112 bg-border" />
        <div className="flex items-center gap-6">
          <FooterLink href="https://github.com/lordbaldwin1/lift" icon={<Code />} label="GitHub" />
          <FooterLink href="https://zacharyspringer.dev/" icon={<User />} label="Me" />
          <FooterLink href="mailto:springerczachary@gmail.com" icon={<Mail />} label="Contact" />
        </div>
        <p className="text-xs text-muted-foreground/60">
          Built for lifters who value simplicity.
        </p>
      </div>
    </footer>
  );
}

function FooterLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5">
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </a>
  );
} 