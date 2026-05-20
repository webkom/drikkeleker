"use client";

import { use } from "react";
import AudienceView from "../../_components/AudienceView";

export default function AudienceRoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  return <AudienceView roomCode={roomCode} />;
}
