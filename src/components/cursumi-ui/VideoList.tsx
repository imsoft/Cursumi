import { IVideo } from "@/interfaces";
import { VideoListItem } from "./VideoListItem";

interface Props {
  videos: IVideo[];
  currentVideoIndex: number;
  onSelectVideo: (videoId: number) => void;
}

export const VideoList = ({
  videos,
  currentVideoIndex,
  onSelectVideo,
}: Props) => {
  return (
    <>
      <aside className="absolute overflow-y-auto right-0 w-96 border-l border-gray-200 px-4 py-6 sm:px-6 md:w-1/3 lg:w-fit md:max-h-[35rem] lg:px-8 xl:block">
        <div className="flex">
          <div className="w-full">
            <nav aria-label="Progress">
              <ol role="list">
                {videos.map((video, videoIdx) => (
                  <VideoListItem
                    key={video.id}
                    video={video}
                    isActive={videoIdx === currentVideoIndex}
                    onSelect={() => onSelectVideo(video.id)}
                  />
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
