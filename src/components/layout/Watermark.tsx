import Image from "next/image";

export function Watermark() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="relative flex items-center justify-center h-full">
        <Image
          src="/images/zemen_bull.png"
          alt="Zemen Bank Watermark"
          width={384}
          height={384}
          className="opacity-[0.03]"
        />
      </div>
    </div>
  );
}
