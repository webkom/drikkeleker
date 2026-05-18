"use client";

import { use } from "react";
import AdminView from "../../_components/AdminView";

export default function AdminRoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  return <AdminView roomCode={roomCode} />;
}
