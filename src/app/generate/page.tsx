import Navbar from "@/components/Navbar";
import GenerateForm from "./GenerateForm";
import MyPaths from "@/components/MyPaths";

interface GeneratePageProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function GeneratePage({ searchParams }: GeneratePageProps) {
  const { topic } = await searchParams;
  const defaultToken =
    process.env.NODE_ENV === "development"
      ? (process.env.DAILY_DEV_TOKEN ?? "")
      : "";

  return (
    <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />
      <main className="pt-14 flex flex-col items-center px-6 py-20">
        <GenerateForm defaultToken={defaultToken} defaultTopic={topic ?? ""} />
        <MyPaths />
      </main>
    </div>
  );
}
