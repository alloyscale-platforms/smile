import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/dictionaries";
import { prisma } from "@/lib/db";
import { approveUser, setUserStatus } from "@/server/actions/admin";
import { ROLES } from "@/lib/constants";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const [pendingUsers, openCount, totalUsers] = await Promise.all([
    prisma.user.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    prisma.helpRequest.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-3xl font-bold">{openCount}</p>
          <p className="opacity-80">{dict.requests.statusOpen}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-3xl font-bold">{totalUsers}</p>
          <p className="opacity-80">{dict.admin.allUsers}</p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">{dict.admin.pendingApprovals}</h2>
        {pendingUsers.length === 0 ? (
          <p className="opacity-80">{dict.admin.noPendingUsers}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pendingUsers.map((u) => {
              const approve = approveUser.bind(null, locale, u.id);
              const reject = setUserStatus.bind(null, locale, u.id, "SUSPENDED");
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="mr-auto">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm opacity-70">{u.email ?? u.phone}</p>
                  </div>
                  <form action={approve} className="flex items-center gap-2">
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-border p-2 text-sm"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                    >
                      {dict.admin.approve}
                    </button>
                  </form>
                  <form action={reject}>
                    <button type="submit" className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
                      {dict.admin.reject}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
