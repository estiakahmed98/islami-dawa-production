"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSelectedUser } from "@/providers/treeProvider";
import { useSession } from "@/lib/auth-client";
import { Move, ZoomIn, ZoomOut } from "lucide-react";
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
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const { data: session } = useSession();
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

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

    // Clear previous content
    g.selectAll("*").remove();

    const root = d3.hierarchy(nodes[0], (d) => d.children);
    const leafCount = root.leaves().length;
    const nodeSize = 120;
    const horizontalSpacing = Math.max(width / (leafCount + 1), nodeSize * 2);

    const treeLayout = d3
      .tree<TreeNode>()
      .nodeSize([horizontalSpacing, 200])
      .separation(
        (a, b) =>
          (a.parent == b.parent ? 1 : 2) *
          (1 + Math.min(a.depth, b.depth) * 0.5)
      );

    treeLayout(root);

    // Create links
    g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkVertical<d3.HierarchyLink<TreeNode>>()
          .x((d) => d.x)
          .y((d) => d.y)
      )
      .attr("fill", "none")
      .attr("stroke", "#155E75")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d) => Math.max(2, d.source.depth + 1));

    // Create nodes
    const node = g
      .selectAll<SVGGElement, d3.HierarchyNode<TreeNode>>(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", 70)
      .attr("fill", (d) => getNodeColor(d.data.label))
      .attr("stroke", "#155E75")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
      .on("click", (_, d) => handleNodeClick(d))
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 42)
          .attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 40)
          .attr("stroke-width", 2);
      });

    node
      .append("text")
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .each(function (d) {
        const text = d.data.label;
        const [name, role] = text.split(" (");
        const el = d3.select(this);
        el.append("tspan").attr("x", 0).attr("dy", "-0.6em").text(name);
        el.append("tspan").attr("x", 0).attr("dy", "1.2em").text(`(${role}`);
      });

    // Initialize zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Center the tree initially
    const bounds = root.descendants().reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.x),
        maxX: Math.max(acc.maxX, node.x),
        minY: Math.min(acc.minY, node.y),
        maxY: Math.max(acc.maxY, node.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const centerX = (bounds.maxX + bounds.minX) / 2;
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - centerX, 100)
      .scale(1);

    svg.call(zoom.transform, initialTransform);

    return () => {
      svg.on(".zoom", null);
    };
  }, [nodes]);

  const handleNodeClick = (d: d3.HierarchyNode<TreeNode>) => {
    const user = users.find((u) => u.id === d.data.id);
    if (user) setSelectedUser(user.email);
  };

  // Rest of the helper functions (buildBfsTree, getParentEmail, getNodeColor) remain the same
  const buildBfsTree = (
    users: User[],
    loggedInUser: User | null
  ): TreeNode[] => {
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

    const queue: TreeNode[] = [];
    const rootNode = userMap.get(loggedInUser.email)!;
    queue.push(rootNode);

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      const children = users.filter(
        (user) => getParentEmail(user, users) === currentNode.user
      );
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

  const getNodeColor = (label: string) => {
    if (label.includes("centraladmin")) return "#4A90E2";
    if (label.includes("divisionadmin")) return "#50E3C2";
    if (label.includes("districtadmin")) return "#F5A623";
    if (label.includes("upozilaadmin")) return "#BD10E0";
    if (label.includes("unionadmin")) return "#7ED321";
    return "#D0021B";
  };

  const handleZoom = (direction: "in" | "out") => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const currentTransform = d3.zoomTransform(svg.node()!);
    const newScale =
      direction === "in" ? currentTransform.k * 1.2 : currentTransform.k / 1.2;
    const newTransform = d3.zoomIdentity
      .translate(currentTransform.x, currentTransform.y)
      .scale(newScale);
    svg
      .transition()
      .duration(200)
      .call(zoomRef.current.transform, newTransform);
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
    <div className="relative h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <svg ref={svgRef} className="w-full h-full">
          <g className="tree-container" />
        </svg>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            onClick={() => handleZoom("in")}
            size="sm"
            variant="secondary"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleZoom("out")}
            size="sm"
            variant="secondary"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTree;
