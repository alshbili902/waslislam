import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://waslislam.fun"),
  title: "وصل الإسلامية | Wasl Islamic — المنصة الإسلامية المتكاملة",
  description:
    "المنصة الإسلامية الشاملة والموثوقة: قراءة واستماع القرآن الكريم، أذكار وأدعية، أوقات الصلاة، اتجاه القبلة، الختمة، التحفيظ، واستوديو البطاقات الدعوية.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "وصل الإسلامية",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/assets/branding/wasl-logo.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#065F46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var o=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='bis_skin_checked')return;return o.apply(this,arguments);};if(typeof MutationObserver!=='undefined'){var m=new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){if(muts[i].attributeName==='bis_skin_checked'&&muts[i].target&&muts[i].target.removeAttribute){muts[i].target.removeAttribute('bis_skin_checked');}}});m.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['bis_skin_checked']});}}catch(e){}})();`
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-cairo bg-[var(--bg-main)] text-[var(--text-main)] islamic-pattern transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
