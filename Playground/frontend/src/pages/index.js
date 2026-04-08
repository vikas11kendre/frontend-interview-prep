import CsvFileAnalyser from "@/components/web-worker/csv-file-summary/CsvFileAnalyser";
import ShortPolling from "@/components/polling/ShortPolling";
import LongPolling from "@/components/polling/LongPolling";
// import SSEClinet from "@/components/server-side-event/SSEClinet";

export default function Home() {
  return (
    <div className="flex flex-col m-12 gap-8">
      <ShortPolling />
      <LongPolling />
      <CsvFileAnalyser />
      {/* <SSEClinet/> */}
    </div>
  );
}
