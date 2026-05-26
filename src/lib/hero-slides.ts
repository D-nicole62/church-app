import { slideshowPhotos } from "@/lib/church-photos";

export type HeroSlide = {
  src: string;
  alt: string;
};

export const heroSlides: HeroSlide[] = slideshowPhotos;
