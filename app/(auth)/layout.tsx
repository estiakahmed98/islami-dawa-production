//Estiak

import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-screen place-items-center px-4 py-8">
      <main className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex items-center justify-center bg-[#155E75] p-2 rounded-lg">
       <Image
          src="/logo_img.png"
          width={100}
          height={100}
          alt="logo"
          priority
        />
        <h1 className="text-xl font-bold text-center text-white">ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ </h1>
       </div>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
