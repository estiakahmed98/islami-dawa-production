"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSelectedUser } from "@/providers/treeProvider";
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
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        const usersData: User[] = await response.json();
        setUsers(usersData);
        const tree = buildBfsTree(usersData, session?.user || null);
        setNodes(tree);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [session?.user]);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(".tree-container");

    const root = d3.hierarchy(nodes[0], (d) => d.children);

    const treeLayout = d3.tree<TreeNode>().size([width - 200, height - 200]); // Adjusted for top-to-bottom layout
    treeLayout(root);

    const node = g.selectAll<SVGGElement, d3.HierarchyNode<TreeNode>>(".node")
      .data(root.descendants(), (d) => d.data.id)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`) // Adjusted for top-to-bottom layout
      .on("click", (_, d) => handleNodeClick(d))
      .on("mouseover", function() {
        d3.select(this).select("circle").attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        d3.select(this).select("circle").attr("stroke-width", 1);
      });

    node.append("circle")
      .attr("r", 40) // Increased node size
      .attr("fill", (d) => getNodeColor(d.data.label))
      .attr("stroke", "#155E75")
      .attr("stroke-width", 4);

    node.append("text")
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px") // Increased font size
      .text((d) => d.data.label.split(" ")[0]);

    g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>(".link")
      .data(root.links(), (d) => d.target.data.id)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical<d3.HierarchyLink<TreeNode>>() // Adjusted for top-to-bottom layout
        .x((d) => d.x)
        .y((d) => d.y))
      .attr("fill", "none")
      .attr("stroke", "#155E75")
      .attr("stroke-dasharray", (d) => Math.max(2, d.source.depth + 1)) // Scalable line width
      .style("transition", "stroke-width 0.2s");

    g.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`);
  }, [nodes, transform]);

  const handleNodeClick = (d: d3.HierarchyNode<TreeNode>) => {
    const user = users.find((u) => u.id === d.data.id);
    if (user) {
      setSelectedUser(user.email);
    }
  };

  const buildBfsTree = (users: User[], loggedInUser: User | null): TreeNode[] => {
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

    // Perform BFS traversal
    const queue: TreeNode[] = [];
    const rootNode = userMap.get(loggedInUser.email)!;
    queue.push(rootNode);

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const children = users.filter((user) => getParentEmail(user, users) === currentNode.user);
      currentNode.children = children.map((child) => userMap.get(child.email)!);
      queue.push(...currentNode.children);
    }

    return [rootNode];
  };

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
          // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
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
          // Step 3: If no unionadmin is found, find a districtadmin in the same district
          if (!parentUser) {
            parentUser = users.find(
              (u) => u.role === "districtadmin" && u.district === user.district
            );
          }
          // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
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
          // Step 1: Try to find a unionadmin in the same union
          parentUser = users.find(
            (u) => u.role === "unionadmin" && u.union === user.union
          );
  
          // Step 2: If no unionadmin is found, find a upozila in the same upozila
          if (!parentUser) {
            parentUser = users.find(
              (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
            );
          }
  
          // Step 3: If no unionadmin is found, find a districtadmin in the same district
          if (!parentUser) {
            parentUser = users.find(
              (u) => u.role === "districtadmin" && u.district === user.district
            );
          }
          // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
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

  const getNodeColor = (label: string) => {
    if (label.includes("centraladmin")) return "#4A90E2";
    if (label.includes("divisionadmin")) return "#50E3C2";
    if (label.includes("districtadmin")) return "#F5A623";
    if (label.includes("upozilaadmin")) return "#BD10E0";
    if (label.includes("unionadmin")) return "#7ED321";
    return "#D0021B";
  };

  const handleZoom = (direction: "in" | "out") => {
    const scale = direction === "in" ? transform.k * 1.2 : transform.k / 1.2;
    setTransform({ ...transform, k: scale });
  };

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

  return (
    <div className="relative h-[80vh] w-full rounded-lg overflow-hidden ">
      <div ref={containerRef} className="absolute inset-0">
        <svg ref={svgRef} className="w-full h-full">
          <g className="tree-container " />
        </svg>
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
      </div>
    </div>
  );
};

export default RealTree;