interface Props {
  podcast: string;
}

const Spotify = ({ podcast }: Props) => {
  return (
    <>
      <iframe
        className="rounded-xl"
        src={`${podcast}`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        allowFullScreen
      ></iframe>
    </>
  );
};

export default Spotify;
