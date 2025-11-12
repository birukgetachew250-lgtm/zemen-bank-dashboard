export function Watermark() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="flex items-center justify-center h-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-96 h-96 text-gray-500 opacity-[0.03]">
          <path d="M12.5,6.68A5.32,5.32,0,0,0,7.18,12a1,1,0,0,1-2,0A7.32,7.32,0,0,1,12.5,4.68a1,1,0,0,1,0,2Z"/>
          <path d="M17,12a5,5,0,0,0-5-5,1,1,0,0,1,0-2,7,7,0,0,1,7,7,1,1,0,0,1-2,0Z"/>
          <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM18,12a1,1,0,0,1-1,1H7a1,1,0,0,1,0-2H17A1,1,0,0,1,18,12Z"/>
        </svg>
      </div>
    </div>
  );
}
