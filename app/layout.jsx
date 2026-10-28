import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
export const metadata = {
 title:"DALAN | Digital Assistance for Local Access and Navigation",
 description:"DALAN is a pilot mobile commuter and transportation assistance platform for Roxas City, Capiz. Routes and fares are not yet verified.",
 applicationName:"DALAN",manifest:"/manifest.webmanifest",
 robots:{index:false,follow:false},
 icons:{icon:"/dalan-icon.svg",apple:"/dalan-icon.svg"}
};
export const viewport = {themeColor:"#075e7f",width:"device-width",initialScale:1};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}
