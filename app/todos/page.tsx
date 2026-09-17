import { Header } from "@/components/header";
import { Todos } from "@/components/todos";

export default function TodosPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 p-4">
        <Todos />
      </main>
    </>
  );
}
