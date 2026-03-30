export default function EngagementDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout removes the default padding from the main layout
  // The engagement detail has its own header and sidebar structure
  return <div className="-m-6">{children}</div>;
}
