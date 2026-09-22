import { redirect } from "next/navigation";

/** The Gap list became Knowledge (feature 010). Old links and bookmarks still work. */
export default function GapListMovedPage() {
  redirect("/dashboard/knowledge");
}
