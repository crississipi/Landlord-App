"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface ImageSliderProps {
  images: { id: number; url: string }[];
}

const ImageSlider = ({ images }: ImageSliderProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % images.length),
      3000
    );
    return () => clearInterval(interval);
  }, [images]);

  if (!images.length)
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-200">
        No Images
      </div>
    );

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={images[current].id}
          src={images[current].url}
          alt={`image-${current}`}
          className="absolute w-full h-full object-cover"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
      >
        <FaArrowLeft />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
      >
        <FaArrowRight />
      </button>
      <div className="mb-1 w-full z-999 mt-auto flex items-end justify-center gap-1">
        {Array.from({length: images.length}).map((_,i) => (
          <span key={i} className={`h-1 w-5 rounded-full ${current === i ? 'bg-customViolet' : 'bg-neutral-200'} transition-colors ease-out duration-200`}></span>
        ))}
      </div>
    </div>
  );
}

export default ImageSlider
