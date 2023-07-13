"use client";

import { useState } from "react";
import { VideoModal } from "./VideoModal";

export const ButtonShowModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

  const openModal = () => setIsOpen(true);

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-50 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
        onClick={openModal}
      >
        Preview
      </button>
      {isOpen && <VideoModal isOpen={isOpen} closeModal={closeModal} />}
    </>
  );
};
