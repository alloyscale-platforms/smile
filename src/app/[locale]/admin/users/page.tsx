import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { prisma } from "@/lib/db";
import { setUserRole, setUserStatus } from "@/server/actions/admin";
import { ROLES, USER_STATUSES } from "@/lib/constants";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{dict.admin.allUsers}</h2>
      {users.length === 0 ? (
        <p className="opacity-80">{dict.admin.noUsers}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">{dict.admin.role}</th>
                <th className="p-2">{dict.admin.status}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const updateRole = async (formData: FormData) => {
                  "use server";
                  await setUserRole(locale, u.id, formData.get("role") as (typeof ROLES)[number]);
                };
                const updateStatus = async (formData: FormData) => {
                  "use server";
                  await setUserStatus(
                    locale,
                    u.id,
                    formData.get("status") as (typeof USER_STATUSES)[number],
                  );
                };
                return (
                  <tr key={u.id} className="border-b border-border">
                    <td className="p-2 font-semibold">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <form action={updateRole} className="flex items-center gap-2">
                        <select name="role" defaultValue={u.role} className="rounded border border-border p-1">
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="underline">
                          {dict.common.save}
                        </button>
                      </form>
                    </td>
                    <td className="p-2">
                      <form action={updateStatus} className="flex items-center gap-2">
                        <select name="status" defaultValue={u.status} className="rounded border border-border p-1">
                          {USER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="underline">
                          {dict.common.save}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
