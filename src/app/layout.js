import "./globals.css"; // Mengimpor Tailwind CSS

export const metadata = {
  title: "Pharma One - Management System",
  description: "Sistem Manajemen Farmasi Modern",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
