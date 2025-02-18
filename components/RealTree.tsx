"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSelectedUser } from "@/providers/treeProvider";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "./ui/button";

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
}

interface TreeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  user?: string;
  children?: TreeNode[];
  _children?: TreeNode[];
}

const RealTree = () => {
  const { setSelectedUser } = useSelectedUser();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set<string>());
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch users and build the tree
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        const usersData: User[] = await response.json();
        setUsers(usersData);
        const tree = buildTree(usersData, session?.user || null);
        setNodes(tree);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [session?.user]);

  // D3.js tree rendering
  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(".tree-container");

    // Create hierarchical data structure
    const root = d3.hierarchy(nodes[0], (d) =>
      expandedIds.has(d.id) ? d.children : null
    );

    // Tree layout
    const treeLayout = d3
      .tree<TreeNode>()
      .size([height, width - 200])
      .separation(() => 1);

    treeLayout(root);

    // Nodes
    const node = g
      .selectAll<SVGGElement, d3.HierarchyNode<TreeNode>>(".node")
      .data(root.descendants(), (d) => d.data.id);

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (_, d) => handleNodeClick(d));

    nodeEnter
      .append("rect")
      .attr("width", 120)
      .attr("height", 60)
      .attr("rx", 8)
      .attr("fill", "#1e293b");

    nodeEnter
      .append("text")
      .attr("x", 60)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) => d.data.label);

    // Links
    const link = g
      .selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>(".link")
      .data(root.links(), (d) => d.target.data.id);

    link
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal<d3.HierarchyLink<TreeNode>>()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#64748b");

    // Update positions
    node
      .merge(nodeEnter)
      .transition()
      .duration(300)
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Apply zoom/pan transform
    g.attr(
      "transform",
      `translate(${transform.x},${transform.y}) scale(${transform.k})`
    );
  }, [nodes, expandedIds, transform]);

  // Handle zoom controls
  const handleZoom = (direction: "in" | "out") => {
    const scale = direction === "in" ? transform.k * 1.2 : transform.k / 1.2;
    setTransform({ ...transform, k: scale });
  };

  // Handle pan controls
  const handlePanStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX - transform.x;
    const startY = e.clientY - transform.y;

    const onMove = (moveEvent: MouseEvent) => {
      setTransform({
        ...transform,
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // Handle node click
  const handleNodeClick = (d: d3.HierarchyNode<TreeNode>) => {
    const user = users.find((u) => u.id === d.data.id);
    if (user) {
      setSelectedUser(user.email);
      //   router.push("/admin");
    }

    if (d.children) {
      // Collapse node
      setExpandedIds(
        (prev) => new Set([...prev].filter((id) => id !== d.data.id))
      );
    } else if (d.data.children) {
      // Expand node
      setExpandedIds((prev) => new Set([...prev, d.data.id]));
    }
  };

  // Build the tree structure
  const buildTree = (users: User[], loggedInUser: User | null): TreeNode[] => {
    if (!loggedInUser) return [];

    const userMap = new Map<string, TreeNode>();

    users.forEach((user) => {
      userMap.set(user.email, {
        id: user.id,
        label: `${user.name} (${user.role})`,
        user: user.email,
        x: 0,
        y: 0,
        children: [],
      });
    });

    users.forEach((user) => {
      const parentEmail = getParentEmail(user, users);
      if (parentEmail && userMap.has(parentEmail)) {
        userMap.get(parentEmail)!.children?.push(userMap.get(user.email)!);
      }
    });

    if (loggedInUser.role === "centraladmin") {
      return users
        .filter((u) => u.role === "centraladmin")
        .map((u) => userMap.get(u.email)!);
    } else {
      return [userMap.get(loggedInUser.email)!];
    }
  };

  // Get parent email based on user role
  const getParentEmail = (user: User, users: User[]): string | null => {
    let parentUser: User | undefined;

    switch (user.role) {
      case "divisionadmin":
        parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "districtadmin":
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "upozilaadmin":
        parentUser = users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        );
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "unionadmin":
        parentUser = users.find(
          (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
        );
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "districtadmin" && u.district === user.district
          );
        }
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "daye":
        parentUser = users.find(
          (u) => u.role === "unionadmin" && u.union === user.union
        );
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
          );
        }
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "districtadmin" && u.district === user.district
          );
        }
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      default:
        return null;
    }
    return parentUser ? parentUser.email : null;
  };

  return (
    <div className="relative h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <svg ref={svgRef} className="w-full h-full">
          <g className="tree-container" />
        </svg>
      </div>

      {/* Zoom and pan controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button onClick={() => handleZoom("in")} size="sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleZoom("out")} size="sm">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button onMouseDown={handlePanStart} size="sm">
          <Move className="h-4 w-4" />
        </Button>
      </div>

      {/* Search input */}
      <div className="absolute top-4 left-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-[#155E75] text-[#155E75]"
        />
      </div>
    </div>
  );
};

export default RealTree;
