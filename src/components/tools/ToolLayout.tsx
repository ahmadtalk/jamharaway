interface ToolLayoutProps {
  children: React.ReactNode;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  return <div className="mx-auto max-w-3xl">{children}</div>;
}
