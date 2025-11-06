import Image from "next/image";
import hero from "../../public/des2.png";
export default function Home() {
  return (
    <div className="font-sans min-h-screen pb-20">
      <div className="relative w-full h-[400px] sm:h-[400px] md:h-[600px] lg:h-[500px] max-w-7xl mx-auto px-0">
        <div className="relative w-full h-full rounded-lg overflow-hidden ]">
          <Image
          src={hero}
          alt="Game Controller"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        </div>
      </div>
      <div className="text-center pt-2 pb-8 px-4">
        <h1 className="text-[#E66B1A] text-5xl font-bold">Welcome to GameTrade</h1>
        <p className="text-base md:text-lg mt-2 text-[#ECEDF1]">Trade your games with other gamers easily.</p>
      </div>            
    </div>
  );
}
