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

/* -------------------- schema & types -------------------- */
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

/* -------------------- page -------------------- */
export default function MarkazPage() {
  const [items, setItems] = React.useState<Markaz[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Markaz | null>(null);
  const [deleting, setDeleting] = React.useState<Markaz | null>(null);

  // no pagination: just ask the API for a large pageSize
  const page = 1;
  const pageSize = 1000;

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/markaz-masjid?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`, {
        cache: "no-store",
      });
      const json: ListResponse = await res.json();
      if (!res.ok) throw new Error((json as any).error || "Failed to fetch");
      setItems(json.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => { reload(); }, [reload]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    reload();
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-semibold">Markaz Masjid</h1>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B] w-full xs:w-auto"
              onClick={() => setEditing(null)}
              size="sm"
            >
              Add Markaz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg p-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editing ? "Edit Markaz" : "Create Markaz"}
              </DialogTitle>
            </DialogHeader>
            <MarkazForm
              defaultValues={editing ?? undefined}
              onCancel={() => setOpen(false)}
              onSuccess={() => { setOpen(false); setEditing(null); reload(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* search */}
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Search here..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full"
        />
        <Button
          className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B]"
          type="submit"
          disabled={loading}
          size="sm"
        >
          Search
        </Button>
      </form>

      {/* list/table wrapper with viewport-height scroll */}
      <div className="rounded-md border overflow-hidden">
        {/* mobile cards (md:hidden) */}
        <div className="md:hidden max-h-[calc(100vh-250px)] overflow-y-auto overscroll-contain p-2 space-y-3">
          {loading ? (
            <div className="text-center py-6 text-sm">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-6 text-sm">No data</div>
          ) : (
            items.map((m) => (
              <div key={m.id} className="rounded-lg border p-3 shadow-sm bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-base">{m.name}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      <div><span className="font-medium">Division:</span> {m.division || "-"}</div>
                      <div><span className="font-medium">District:</span> {m.district || "-"}</div>
                      <div><span className="font-medium">Upazila:</span> {m.upazila || "-"}</div>
                      <div><span className="font-medium">Union:</span> {m.union || "-"}</div>
                      <div><span className="font-medium">Users:</span> {m._count?.users ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => { setEditing(m); setOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1"
                    onClick={() => setDeleting(m)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* desktop table (hidden on mobile) */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto overscroll-contain">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-20 bg-white shadow-sm">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Name</TableHead>
                    <TableHead className="whitespace-nowrap">Division</TableHead>
                    <TableHead className="whitespace-nowrap">District</TableHead>
                    <TableHead className="whitespace-nowrap">Upazila</TableHead>
                    <TableHead className="whitespace-nowrap">Union</TableHead>
                    <TableHead className="whitespace-nowrap">Users</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
                  ) : items.length === 0 ? (
                    <TableRow><TableCell colSpan={7}>No data</TableCell></TableRow>
                  ) : (
                    items.map((m) => (
                      <TableRow key={m.id} className="align-top">
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>{m.division}</TableCell>
                        <TableCell>{m.district}</TableCell>
                        <TableCell>{m.upazila}</TableCell>
                        <TableCell>{m.union}</TableCell>
                        <TableCell>{m._count?.users ?? 0}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditing(m); setOpen(true); }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleting(m)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* delete dialog */}
      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Markaz</DialogTitle>
          </DialogHeader>
          <p className="text-sm sm:text-base">
            Are you sure you want to delete <b>{deleting?.name}</b>? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
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

/* -------------------- form (responsive + cascading selects) -------------------- */
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
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label className="text-sm">Name</Label>
          <Input {...register("name")} className="h-9" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Division */}
        <div>
          <Label className="text-sm">Division</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
            {...register("divisionId")}
            onChange={(e) => {
              const v = e.target.value;
              register("divisionId").onChange(e);
              reset({ ...watch(), divisionId: v, districtId: "", upazilaId: "", unionId: "" });
            }}
          >
            <option value="">Select division</option>
            {(divisions as any).map((d: any) => (
              <option key={d.value} value={d.value}>{d.title}</option>
            ))}
          </select>
          {errors.divisionId && <p className="text-xs text-red-500 mt-1">{errors.divisionId.message}</p>}
        </div>

        {/* District */}
        <div>
          <Label className="text-sm">District</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
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
          {errors.districtId && <p className="text-xs text-red-500 mt-1">{errors.districtId.message}</p>}
        </div>

        {/* Upazila */}
        <div>
          <Label className="text-sm">Upazila</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
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
          {errors.upazilaId && <p className="text-xs text-red-500 mt-1">{errors.upazilaId.message}</p>}
        </div>

        {/* Union */}
        <div>
          <Label className="text-sm">Union</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
            {...register("unionId")}
            disabled={!upazilaId}
          >
            <option value="">Select union</option>
            {unionOptions.map((u: any) => (
              <option key={u.value} value={u.value}>{u.title}</option>
            ))}
          </select>
          {errors.unionId && <p className="text-xs text-red-500 mt-1">{errors.unionId.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} size="sm">{isEdit ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
