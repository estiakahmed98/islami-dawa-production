"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { divisions, districts, upazilas, unions } from "@/app/data/bangla";

const formSchema = z.object({
  name: z.string().min(1, "Required"),
  divisionId: z.string().min(1, "Required"),
  districtId: z.string().min(1, "Required"),
  upazilaId: z.string().min(1, "Required"),
  unionId: z.string().min(1, "Required"),
});
type FormValues = z.infer<typeof formSchema>;

type Markaz = {
  id: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
};

type ListResponse = {
  data: Markaz[];
  meta: { page: number; pageSize: number; total: number; totalPages: number; query: string };
};

const pickTitle = (arr: Array<{ value: string | number; title: string }>, id: string) =>
  arr.find((x) => String(x.value) === String(id))?.title || "";

export default function MarkazPage() {
  const [items, setItems] = React.useState<Markaz[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Markaz | null>(null);
  const [deleting, setDeleting] = React.useState<Markaz | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/markaz-masjid?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`, {
        cache: "no-store",
      });
      const json: ListResponse = await res.json();
      if (!res.ok) throw new Error((json as any).error || "Failed to fetch");
      setItems(json.data);
      setTotalPages(json.meta.totalPages);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q, page, pageSize]);

  React.useEffect(() => { reload(); }, [reload]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    reload();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Markaz</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B]" onClick={() => setEditing(null)}>
              Add Markaz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Markaz" : "Create Markaz"}</DialogTitle>
            </DialogHeader>
            <MarkazForm
              defaultValues={editing ?? undefined}
              onCancel={() => setOpen(false)}
              onSuccess={() => { setOpen(false); setEditing(null); reload(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={onSearch} className="flex items-center gap-2">
        <Input placeholder="Search here..." value={q} onChange={(e) => setQ(e.target.value)} />
        <Button className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B]" type="submit" disabled={loading}>Search</Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Upazila</TableHead>
              <TableHead>Union</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7}>No data</TableCell></TableRow>
            ) : (
              items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.division}</TableCell>
                  <TableCell>{m.district}</TableCell>
                  <TableCell>{m.upazila}</TableCell>
                  <TableCell>{m.union}</TableCell>
                  <TableCell>{m._count?.users ?? 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(m); setOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleting(m)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
        <div className="space-x-2">
          <Button className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B]" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B]" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Markaz</DialogTitle>
          </DialogHeader>
        <p>Are you sure you want to delete <b>{deleting?.name}</b>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/markaz-masjid/${deleting?.id}`, { method: "DELETE" });
                  if (!res.ok) {
                    const j = await res.json();
                    throw new Error(j.error || "Failed to delete");
                  }
                  toast.success("Deleted");
                  setDeleting(null);
                  reload();
                } catch (e: any) {
                  toast.error(e.message || "Failed to delete");
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------- Form with cascading selects -----------------------
function MarkazForm({
  defaultValues,
  onCancel,
  onSuccess,
}: {
  defaultValues?: Partial<Markaz & { id?: string }>;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  // Edit mode: saved titles → IDs
  const findIdsFromTitles = React.useCallback(() => {
    if (!defaultValues) return { divisionId: "", districtId: "", upazilaId: "", unionId: "" };
    const div = divisions.find((d) => d.title === defaultValues.division);
    const divisionId = div ? String(div.value) : "";

    const distList = divisionId ? (districts as any)[divisionId] || [] : [];
    const dist = distList.find((d: any) => d.title === defaultValues.district);
    const districtId = dist ? String(dist.value) : "";

    const upaList = districtId ? (upazilas as any)[districtId] || [] : [];
    const upa = upaList.find((u: any) => u.title === defaultValues.upazila);
    const upazilaId = upa ? String(upa.value) : "";

    const uniList = upazilaId ? (unions as any)[upazilaId] || [] : [];
    const uni = uniList.find((u: any) => u.title === defaultValues.union);
    const unionId = uni ? String(uni.value) : "";

    return { divisionId, districtId, upazilaId, unionId };
  }, [defaultValues]);

  const initialIds = findIdsFromTitles();

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, watch, reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      divisionId: initialIds.divisionId,
      districtId: initialIds.districtId,
      upazilaId: initialIds.upazilaId,
      unionId: initialIds.unionId,
    },
  });

  // Watch IDs for dependent options
  const divisionId = watch("divisionId");
  const districtId = watch("districtId");
  const upazilaId = watch("upazilaId");

  React.useEffect(() => {
    const ids = findIdsFromTitles();
    reset({
      name: defaultValues?.name || "",
      divisionId: ids.divisionId,
      districtId: ids.districtId,
      upazilaId: ids.upazilaId,
      unionId: ids.unionId,
    });
  }, [defaultValues, findIdsFromTitles, reset]);

  const isEdit = Boolean(defaultValues?.id);

  const onSubmit = async (values: FormValues) => {
    const division = pickTitle(divisions as any, values.divisionId);
    const district = pickTitle(((districts as any)[values.divisionId] || []), values.districtId);
    const upazila  = pickTitle(((upazilas as any)[values.districtId] || []), values.upazilaId);
    const union    = pickTitle(((unions as any)[values.upazilaId] || []), values.unionId);

    try {
      const payload = { name: values.name, division, district, upazila, union };

      const res = await fetch(isEdit ? `/api/markaz-masjid/${(defaultValues as any).id}` : "/api/markaz-masjid", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to save");

      toast.success(isEdit ? "Updated" : "Created");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const districtOptions = divisionId ? ((districts as any)[divisionId] || []) : [];
  const upazilaOptions  = districtId ? ((upazilas as any)[districtId] || []) : [];
  const unionOptions    = upazilaId ? ((unions as any)[upazilaId] || []) : [];

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label>Division</Label>
          <select
            className="w-full p-2 border rounded-md"
            {...register("divisionId")}
            onChange={(e) => {
              const v = e.target.value;
              // RHF register onChange
              register("divisionId").onChange(e);
              // children clear
              reset({ ...watch(), divisionId: v, districtId: "", upazilaId: "", unionId: "" });
            }}
          >
            <option value="">Select division</option>
            {(divisions as any).map((d: any) => (
              <option key={d.value} value={d.value}>{d.title}</option>
            ))}
          </select>
          {errors.divisionId && <p className="text-sm text-red-500">{errors.divisionId.message}</p>}
        </div>

        <div>
          <Label>District</Label>
          <select
            className="w-full p-2 border rounded-md"
            {...register("districtId")}
            disabled={!divisionId}
            onChange={(e) => {
              const v = e.target.value;
              register("districtId").onChange(e);
              reset({ ...watch(), districtId: v, upazilaId: "", unionId: "" });
            }}
          >
            <option value="">Select district</option>
            {districtOptions.map((d: any) => (
              <option key={d.value} value={d.value}>{d.title}</option>
            ))}
          </select>
          {errors.districtId && <p className="text-sm text-red-500">{errors.districtId.message}</p>}
        </div>
        {/* Upazila */}
        <div>
          <Label>Upazila</Label>
          <select
            className="w-full p-2 border rounded-md"
            {...register("upazilaId")}
            disabled={!districtId}
            onChange={(e) => {
              const v = e.target.value;
              register("upazilaId").onChange(e);
              reset({ ...watch(), upazilaId: v, unionId: "" });
            }}
          >
            <option value="">Select upazila</option>
            {upazilaOptions.map((u: any) => (
              <option key={u.value} value={u.value}>{u.title}</option>
            ))}
          </select>
          {errors.upazilaId && <p className="text-sm text-red-500">{errors.upazilaId.message}</p>}
        </div>

        {/* Union */}
        <div>
          <Label>Union</Label>
          <select
            className="w-full p-2 border rounded-md"
            {...register("unionId")}
            disabled={!upazilaId}
          >
            <option value="">Select union</option>
            {unionOptions.map((u: any) => (
              <option key={u.value} value={u.value}>{u.title}</option>
            ))}
          </select>
          {errors.unionId && <p className="text-sm text-red-500">{errors.unionId.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isEdit ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
