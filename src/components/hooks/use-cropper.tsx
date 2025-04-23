
import { useState } from "react";

export function useCropper() {
  const [isOpen, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const openCropper = (img64: string) => {
    setImage(img64);
    setOpen(true);
  };

  const closeCropper = () => setOpen(false);

  return {
    isOpen,
    image,
    openCropper,
    closeCropper,
    setImage,
    setOpen,
  };
}
