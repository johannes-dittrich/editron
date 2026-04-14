import { EditorShell } from "@/components/editor-shell";

export default function EditorPage({ params }: { params: { id: string } }) {
  return <EditorShell projectId={params.id} />;
}
