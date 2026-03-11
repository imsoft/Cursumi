import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface CourseCardProps {
  title: string;
  mode: "Virtual" | "Presencial" | "Híbrido";
  location: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
}

export const CourseCard = ({
  title,
  mode,
  location,
  description,
  href,
  imageSrc,
  imageAlt,
}: CourseCardProps) => {
  return (
    <Card className="flex h-full flex-col">
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={imageAlt ?? `${title} - curso en Cursumi`}
          fill
          className="rounded-t-2xl object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <CardHeader className="gap-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {mode}
          </span>
          <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground">
            {location}
          </span>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="mt-8 border-t border-border/70 px-6 pt-6 pb-4">
        <Link href={href} className="w-full">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-between"
          >
            Ver detalles del curso
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

