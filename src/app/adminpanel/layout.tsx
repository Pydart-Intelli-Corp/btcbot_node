import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - BTCBOT24",
  description: "Admin dashboard for BTCBOT24 platform management",
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel">
      {children}
    </div>
  );
}