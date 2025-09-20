import RealTree from "@/components/RealTree";
import TreeProvider from "@/providers/treeProvider";

const Page = () => {
  return (
    <TreeProvider>
      <div>
        <RealTree />
      </div>
    </TreeProvider>
  );
};

export default Page;
