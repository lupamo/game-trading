import Image from "next/image";
import logo from "../../public/logo.png";
export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-red-600">Welcome to GameTrade</h1>
      <p className="text-gray-600">Trade your games with other gamers easily.</p>
      <Image
        src={logo}
        alt="Game Controller"
        width={200}
        height={200}
      />
    </div>
  );
}
