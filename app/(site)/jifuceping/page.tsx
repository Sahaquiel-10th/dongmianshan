import { permanentRedirect } from "next/navigation";
// Preserve the old entrance; the former quiz had no working result action.
export default function Page() {
  permanentRedirect("/hufuzhishi");
}
