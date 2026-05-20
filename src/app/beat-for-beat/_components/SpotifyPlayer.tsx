"use client";

import { useEffect, useRef, useState } from "react";

interface SpotifyController {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  destroy: () => void;
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { width: string | number; height: string | number; uri: string },
    callback: (controller: SpotifyController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyIframeApi?: SpotifyIFrameAPI;
  }
}

const SCRIPT_ID = "spotify-iframe-api-script";

const loadSpotifyApi = (): Promise<SpotifyIFrameAPI> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("No window"));
  }
  if (window.__spotifyIframeApi) {
    return Promise.resolve(window.__spotifyIframeApi);
  }
  return new Promise((resolve) => {
    const prev = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      prev?.(api);
      window.__spotifyIframeApi = api;
      resolve(api);
    };
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    }
  });
};

interface SpotifyPlayerProps {
  trackId: string;
  shouldPlay: boolean;
}

export default function SpotifyPlayer({
  trackId,
  shouldPlay,
}: SpotifyPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const [ready, setReady] = useState(false);
  const lastUriRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSpotifyApi().then((api) => {
      if (cancelled || !hostRef.current || controllerRef.current) return;
      const initialUri = `spotify:track:${trackId}`;
      lastUriRef.current = initialUri;
      api.createController(
        hostRef.current,
        { width: "100%", height: 152, uri: initialUri },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          controllerRef.current = controller;
          setReady(true);
        },
      );
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // intentionally only run once — track switching handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    const uri = `spotify:track:${trackId}`;
    if (lastUriRef.current !== uri) {
      controllerRef.current.loadUri(uri);
      lastUriRef.current = uri;
    }
  }, [trackId, ready]);

  useEffect(() => {
    if (!ready || !controllerRef.current) return;
    if (shouldPlay) {
      controllerRef.current.play();
    } else {
      controllerRef.current.pause();
    }
  }, [shouldPlay, ready, trackId]);

  return <div ref={hostRef} className="rounded-xl overflow-hidden shadow" />;
}
