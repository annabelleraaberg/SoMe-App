import { SessionProvider } from "@/providers/authctx";
import { Slot } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
