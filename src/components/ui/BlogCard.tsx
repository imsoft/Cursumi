import React, { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { IBlogCard } from "@/interfaces";

export const BlogCard: FC<IBlogCard> = ({
  id,
  blogTitle,
  blogHref,
  description,
  imageUrl,
  date,
  datetime,
  category: { categoryTitle, categoryHref },
  author: { name, role, href, authorImageUrl },
}) => {
  return (
    <>
      <article
        key={id}
        className="relative isolate flex flex-col gap-8 lg:flex-row"
      >
        <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
          <Image
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
            width={500}
            height={500}
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
        </div>
        <div>
          <div className="flex items-center gap-x-4 text-xs">
            <time dateTime={datetime} className="text-gray-500">
              {date}
            </time>
            <Link
              href={categoryHref}
              className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
            >
              {categoryTitle}
            </Link>
          </div>
          <div className="group relative max-w-xl">
            <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
              <Link href={blogHref}>
                <span className="absolute inset-0" />
                {blogTitle}
              </Link>
            </h3>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              {description}
            </p>
          </div>
          <div className="mt-6 flex border-t border-gray-900/5 pt-6">
            <div className="relative flex items-center gap-x-4">
              <Image
                src={authorImageUrl}
                alt=""
                className="h-10 w-10 rounded-full bg-gray-50"
                width={500}
                height={500}
              />
              <div className="text-sm leading-6">
                <p className="font-semibold text-gray-900">
                  <Link href={href}>
                    <span className="absolute inset-0" />
                    {name}
                  </Link>
                </p>
                <p className="text-gray-600">{role}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};
