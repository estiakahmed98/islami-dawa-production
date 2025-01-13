// import React, { useState, useEffect } from "react";
// import Box from "@mui/material/Box";
// import Stack from "@mui/material/Stack";
// import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
// import IconButton from "@mui/material/IconButton";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
// import { useSelectedUser } from "@/providers/treeProvider";
// import { useRouter } from "next/navigation";

// interface TreeNode {
//   id: number;
//   label: string;
//   user?: string;
//   children?: TreeNode[];
// }

// export default function OnItemClick() {
//   const [userEmail, setUserEmail] = useState<string>("");
//   const { setSelectedUser } = useSelectedUser();
//   const [expanded, setExpanded] = useState<number[]>([]);
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);

//   const router = useRouter();
//   let idCounter = 1;

//   const generateUniqueId = (): number => idCounter++;

//   useEffect(() => {
//     const storedEmail = localStorage.getItem("userEmail");
//     if (storedEmail) {
//       setUserEmail(storedEmail);
//     }
//   }, []);

//   const getFilteredTreeData = (user: string): TreeNode[] => {
//     const unions: Record<string, TreeNode> = {
//       "zisan@gmail.com": {
//         id: 5,
//         label: "Zisan",
//         user: "zisan@gmail.com",
//         children: [
//           { id: 6, label: "Faysal", user: "faysal@gmail.com" },
//           { id: 7, label: "Jewel", user: "jewel@gmail.com" },
//         ],
//       },
//       "tauhid@gmail.com": {
//         id: 8,
//         label: "Tauhid",
//         user: "tauhid@gmail.com",
//         children: [
//           { id: 9, label: "Riyad", user: "riyad@gmail.com" },
//           { id: 10, label: "Nazmul", user: "nazmul@gmail.com" },
//         ],
//       },
//     };

//     if (user === "zisan@gmail.com") {
//       return [
//         {
//           id: 106,
//           label: "Union Admin",
//           children: [unions["zisan@gmail.com"]],
//         },
//       ];
//     } else if (user === "tauhid@gmail.com") {
//       return [
//         {
//           id: 107,
//           label: "Union Admin",
//           children: [unions["tauhid@gmail.com"]],
//         },
//       ];
//     } else {
//       return [];
//     }
//   };

//   const treeData = userEmail ? getFilteredTreeData(userEmail) : [];

//   const renderTree = (nodes: TreeNode[]): React.ReactNode => {
//     if (!nodes || !Array.isArray(nodes)) return null;

//     return nodes.map((node) => (
//       <TreeItem
//         key={node.id}
//         itemId={node.id.toString()}
//         label={node.label}
//         onClick={() => {
//           if (node?.user) {
//             setSelectedUser(node.user);
//             router.push("/admin");
//           }
//         }}
//       >
//         {node.children && renderTree(node.children)}
//       </TreeItem>
//     ));
//   };

//   const getAllIds = (nodes: TreeNode[]): number[] => {
//     let ids: number[] = [];
//     nodes.forEach((node) => {
//       ids.push(node.id);
//       if (node.children) {
//         ids = ids.concat(getAllIds(node.children));
//       }
//     });
//     return ids;
//   };

//   const handleToggle = () => {
//     if (isExpanded) {
//       setExpanded([]);
//     } else {
//       const allIds = getAllIds(treeData);
//       setExpanded(allIds);
//     }
//     setIsExpanded(!isExpanded);
//   };

//   return (
//     <div className="overflow-y-auto text-white font-semibold py-4 shrink-0">
//       <Stack spacing={2}>
//         <div className="flex justify-end px-4">
//           <IconButton size="small" onClick={handleToggle}>
//             <p className="text-white text-sm font-medium">
//               {isExpanded ? "Collapse All" : "Expand All"}
//             </p>
//             {isExpanded ? (
//               <ArrowDropUpIcon className="text-white" />
//             ) : (
//               <ArrowDropDownIcon className="text-white" />
//             )}
//           </IconButton>
//         </div>

//         <Box sx={{ minHeight: 352, minWidth: 300 }}>
//           {userEmail ? (
//             <SimpleTreeView
//               expandedItems={expanded.map(String)}
//               onExpandedItemsChange={(e, ids) => setExpanded(ids as unknown as number[])}
//             >
//               {renderTree(treeData)}
//             </SimpleTreeView>
//           ) : (
//             <p>Please log in to view your tree data.</p>
//           )}
//         </Box>
//       </Stack>
//     </div>
//   );
// }

"use client"

import React, { useState, useEffect, JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SimpleTreeView, TreeItem as MuiTreeItem } from "@mui/x-tree-view";
import IconButton from "@mui/material/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useSelectedUser } from "@/providers/treeProvider";
import { useRouter } from "next/navigation";

interface TreeNode {
  id: number;
  label: string;
  user?: string;
  children?: TreeNode[];
}

export default function OnItemClick() {
  const [userEmail, setUserEmail] = useState<string>("");
  const { setSelectedUser } = useSelectedUser();
  const [expanded, setExpanded] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  let idCounter = 1;
  const generateUniqueId = (): number => idCounter++;

  const getFilteredTreeData = (user: string): TreeNode[] => {
    const unions: Record<string, TreeNode> = {
      "rifat@gmail.com": {
        id: 4,
        label: "Rifat",
        user: "rifat@gmail.com",
        children: [
          {
            id: 5,
            label: "Zisan_union",
            user: "zisan@gmail.com",
            children: [
              { id: 6, label: "Faysal", user: "faysal@gmail.com" },
              { id: 7, label: "Jewel", user: "jewel@gmail.com" },
            ],
          },
          {
            id: 8,
            label: "Tauhid_union",
            user: "tauhid@gmail.com",
            children: [
              { id: 9, label: "Riyad", user: "riyad@gmail.com" },
              { id: 10, label: "Nazmul", user: "nazmul@gmail.com" },
            ],
          },
        ],
      },
      "zisan@gmail.com": {
        id: 5,
        label: "Zisan",
        user: "zisan@gmail.com",
        children: [
          { id: 6, label: "Faysal", user: "faysal@gmail.com" },
          { id: 7, label: "Jewel", user: "jewel@gmail.com" },
        ],
      },
      "tauhid@gmail.com": {
        id: 8,
        label: "Tauhid",
        user: "tauhid@gmail.com",
        children: [
          { id: 9, label: "Riyad", user: "riyad@gmail.com" },
          { id: 10, label: "Nazmul", user: "nazmul@gmail.com" },
        ],
      },
    };

    if (user === "rifat@gmail.com") {
      return [
        {
          id: 105,
          label: "Upozilla Admin",
          children: [unions["rifat@gmail.com"]],
        },
      ];
    } else if (user === "zisan@gmail.com") {
      return [
        {
          id: 106,
          label: "Union Admin",
          children: [unions["zisan@gmail.com"]],
        },
      ];
    } else if (user === "tauhid@gmail.com") {
      return [
        {
          id: 107,
          label: "Union Admin",
          children: [unions["tauhid@gmail.com"]],
        },
      ];
    } else {
      return [];
    }
  };

  const treeData = userEmail ? getFilteredTreeData(userEmail) : [];

  const renderTree = (nodes: TreeNode[]): JSX.Element[] | null => {
    if (!nodes || !Array.isArray(nodes)) return null;

    return nodes.map((node) => (
      <MuiTreeItem
        key={node.id}
        itemId={node.id.toString()}
        label={node.label}
        onClick={() => {
          if (node?.user) {
            setSelectedUser(node.user);
            router.push("/admin");
          }
        }}
      >
        {Array.isArray(node.children) && renderTree(node.children)}
      </MuiTreeItem>
    ));
  };

  const getAllIds = (nodes: TreeNode[]): number[] => {
    let ids: number[] = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        ids = ids.concat(getAllIds(node.children));
      }
    });
    return ids;
  };

  const handleToggle = () => {
    if (isExpanded) {
      setExpanded([]);
    } else {
      const allIds = getAllIds(treeData);
      setExpanded(allIds);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="overflow-y-auto text-white font-semibold py-4 shrink-0">
      <Stack spacing={2}>
        <div className="flex justify-end px-4">
          <IconButton size="small" onClick={handleToggle}>
            <p className="text-white text-sm font-medium">
              {isExpanded ? "Collapse All" : "Expand All"}
            </p>
            {isExpanded ? (
              <ArrowDropUpIcon className="text-white" />
            ) : (
              <ArrowDropDownIcon className="text-white" />
            )}
          </IconButton>
        </div>
        <Box sx={{ minHeight: 352, minWidth: 300 }}>
          {userEmail ? (
            <SimpleTreeView
              expandedItems={expanded.map(String)}
              onExpandedItemsChange={(e, ids) => setExpanded(ids as unknown as number[])}
            >
              {renderTree(treeData)}
            </SimpleTreeView>
          ) : (
            <p>Please log in to view your tree data.</p>
          )}
        </Box>
      </Stack>
    </div>
  );
}

