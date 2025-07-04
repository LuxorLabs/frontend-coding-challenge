// src/app/layout.tsx
import { UserProvider } from "@/common/provider/userProvider";
import "./globals.css";
import { AuthProvider } from "@/common/provider/authProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}