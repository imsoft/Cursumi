import React, { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { RequiredMetatag } from "@/interfaces";

interface Props {
  post: RequiredMetatag;
}

export const BlogCard = ({ post }: Props) => {

  const {
    _id,
    title,
    description,
    keywords,
    author,
    subject,
    date,
    type,
    source,
    image,
    url,
    robots,
    tags,
  } = post;

  return (
    <>
      <article
        key={_id}
        className="relative isolate flex flex-col gap-8 lg:flex-row"
      >
        <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
          <Image
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
            width={500}
            height={500}
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
        </div>
        <div>
          <div className="flex items-center gap-x-4 text-xs">
            <time dateTime={date} className="text-gray-500">
              {date}
            </time>
            <Link href={`/blogs/${_id}`}
              className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
            >
              {type}
            </Link>
          </div>
          <div className="group relative max-w-xl">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
            <Link href={`/blogs/${_id}`}>
                <span className="absolute inset-0" />
                {title}
              </Link>
            </h3>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              {description}
            </p>
          </div>
          <div className="mt-6 flex border-t border-gray-900/5 pt-6">
            <div className="relative flex items-center gap-x-4">
              <Image
                src={image}
                alt=""
                className="h-10 w-10 rounded-full bg-gray-50"
                width={500}
                height={500}
              />
              <div className="text-sm leading-6">
                <p className="font-semibold text-gray-900">
                <Link href={`/blogs/${_id}`}>
                    <span className="absolute inset-0" />
                    {author}
                  </Link>
                </p>
                <p className="text-gray-600">{subject}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};
