import React from "react";
import CanvasLayout from "@/components/CanvasLayout";

export default async function CanvasRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <CanvasLayout roomId={roomId} />;
}
