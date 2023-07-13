"use client";

import { useEffect, useState } from "react";
import {
  BannerCourseFinished,
  CourseProgress,
  VideoList,
  VideoPlayer,
} from "@/components";

interface IVideo {
  id: number;
  name: string;
  description: string;
  href: string;
  status: string;
}

// complete, current, upcoming

const videosList: IVideo[] = [
  {
    id: 0,
    name: "Video del curso #1",
    description: "Vitae sed mi luctus laoreet.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FOutro%20Youtube%20%20imSoft.mp4?alt=media&token=a06ddb3e-131e-48db-a358-bb25214c5f2b",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Intro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 1,
    name: "Video del curso #2",
    description: "Vitae sed mi luctus laoreet.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FIntro%20Youtube%20%20imSoft.mp4?alt=media&token=440c23c0-29db-40e0-bf61-623316b1df07",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Outro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 2,
    name: "Video del curso #3",
    description: "Cursus semper viverra facilisis et et some more.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FOutro%20Youtube%20%20imSoft.mp4?alt=media&token=a06ddb3e-131e-48db-a358-bb25214c5f2b",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Intro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 3,
    name: "Video del curso #4",
    description: "Penatibus eu quis ante.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FIntro%20Youtube%20%20imSoft.mp4?alt=media&token=440c23c0-29db-40e0-bf61-623316b1df07",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Outro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 4,
    name: "Video del curso #5",
    description: "Faucibus nec enim leo et.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FOutro%20Youtube%20%20imSoft.mp4?alt=media&token=a06ddb3e-131e-48db-a358-bb25214c5f2b",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Intro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 5,
    name: "Video del curso #6",
    description: "Vitae sed mi luctus laoreet.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FIntro%20Youtube%20%20imSoft.mp4?alt=media&token=440c23c0-29db-40e0-bf61-623316b1df07",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Outro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 6,
    name: "Video del curso #7",
    description: "Vitae sed mi luctus laoreet.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FOutro%20Youtube%20%20imSoft.mp4?alt=media&token=a06ddb3e-131e-48db-a358-bb25214c5f2b",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Intro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 7,
    name: "Video del curso #8",
    description: "Cursus semper viverra facilisis et et some more.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FIntro%20Youtube%20%20imSoft.mp4?alt=media&token=440c23c0-29db-40e0-bf61-623316b1df07",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Outro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 8,
    name: "Video del curso #9",
    description: "Penatibus eu quis ante.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FOutro%20Youtube%20%20imSoft.mp4?alt=media&token=a06ddb3e-131e-48db-a358-bb25214c5f2b",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Intro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
  {
    id: 9,
    name: "Video del curso #10",
    description: "Faucibus nec enim leo et.",
    // href: "https://firebasestorage.googleapis.com/v0/b/cursumi.appspot.com/o/Videos%2FIntro%20Youtube%20%20imSoft.mp4?alt=media&token=440c23c0-29db-40e0-bf61-623316b1df07",
    href: "https://documentos-transparencia.sfo3.digitaloceanspaces.com/Outro%20Youtube%20%20imSoft.mp4",
    status: "upcoming",
  },
];

const reviews = [
  {
    id: 1,
    rating: 5,
    content: `
        <p>This icon pack is just what I need for my latest project. There's an icon for just about anything I could ever need. Love the playful look!</p>
      `,
    date: "July 16, 2021",
    datetime: "2021-07-16",
    author: "Emily Selman",
    avatarSrc:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
  },
  {
    id: 2,
    rating: 5,
    content: `
        <p>Blown away by how polished this icon pack is. Everything looks so consistent and each SVG is optimized out of the box so I can use it directly with confidence. It would take me several hours to create a single icon this good, so it's a steal at this price.</p>
      `,
    date: "July 12, 2021",
    datetime: "2021-07-12",
    author: "Hector Gibbons",
    avatarSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
  },
  {
    id: 3,
    rating: 5,
    content: `
        <p>Blown away by how polished this icon pack is. Everything looks so consistent and each SVG is optimized out of the box so I can use it directly with confidence. It would take me several hours to create a single icon this good, so it's a steal at this price.</p>
      `,
    date: "July 12, 2021",
    datetime: "2021-07-12",
    author: "Hector Gibbons",
    avatarSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
  },
  {
    id: 4,
    rating: 5,
    content: `
        <p>Blown away by how polished this icon pack is. Everything looks so consistent and each SVG is optimized out of the box so I can use it directly with confidence. It would take me several hours to create a single icon this good, so it's a steal at this price.</p>
      `,
    date: "July 12, 2021",
    datetime: "2021-07-12",
    author: "Hector Gibbons",
    avatarSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
  },
];

const CaourseContentPage = () => {
  const [videos, setVideos] = useState<IVideo[]>(videosList);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const progressStep = 100 / videosList.length;
  const [progress, setProgress] = useState(0);

  const handleVideoSelect = (videoId: number) => {
    setCurrentVideoIndex(videoId);
  };

  const handleEnded = () => {
    if (currentVideoIndex < videos.length - 1) {
      setProgress(progressStep + progress);
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setProgress(progressStep + progress);
      const updatedVideos = videos.map((video, index) => {
        if (index === currentVideoIndex) {
          return { ...video, status: "complete" };
        } else {
          return video;
        }
      });

      setVideos(updatedVideos);
    }
  };

  useEffect(() => {
    const updatedVideos = videos.map((video, index) => {
      if (index === currentVideoIndex) {
        return { ...video, status: "current" };
      } else if (index < currentVideoIndex) {
        return { ...video, status: "complete" };
      } else {
        return video;
      }
    });

    setVideos(updatedVideos);
  }, [currentVideoIndex, videos]);

  return (
    <>
      <div className="flex pt-10">
        <VideoPlayer
          url={videos[currentVideoIndex].href}
          onEnded={handleEnded}
        />

        <VideoList
          videos={videos}
          currentVideoIndex={currentVideoIndex}
          onSelectVideo={handleVideoSelect}
        />
      </div>

      <CourseProgress progress={progress} />

      {progress >= 100 && <BannerCourseFinished />}
    </>
  );
};

export default CaourseContentPage;
