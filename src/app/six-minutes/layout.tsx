"use client";

import SongsProvider from "./SongsProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SongsProvider initialShuffle>{children}</SongsProvider>;
}
