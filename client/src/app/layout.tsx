import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/provider/Providers";
import localFont from "next/font/local";
// import { Toaster } from "react-hot-toast";


// LOCAL FONT SETUP
const sohne = localFont({
    src: [
        { path: '../fonts/sohne-400-normal.woff', weight: '400', style: 'normal' },
        { path: '../fonts/sohne-500-normal.woff', weight: '500', style: 'normal' },
        { path: '../fonts/sohne-700-normal.woff', weight: '700', style: 'normal' },
    ],
    variable: '--font-sohne',
    display: 'swap',
});




export const metadata: Metadata = {
    title: "JET - Social",
    description: "A modern social media platform inspired by Twitter, allowing users to share posts, follow others, and view a personalized feed in real time. Built for speed, scalability, and a seamless user experience.",
};


type RootLayoutChildrenType = {
    children: React.ReactNode
}


export default function RootLayout({ children }: Readonly<RootLayoutChildrenType>) {
    return (
        <html lang="en">
            <link rel="shortcut icon" href="/lightlogo.svg" type="image/x-icon" />
            <body
                className={`${sohne.className} antialiased`}
            >
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
