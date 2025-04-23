
import React, { useRef, useState, useEffect } from "react";
import { Crop } from "lucide-react";

type Props = {
  open: boolean;
  image: string | null;
  onClose: () => void;
  onCrop: (cropped: string) => void;
  aspect?: number;
  title?: string;
};

export default function ImageCropper({ open, image, onClose, onCrop, aspect = 1, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [selection, setSelection] = useState({ x: 50, y: 50, size: 200 });

  // إعادة ضبط التحديد عند فتح الصورة الجديدة
  useEffect(() => {
    setSelection({ x: 50, y: 50, size: 200 });
  }, [image]);

  // حساب وتمرير الصورة المقطوعة
  const handleCrop = () => {
    if (!imgRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const scale = imgRef.current.naturalWidth / imgRef.current.width;
    const { x, y, size } = selection;
    const s = size * scale;

    canvasRef.current.width = aspect === 1 ? 400 : 720;
    canvasRef.current.height = aspect === 1 ? 400 : 240;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.drawImage(
      imgRef.current,
      x * scale,
      y * scale,
      s,
      s / aspect,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const cropped = canvasRef.current.toDataURL("image/png");
    onCrop(cropped);
    onClose();
  };

  // السحب للتحديد
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = { x: e.nativeEvent.offsetX - selection.x, y: e.nativeEvent.offsetY - selection.y };
  };
  const handleMouseUp = () => (dragging.current = false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    let _x = e.nativeEvent.offsetX - offset.current.x;
    let _y = e.nativeEvent.offsetY - offset.current.y;
    const imgRect = imgRef.current?.getBoundingClientRect();
    if (!_x || !_y || !imgRect) return;
    _x = Math.max(0, Math.min(_x, imgRect.width - selection.size));
    _y = Math.max(0, Math.min(_y, imgRect.height - selection.size / aspect));
    setSelection({ ...selection, x: _x, y: _y });
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[430px] max-w-full relative flex flex-col items-center">
        <h2 className="font-bold mb-2">{title}</h2>
        <div className="relative">
          <img
            src={image}
            ref={imgRef}
            alt="to crop"
            style={{ width: 400, height: aspect === 1 ? 400 : 240, objectFit: "cover", userSelect: "none" }}
            draggable={false}
          />
          <div
            className="absolute border-2 border-emerald-500 bg-emerald-500/10 cursor-move transition-all"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.size,
              height: selection.size / aspect,
            }}
            onMouseDown={handleMouseDown}
          />
          <div
            className="absolute inset-0"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: "move" }}
          />
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="bg-gray-100 px-3 py-1 rounded font-bold">إلغاء</button>
          <button
            onClick={handleCrop}
            className="bg-primary text-white px-4 py-1 rounded font-bold flex items-center gap-1"
          >
            <Crop size={18} /> قص الصورة
          </button>
        </div>
      </div>
    </div>
  );
}
