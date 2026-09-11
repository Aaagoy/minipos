// import Image from "next/image";
// import { Header } from "@/components/layout/Header";
// import { Sidebar } from "@/components/layout/Sidebar";

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
