import Navbar from "@/components/Navbar";
import GenerateForm from "./GenerateForm";
import MyPaths from "@/components/MyPaths";

interface GeneratePageProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function GeneratePage({ searchParams }: GeneratePageProps) {
  const { topic } = await searchParams;
  const isDev = process.env.NODE_ENV === "development";
  const defaultToken = isDev ? (process.env.DAILY_DEV_TOKEN ?? "") : "";
  const defaultOpenAIKey = isDev ? (process.env.OPENAI_API_KEY ?? "") : "";

  return (
    <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />
      <main className="pt-14 flex flex-col items-center px-6 py-20">
        <GenerateForm
          defaultToken={defaultToken}
          defaultOpenAIKey={defaultOpenAIKey}
          defaultTopic={topic ?? ""}
        />
        <MyPaths />
      </main>
    </div>
  );
}
