"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import { useTranslations } from "next-intl";

/* -------------------- types -------------------- */
type FormValues = {
  name: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  unionId: string;
};

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
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    query: string;
  };
};

const pickTitle = (
  arr: Array<{ value: string | number; title: string }>,
  id: string
) => arr.find((x) => String(x.value) === String(id))?.title || "";

/* -------------------- page -------------------- */
export default function MarkazPage() {
  const t = useTranslations("markaz");

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
      const res = await fetch(
        `/api/markaz-masjid?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`,
        { cache: "no-store" }
      );
      const json: ListResponse = await res.json();
      if (!res.ok) throw new Error((json as any).error || t("messages.fetchFailed"));
      setItems(json.data);
    } catch (e: any) {
      toast.error(e.message || t("messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [q, t]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    reload();
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-semibold">{t("title")}</h1>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-[#0F4F60] to-[#1B809B] w-full xs:w-auto"
              onClick={() => setEditing(null)}
              size="sm"
            >
              {t("buttons.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg p-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editing ? t("dialogs.editTitle") : t("dialogs.createTitle")}
              </DialogTitle>
            </DialogHeader>
            <MarkazForm
              defaultValues={editing ?? undefined}
              onCancel={() => setOpen(false)}
              onSuccess={() => {
                setOpen(false);
                setEditing(null);
                reload();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* search */}
      <form
        onSubmit={onSearch}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <Input
          placeholder={t("searchPlaceholder")}
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
          {t("buttons.search")}
        </Button>
      </form>

      {/* list/table wrapper with viewport-height scroll */}
      <div className="rounded-md border overflow-hidden">
        {/* mobile cards (md:hidden) */}
        <div className="md:hidden max-h-[calc(100vh-280px)] overflow-y-auto overscroll-contain p-2 space-y-3">
          {loading ? (
            <div className="text-center py-6 text-sm">{t("messages.loading")}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-6 text-sm">{t("messages.noData")}</div>
          ) : (
            items.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border p-3 shadow-sm bg-white"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-base">{m.name}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{t("table.division")}:</span>{" "}
                        {m.division || "-"}
                      </div>
                      <div>
                        <span className="font-medium">{t("table.district")}:</span>{" "}
                        {m.district || "-"}
                      </div>
                      <div>
                        <span className="font-medium">{t("table.upazila")}:</span>{" "}
                        {m.upazila || "-"}
                      </div>
                      <div>
                        <span className="font-medium">{t("table.union")}:</span>{" "}
                        {m.union || "-"}
                      </div>
                      <div>
                        <span className="font-medium">{t("table.users")}:</span>{" "}
                        {m._count?.users ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(m);
                      setOpen(true);
                    }}
                  >
                    {t("buttons.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleting(m)}
                  >
                    {t("buttons.delete")}
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
                    <TableHead className="whitespace-nowrap">
                      {t("table.name")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("table.division")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("table.district")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("table.upazila")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("table.union")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("table.users")}
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7}>{t("messages.loading")}</TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>{t("messages.noData")}</TableCell>
                    </TableRow>
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
                            onClick={() => {
                              setEditing(m);
                              setOpen(true);
                            }}
                          >
                            {t("buttons.edit")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleting(m)}
                          >
                            {t("buttons.delete")}
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
            <DialogTitle>{t("dialogs.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm sm:text-base">
            {t.rich("dialogs.deleteConfirm", {
              name: deleting?.name ?? "",
              b: (chunks) => <b>{chunks}</b>,
            })}
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t("buttons.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const res = await fetch(
                    `/api/markaz-masjid/${deleting?.id}`,
                    { method: "DELETE" }
                  );
                  if (!res.ok) {
                    const j = await res.json();
                    throw new Error(j.error || t("messages.saveFailed"));
                  }
                  toast.success(t("messages.deleted"));
                  setDeleting(null);
                  reload();
                } catch (e: any) {
                  toast.error(e.message || t("messages.saveFailed"));
                }
              }}
            >
              {t("buttons.delete")}
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
  const t = useTranslations("markaz");

  // Build schema WITH localized messages
  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("validation.required")),
        divisionId: z.string().min(1, t("validation.required")),
        districtId: z.string().min(1, t("validation.required")),
        upazilaId: z.string().min(1, t("validation.required")),
        unionId: z.string().min(1, t("validation.required")),
      }),
    [t]
  );

  // Edit mode: saved titles → IDs
  const findIdsFromTitles = React.useCallback(() => {
    if (!defaultValues)
      return { divisionId: "", districtId: "", upazilaId: "", unionId: "" };
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
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
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
    const district = pickTitle(
      ((districts as any)[values.divisionId] || []) as any,
      values.districtId
    );
    const upazila = pickTitle(
      ((upazilas as any)[values.districtId] || []) as any,
      values.upazilaId
    );
    const union = pickTitle(
      ((unions as any)[values.upazilaId] || []) as any,
      values.unionId
    );

    try {
      const payload = {
        name: values.name,
        division,
        district,
        upazila,
        union,
      };

      const res = await fetch(
        isEdit
          ? `/api/markaz-masjid/${(defaultValues as any).id}`
          : "/api/markaz-masjid",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || t("messages.saveFailed"));

      toast.success(isEdit ? t("messages.updated") : t("messages.created"));
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || t("messages.saveFailed"));
    }
  };

  const districtOptions = divisionId
    ? ((districts as any)[divisionId] || [])
    : [];
  const upazilaOptions = districtId ? ((upazilas as any)[districtId] || []) : [];
  const unionOptions = upazilaId ? ((unions as any)[upazilaId] || []) : [];

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Name */}
        <div>
          <Label className="text-sm">{t("labels.name")}</Label>
          <Input {...register("name")} className="h-9" />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Division */}
        <div>
          <Label className="text-sm">{t("labels.division")}</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
            {...register("divisionId")}
            onChange={(e) => {
              const v = e.target.value;
              // RHF onChange
              register("divisionId").onChange(e);
              // clear children
              reset({
                ...watch(),
                divisionId: v,
                districtId: "",
                upazilaId: "",
                unionId: "",
                name: watch("name"),
              });
            }}
          >
            <option value="">{t("labels.selectDivision")}</option>
            {(divisions as any).map((d: any) => (
              <option key={d.value} value={d.value}>
                {d.title}
              </option>
            ))}
          </select>
          {errors.divisionId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.divisionId.message}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <Label className="text-sm">{t("labels.district")}</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
            {...register("districtId")}
            disabled={!divisionId}
            onChange={(e) => {
              const v = e.target.value;
              register("districtId").onChange(e);
              reset({
                ...watch(),
                districtId: v,
                upazilaId: "",
                unionId: "",
                name: watch("name"),
              });
            }}
          >
            <option value="">{t("labels.selectDistrict")}</option>
            {districtOptions.map((d: any) => (
              <option key={d.value} value={d.value}>
                {d.title}
              </option>
            ))}
          </select>
          {errors.districtId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.districtId.message}
            </p>
          )}
        </div>

        {/* Upazila */}
        <div>
          <Label className="text-sm">{t("labels.upazila")}</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
            {...register("upazilaId")}
            disabled={!districtId}
            onChange={(e) => {
              const v = e.target.value;
              register("upazilaId").onChange(e);
              reset({
                ...watch(),
                upazilaId: v,
                unionId: "",
                name: watch("name"),
              });
            }}
          >
            <option value="">{t("labels.selectUpazila")}</option>
            {upazilaOptions.map((u: any) => (
              <option key={u.value} value={u.value}>
                {u.title}
              </option>
            ))}
          </select>
          {errors.upazilaId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.upazilaId.message}
            </p>
          )}
        </div>

        {/* Union */}
        <div>
          <Label className="text-sm">{t("labels.union")}</Label>
          <select
            className="w-full h-9 px-2 border rounded-md"
            {...register("unionId")}
            disabled={!upazilaId}
          >
            <option value="">{t("labels.selectUnion")}</option>
            {unionOptions.map((u: any) => (
              <option key={u.value} value={u.value}>
                {u.title}
              </option>
            ))}
          </select>
          {errors.unionId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.unionId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          {t("buttons.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} size="sm">
          {isEdit ? t("buttons.update") : t("buttons.create")}
        </Button>
      </div>
    </form>
  );
}
