import { IVideo } from "@/interfaces";
import { CheckIcon } from "@heroicons/react/24/solid";

interface Props {
  video: IVideo;
  isActive: boolean;
  onSelect: () => void;
}

export const VideoListItem = ({ video, isActive, onSelect }: Props) => {
  return (
    <>
      <li
        className={`${isActive ? "text-indigo-600" : "text-gray-500"} ${
          video.status !== "complete" && "cursor-pointer"
        } ${video.status === "complete" && "group"} relative pb-5`}
        onClick={onSelect}
      >
        {video.status === "complete" ? (
          <>
            {isActive && (
              <div
                className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                aria-hidden="true"
              />
            )}
            <span
              className={`group relative flex items-start ${
                isActive && "text-indigo-600"
              }`}
            >
              <span className="flex h-9 items-center">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                  <CheckIcon
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span className="text-sm font-medium">{video.name}</span>
                <span className="text-sm text-gray-500">
                  {video.description}
                </span>
              </span>
            </span>
          </>
        ) : video.status === "current" ? (
          <>
            {isActive && (
              <div
                className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                aria-hidden="true"
              />
            )}
            <span
              className={`group relative flex items-start cursor-pointer ${
                isActive && "text-indigo-600"
              }`}
              aria-current="step"
            >
              <span className="flex h-9 items-center" aria-hidden="true">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span className="text-sm font-medium text-indigo-600">
                  {video.name}
                </span>
                <span className="text-sm text-gray-500">
                  {video.description}
                </span>
              </span>
            </span>
          </>
        ) : (
          <>
            {isActive && (
              <div
                className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                aria-hidden="true"
              />
            )}
            <span
              className={`group relative flex items-start ${
                video.status !== "complete" && "cursor-pointer"
              }`}
              onClick={onSelect}
            >
              <span className="flex h-9 items-center" aria-hidden="true">
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                </span>
              </span>
              <span className="ml-4 flex min-w-0 flex-col">
                <span className="text-sm font-medium text-gray-500">
                  {video.name}
                </span>
                <span className="text-sm text-gray-500">
                  {video.description}
                </span>
              </span>
            </span>
          </>
        )}
      </li>
    </>
  );
};
