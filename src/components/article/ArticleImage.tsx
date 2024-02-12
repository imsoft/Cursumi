import Image from "next/image";

interface Props {
  imageSrc: string;
  alt: string;
}

const ArticleImage = ({ imageSrc, alt }: Props) => {
  return (
    <>
      <Image src={imageSrc} alt={alt} width={1024} height={683} priority={true} />
    </>
  );
};

export default ArticleImage;
