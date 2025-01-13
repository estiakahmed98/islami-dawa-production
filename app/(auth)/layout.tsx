import TreeProvider from "@/providers/treeProvider";
import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-screen place-items-center px-4 py-8">
      <main className="flex w-full max-w-sm flex-col gap-8">
        <Image
          src="/logo.svg"
          width={200}
          height={100}
          alt="logo"
          className="mx-auto w-44"
          priority
        />
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
