import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Card } from "@/components/ui/card";
import { deleteContactInquiryAction } from "@/lib/contact/actions";
import { prisma } from "@/lib/prisma";

type MessagesPageProps = {
  searchParams?: Promise<{ success?: string }>;
};

export default async function AdminMessagesPage({ searchParams }: MessagesPageProps) {
  const query = (await searchParams) ?? {};
  let messages: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    createdAt: Date;
  }> = [];
  let unavailable = false;

  try {
    messages = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Messages"
        title="Contact messages"
        description="Messages sent from the public contact form."
      />
      {query.success === "deleted" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Message deleted.
        </p>
      ) : null}
      <Card>
        {unavailable ? (
          <p className="text-sm text-muted-foreground">
            Contact messages are not available yet. The table is created when
            the first message is saved.
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((item) => (
              <li key={item.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.email}
                  {item.phone ? ` · ${item.phone}` : ""} ·{" "}
                  {item.createdAt.toLocaleString()}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {item.message}
                </p>
                <div className="mt-3">
                  <ConfirmDeleteButton
                    action={deleteContactInquiryAction.bind(null, item.id)}
                    label="Delete message"
                    confirm="Delete this contact message permanently?"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
