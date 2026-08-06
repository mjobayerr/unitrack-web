import { LiveMap } from "./LiveMap";

export const dynamic = "force-dynamic";

export default function MapPage() {
  return (
    <main className="map-page">
      <LiveMap />
    </main>
  );
}
