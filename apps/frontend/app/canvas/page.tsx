import { redirect } from "next/navigation";

export default function CanvasPage() {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  redirect(`/canvas/${uniqueId}`);
}
