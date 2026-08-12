import { Role, MessageKind, PublishStatus } from "@prisma/client";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { MessageForm } from "@/components/dashboard/messages/message-form";
import type { MessageInput } from "@/lib/validators/message";

const defaults: MessageInput = {
  slug: "",
  personName: "",
  personNameUr: "",
  designation: "",
  designationUr: "",
  kind: MessageKind.OTHER,
  photoUrl: null,
  signatureUrl: null,
  excerpt: "",
  excerptUr: "",
  body: "",
  bodyUr: "",
  status: PublishStatus.DRAFT,
  orderIndex: 0,
};

export default async function NewMessagePage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/messages" className="text-sm text-bark/60 hover:text-bark">
          ← Messages
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New message</h1>
      </div>
      <MessageForm mode="create" defaults={defaults} />
    </div>
  );
}
