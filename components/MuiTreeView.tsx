"use client";

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
import { useTranslations } from "next-intl";

export const roleList = ["centraladmin", "divisionadmin", "markazadmin", "daye"];

type MarkazRef = { id: string; name: string };

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // markaz can be a string (legacy), null/undefined, or relation array
  markaz?: string | null | MarkazRef[];
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  phone?: string | null;
}

interface TreeNode {
  id: string;
  label: string;
  user?: string;
  children?: TreeNode[];
}

const MuiTreeView: React.FC = () => {
  const t = useTranslations("treeView");
  const { setSelectedUser } = useSelectedUser();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  // --- Helpers to normalize markaz relation ---
  const getMarkazIds = (u?: User): string[] => {
    if (!u?.markaz) return [];
    if (Array.isArray(u.markaz)) return u.markaz.map((m) => m.id).filter(Boolean);
    return []; // legacy string has no ID
  };
  const getMarkazNames = (u?: User): string[] => {
    if (!u?.markaz) return [];
    if (Array.isArray(u.markaz)) return u.markaz.map((m) => m.name).filter(Boolean);
    if (typeof u.markaz === "string" && u.markaz.trim()) return [u.markaz.trim()];
    return [];
  };
  const shareMarkaz = (a: User, b: User): boolean => {
    const aIds = getMarkazIds(a);
    const bIds = getMarkazIds(b);
    if (aIds.length && bIds.length) return aIds.some((id) => bIds.includes(id));
    // fallback by name if ids missing
    const aNames = getMarkazNames(a);
    const bNames = getMarkazNames(b);
    if (aNames.length && bNames.length) return aNames.some((n) => bNames.includes(n));
    return false;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This route should now return markaz relation as [{id,name}] for each user
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) throw new Error(t("fetchError"));

        const usersData: User[] = await response.json();
        setUsers(usersData);

        const loggedInUser: User | null = session?.user
          ? { ...(session.user as unknown as User), role: (session.user as any).role || "" }
          : null;

        const tree = buildTree(usersData, loggedInUser);
        setTreeData(tree);
        setFilteredTree(tree);
      } catch (error) {
        console.error(t("fetchError"), error);
      }
    };

    fetchUsers();
  }, [session?.user, t]);

  // Build tree; centraladmin sees themselves as root so children hang under them
  const buildTree = (users: User[], loggedInUser: User | null): TreeNode[] => {
    const userMap = new Map<string, TreeNode>();

    users.forEach((user) => {
      userMap.set(user.email, {
        id: user.id,
        label: `${user.name} (${t(`roles.${user.role}`)})`,
        user: user.email,
        children: [],
      });
    });

    users.forEach((user) => {
      const parentEmail = getParentEmail(user, users, loggedInUser);
      if (parentEmail && userMap.has(parentEmail) && userMap.has(user.email)) {
        userMap.get(parentEmail)!.children!.push(userMap.get(user.email)!);
      }
    });

    if (loggedInUser) {
      const selfNode = userMap.get(loggedInUser.email);
      return selfNode ? [selfNode] : [];
    }
    return [];
  };

  // Parent resolution updated for markaz relation
  const getParentEmail = (
    user: User,
    users: User[],
    loggedInUser: User | null
  ): string | null => {
    let parentUser: User | undefined;

    switch (user.role) {
      case "divisionadmin": {
        parentUser =
          (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
          users.find((u) => u.role === "centraladmin");
        break;
      }
      case "markazadmin": {
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        if (!parentUser) {
          parentUser =
            (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
            users.find((u) => u.role === "centraladmin");
        }
        break;
      }
      case "daye": {
        // Find a markazadmin who shares at least one Markaz (by id first, name fallback)
        parentUser =
          users.find((u) => u.role === "markazadmin" && shareMarkaz(u, user)) ||
          (loggedInUser?.role === "centraladmin" ? loggedInUser : undefined) ||
          users.find((u) => u.role === "centraladmin");
        break;
      }
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

    const next = filterNodes(treeData);
    setFilteredTree(next);
    setExpanded(getAllIds(next));
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
            <span key={index}>{part}</span>
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
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[85%] mx-auto p-2 border rounded-md text-black"
        />

        <IconButton size="small" onClick={handleToggle} className="text-white">
          <PiTreeViewBold className="size-6 text-white" />
          <span className="text-white">
            {isExpanded ? t("collapseAll") : t("expandAll")}
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
