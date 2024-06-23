import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Props {
  url: string;
  onEnded: () => void;
}

export const VideoPlayer = ({ url, onEnded }: Props) => {
  return (
    <>
      <div className="md:w-2/3 lg:w-full lg:pl-20">
        <div className="xl:pr-96">
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            <div className="relative aspect-video mr-10">
              <ReactPlayer
                className="top-0 left-0 aspect-video"
                url={url}
                width={"100%"}
                height={"100%"}
                controls={true}
                playing
                onEnded={onEnded}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
