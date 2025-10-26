import { redirect } from "next/navigation";

export default function Page() {
  redirect("/en"); // или на любую твою дефолтную локаль
}
