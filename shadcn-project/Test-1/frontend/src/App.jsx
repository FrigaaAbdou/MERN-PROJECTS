import { Button } from "./components/ui/button";
import BasicDialog from "./components/Dialog";
import InfoPopover from "./components/Popover";

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 p-8">
      <h1 className="text-3xl font-bold">Radix + ShadCN Playground</h1>

      <div className="space-x-4">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
      </div>

      <BasicDialog btnLabel="Open dialog" />
      <InfoPopover />
    </main>
  );
}