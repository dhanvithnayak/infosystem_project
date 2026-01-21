import Header from "@/components/header";
import { VideoCard } from "@/components/video-card";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="m-4">
        <VideoCard 
          title="Sample Video"
          description="This is a sample video description"
          thumbnail="https://placebear.com/g/200/200"
        />
      </div>
    </div>
  );
}
