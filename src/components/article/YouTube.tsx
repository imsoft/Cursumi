interface Props {
  video: string;
}

const YouTube = ({ video }: Props) => {
  return (
    <>
      <div className="relative aspect-video">
        <iframe
          src={`${video}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </>
  );
};

export default YouTube;
