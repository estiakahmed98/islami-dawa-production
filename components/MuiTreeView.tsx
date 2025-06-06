"use client"; //Juwel

import React, { useState, useEffect, JSX, useCallback } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SimpleTreeView, TreeItem as MuiTreeItem } from "@mui/x-tree-view";
import IconButton from "@mui/material/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useSelectedUser } from "@/providers/treeProvider";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ScrollArea } from "./ui/scroll-area";
import { PiTreeViewBold } from "react-icons/pi";

export const roleList = [
  "centraladmin",
  "divisionadmin",
  "markazadmin",
  "daye",
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  markaz: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  phone?: string;
}

interface TreeNode {
  id: string;
  label: string;
  user?: string;
  children?: TreeNode[];
}

const MuiTreeView: React.FC = () => {
  const { setSelectedUser } = useSelectedUser();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch users");

        const usersData: User[] = await response.json();
        setUsers(usersData);
        const tree = buildTree(
          usersData,
          session?.user
            ? { ...session.user, role: session.user.role || "" }
            : null
        );
        setTreeData(tree);
        setFilteredTree(tree);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [session?.user]);

  const buildTree = (users: User[], loggedInUser: User | null): TreeNode[] => {
    if (loggedInUser) {
      loggedInUser.role = loggedInUser.role || "";
    }
    const userMap = new Map<string, TreeNode>();

    users.forEach((user) => {
      userMap.set(user.email, {
        id: user.id,
        label: `${user.name} (${user.role})`,
        user: user.email,
        children: [],
      });
    });

    users.forEach((user) => {
      const parentEmail = getParentEmail(user, users);
      if (parentEmail && userMap.has(parentEmail)) {
        userMap.get(parentEmail)!.children?.push(userMap.get(user.email)!);
      }
    });

    if (loggedInUser) {
      if (loggedInUser.role === "centraladmin") {
        return users
          .filter((u) => u.role === "centraladmin")
          .map((u) => userMap.get(u.email)!);
      } else {
        return [userMap.get(loggedInUser.email)!];
      }
    }
    return [];
  };

  const getParentEmail = (user: User, users: User[]): string | null => {
    let parentUser: User | undefined;
    switch (user.role) {
      case "divisionadmin":
        parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "markazadmin":
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "daye":
        parentUser = users.find(
          (u) => u.role === "markazadmin" && u.markaz === user.markaz
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;

      default:
        return null;
    }
    return parentUser ? parentUser.email : null;
  };

  const handleItemClick = useCallback(
    (event: React.SyntheticEvent, nodeId: string) => {
      event.stopPropagation();
      const selectedUser = users.find((user) => user.id === nodeId);
      if (selectedUser) {
        setSelectedUser(selectedUser.email);
        router.push("/admin");
      }
    },
    [users, router, setSelectedUser]
  );

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTree(treeData);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filterNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .filter(
          (node) =>
            node.label.toLowerCase().includes(lowerCaseQuery) ||
            (node.children &&
              node.children.some((child) => filterNodes([child]).length))
        )
        .map((node) => ({
          ...node,
          children: node.children ? filterNodes(node.children) : [],
        }));

    setFilteredTree(filterNodes(treeData));
    setExpanded(getAllIds(filterNodes(treeData)));
  }, [searchQuery, treeData]);

  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="bg-amber-600 font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleToggle = () => {
    setExpanded(isExpanded ? [] : getAllIds(filteredTree));
    setIsExpanded(!isExpanded);
  };

  const getAllIds = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((node) => [
      node.id.toString(),
      ...(node.children ? getAllIds(node.children) : []),
    ]);

  const renderTree = (nodes: TreeNode[]): JSX.Element[] | null => {
    if (!nodes?.length) return null;
    return nodes.map((node) => (
      <MuiTreeItem
        key={node.id}
        itemId={node.id.toString()}
        label={highlightMatch(node.label, searchQuery)}
        onClick={(event) => handleItemClick(event, node.id)}
      >
        {node.children && renderTree(node.children)}
      </MuiTreeItem>
    ));
  };

  return (
    <ScrollArea className="overflow-y-auto text-white font-semibold py-4 shrink-0">
      <Stack spacing={2}>
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[85%] mx-auto p-2 border rounded-md text-black"
        />

        <IconButton size="small" onClick={handleToggle} className="text-white">
          <PiTreeViewBold className="size-6 text-white" />
          <span className="text-white">
            {isExpanded ? "Collapse All" : "Expand All"}
          </span>
          {isExpanded ? (
            <ArrowDropUpIcon className="text-white" />
          ) : (
            <ArrowDropDownIcon className="text-white" />
          )}
        </IconButton>

        <Box sx={{ minHeight: 352, minWidth: 300 }}>
          <SimpleTreeView
            expandedItems={expanded}
            onExpandedItemsChange={(e, ids) => setExpanded(ids)}
          >
            {renderTree(filteredTree)}
          </SimpleTreeView>
        </Box>
      </Stack>
    </ScrollArea>
  );
};

export default MuiTreeView;
