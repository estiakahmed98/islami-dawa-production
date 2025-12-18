import { useCallback, useMemo } from "react";

interface User {
  email: string;
  role: string;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  markaz?:
    | string
    | { name: string; id?: string }
    | { id: string; name: string }[]
    | null;
}

export const useParentEmail = () => {
  const getMarkazId = useCallback((u: User): string | null => {
    if (!u?.markaz) return null;
    if (typeof u.markaz === "string") return u.markaz;
    if (Array.isArray(u.markaz)) return null;
    return (u.markaz as any).id ?? (u.markaz as any).name ?? null;
  }, []);

  const shareMarkaz = useCallback(
    (a: User, b: User): boolean => {
      const aId = getMarkazId(a);
      const bId = getMarkazId(b);
      return !!(aId && bId && aId === bId);
    },
    [getMarkazId]
  );

  const getMarkazName = useCallback((u: User): string | null => {
    if (!u?.markaz) return null;
    if (typeof u.markaz === "string") return u.markaz;
    if (Array.isArray(u.markaz)) return null;
    return (u.markaz as any).name ?? null;
  }, []);

  const getParentEmail = useCallback(
    (user: User, users: User[], loggedInUser: User | null): string | null => {
      let parentUser: User | undefined;

      switch (user.role) {
        case "divisionadmin": {
          parentUser =
            (loggedInUser?.role === "centraladmin"
              ? loggedInUser
              : undefined) || users.find((u) => u.role === "centraladmin");
          break;
        }
        case "markazadmin": {
          parentUser =
            users.find(
              (u) => u.role === "divisionadmin" && u.division === user.division
            ) ||
            (loggedInUser?.role === "centraladmin"
              ? loggedInUser
              : undefined) ||
            users.find((u) => u.role === "centraladmin");
          break;
        }
        case "daye": {
          parentUser =
            users.find(
              (u) => u.role === "markazadmin" && shareMarkaz(u, user)
            ) ||
            users.find(
              (u) => u.role === "divisionadmin" && u.division === user.division
            ) ||
            (loggedInUser?.role === "centraladmin"
              ? loggedInUser
              : undefined) ||
            users.find((u) => u.role === "centraladmin");
          break;
        }
        default:
          return null;
      }

      return parentUser ? parentUser.email : null;
    },
    [shareMarkaz]
  );

  return useMemo(
    () => ({ getParentEmail, shareMarkaz, getMarkazId, getMarkazName }),
    [getParentEmail, shareMarkaz, getMarkazId, getMarkazName]
  );
};
