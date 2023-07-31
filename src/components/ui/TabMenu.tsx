"use client";

import { Fragment } from "react";
import Image from "next/image";
import { Tab } from "@headlessui/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { IFAQ, ILicense, IReview } from "@/interfaces";

interface Props {
  reviews: IReview;
  faqs: IFAQ[];
  license: ILicense;
}

export const TabMenu = ({ reviews, faqs, license }: Props) => {
  return (
    <>
      <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
        <Tab.Group as="div">
          <div className="border-b border-gray-200">
            <Tab.List className="-mb-px flex space-x-8">
              <Tab
                className={({ selected }) =>
                  `${
                    selected
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800"
                  } whitespace-nowrap border-b-2 py-6 text-sm font-medium`
                }
              >
                Customer Reviews
              </Tab>
              <Tab
                className={({ selected }) =>
                  `${
                    selected
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800"
                  } whitespace-nowrap border-b-2 py-6 text-sm font-medium`
                }
              >
                FAQ
              </Tab>
              <Tab
                className={({ selected }) =>
                  `${
                    selected
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800"
                  } whitespace-nowrap border-b-2 py-6 text-sm font-medium`
                }
              >
                License
              </Tab>
            </Tab.List>
          </div>
          <Tab.Panels as={Fragment}>
            <Tab.Panel className="-mb-10">
              <h3 className="sr-only">Customer Reviews</h3>

              {reviews.featured.map((review, reviewIdx) => (
                <div
                  key={review.id}
                  className="flex space-x-4 text-sm text-gray-500"
                >
                  <div className="flex-none py-10">
                    <Image
                      src={review.avatarSrc}
                      alt=""
                      className="h-10 w-10 rounded-full bg-gray-100"
                      width={500}
                      height={500}
                    />
                  </div>
                  <div
                    className={`
                              ${
                                reviewIdx === 0
                                  ? ""
                                  : "border-t border-gray-200"
                              } py-10
                              `}
                  >
                    <h3 className="font-medium text-gray-900">
                      {review.author}
                    </h3>
                    <p>
                      <time dateTime={review.datetime}>{review.date}</time>
                    </p>

                    <div className="mt-4 flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={`
                                    ${
                                      review.rating > rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    } h-5 w-5 flex-shrink-0
                                    `}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="sr-only">{review.rating} out of 5 stars</p>

                    <div
                      className="prose prose-sm mt-4 max-w-none text-gray-500"
                      dangerouslySetInnerHTML={{
                        __html: review.content,
                      }}
                    />
                  </div>
                </div>
              ))}
            </Tab.Panel>

            <Tab.Panel className="text-sm text-gray-500">
              <h3 className="sr-only">Frequently Asked Questions</h3>

              <dl>
                {faqs.map((faq) => (
                  <Fragment key={faq.question}>
                    <dt className="mt-10 font-medium text-gray-900">
                      {faq.question}
                    </dt>
                    <dd className="prose prose-sm mt-2 max-w-none text-gray-500">
                      <p>{faq.answer}</p>
                    </dd>
                  </Fragment>
                ))}
              </dl>
            </Tab.Panel>

            <Tab.Panel className="pt-10">
              <h3 className="sr-only">License</h3>

              <div
                className="prose prose-sm max-w-none text-gray-500"
                dangerouslySetInnerHTML={{ __html: license.content }}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
};
