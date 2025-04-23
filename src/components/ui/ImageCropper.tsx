
import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { Crop, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Square } from "lucide-react";

type Props = {
  open: boolean;
  image: string | null;
  onClose: () => void;
  onCrop: (cropped: string) => void;
  aspect?: number;
  title?: string;
};

export default function ImageCropper({ open, image, onClose, onCrop, aspect = 1, title }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // الحالة: التحكم في إزاحة الصورة والتكبير
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState<{x:number, y:number}|null>(null);

  // الإعدادات حسب المقاس المطلوب
  const cropWidth = aspect === 1 ? 400 : 720;
  const cropHeight = aspect === 1 ? 400 : 180; // 720/4 = 180

  // إعادة الضبط عند فتح صورة جديدة
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
    setLastPos(null);
  }, [image, open]);

  // تحكم بالسحب على إطار القص
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => {
    setDragging(false);
    setLastPos(null);
  };
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragging || !lastPos) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  // لمس للجوال
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setDragging(true);
      setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging || !lastPos || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastPos.x;
    const dy = e.touches[0].clientY - lastPos.y;
    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    setLastPos(null);
  };

  // حدود الإزاحة (بحيث لا تخرج الصورة من إطار القص)
  useEffect(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const iw = img.naturalWidth * zoom;
    const ih = img.naturalHeight * zoom;
    let minX = cropWidth - iw;
    let minY = cropHeight - ih;
    setOffset((prev) => ({
      x: Math.min(0, Math.max(minX, prev.x)),
      y: Math.min(0, Math.max(minY, prev.y))
    }));
  // eslint-disable-next-line
  }, [zoom, image]);

  // أزرار التحكم
  const handleZoom = (inOut: "in"|"out") => {
    setZoom(z =>
      inOut === "in"
        ? Math.min(z + 0.15, 4)
        : Math.max(z - 0.15, 1)
    );
  };
  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    const moveStep = 30;
    setOffset((prev) => {
      switch(dir){
        case "up": return {...prev, y: prev.y + moveStep };
        case "down": return {...prev, y: prev.y - moveStep };
        case "left": return {...prev, x: prev.x + moveStep };
        case "right": return {...prev, x: prev.x - moveStep };
        default: return prev;
      }
    });
  };
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // القص وتحويل لصورة جاهزة
  const handleCrop = () => {
    if (!imgRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // أبعاد مصدر الصورة بالأصل
    const { naturalWidth, naturalHeight } = imgRef.current;

    // نسبة عرض الصورة المعروضة إلى الصورة الأصلية
    const imgDisplayWidth = cropWidth / zoom;
    const imgDisplayHeight = cropHeight / zoom;

    // معامل التحويل من الحيز الحالي للمصدر الأصلي
    const sx = -offset.x / zoom;
    const sy = -offset.y / zoom;

    // مساحة القص في الصورة الأصلية
    const scale = naturalWidth / imgDisplayWidth;
    const srcX = sx * scale;
    const srcY = sy * scale;
    const srcW = cropWidth * scale / zoom;
    const srcH = cropHeight * scale / zoom;

    // ضبط نتيجه القص
    canvasRef.current.width = cropWidth;
    canvasRef.current.height = cropHeight;
    ctx.clearRect(0, 0, cropWidth, cropHeight);
    ctx.drawImage(
      imgRef.current,
      srcX, srcY, srcW, srcH,
      0, 0, cropWidth, cropHeight
    );
    const cropped = canvasRef.current.toDataURL("image/png");
    onCrop(cropped);
    onClose();
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-fit min-w-[380px] max-w-full flex flex-col items-center shadow-2xl">
        <h2 className="font-bold mb-2">{title}</h2>
        <div className="flex gap-2 items-center mb-2">
          <button onClick={() => handleZoom("in")} className="p-1 border rounded hover:bg-gray-100" title="تكبير"><ZoomIn size={18} /></button>
          <button onClick={() => handleZoom("out")} className="p-1 border rounded hover:bg-gray-100" title="تصغير"><ZoomOut size={18} /></button>
          <button onClick={() => handleMove("left")} className="p-1 border rounded hover:bg-gray-100" title="يسار"><ArrowLeft size={18}/></button>
          <button onClick={() => handleMove("right")} className="p-1 border rounded hover:bg-gray-100" title="يمين"><ArrowRight size={18}/></button>
          <button onClick={() => handleMove("up")} className="p-1 border rounded hover:bg-gray-100" title="أعلى"><ArrowUp size={18}/></button>
          <button onClick={() => handleMove("down")} className="p-1 border rounded hover:bg-gray-100" title="أسفل"><ArrowDown size={18}/></button>
          <button onClick={handleReset} className="p-1 border rounded hover:bg-gray-100" title="إعادة ضبط"><Square size={18} /></button>
        </div>
        <div
          ref={wrapperRef}
          className="relative bg-black overflow-hidden"
          style={{
            width: cropWidth,
            height: cropHeight,
            touchAction: "none",
            borderRadius: 12,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imgRef}
            src={image}
            alt="to crop"
            draggable={false}
            style={{
              // صورة القاعدة (تتحرك وتكبر وتتصغر)
              position: "absolute",
              left: offset.x,
              top: offset.y,
              width: cropWidth * zoom,
              height: cropHeight * zoom,
              objectFit: "cover",
              userSelect: "none",
              pointerEvents: "none"
            }}
          />
          {/* إطار القص */}
          <div
            className="absolute pointer-events-none border-2 rounded border-emerald-500"
            style={{
              left: 0, top: 0,
              width: cropWidth, height: cropHeight,
              boxSizing: "border-box"
            }}
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
