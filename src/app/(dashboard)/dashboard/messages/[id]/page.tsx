import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageForm } from "@/components/dashboard/messages/message-form";
import type { MessageInput } from "@/lib/validators/message";

type Props = { params: Promise<{ id: string }> };

export default async function EditMessagePage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) notFound();

  const defaults: MessageInput = {
    slug: message.slug,
    personName: message.personName,
    personNameUr: message.personNameUr,
    designation: message.designation,
    designationUr: message.designationUr,
    kind: message.kind,
    photoUrl: message.photoUrl,
    signatureUrl: message.signatureUrl,
    excerpt: message.excerpt,
    excerptUr: message.excerptUr,
    body: message.body,
    bodyUr: message.bodyUr,
    status: message.status,
    orderIndex: message.orderIndex,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/messages" className="text-sm text-bark/60 hover:text-bark">
          ← Messages
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit message</h1>
        <p className="mt-1 text-sm text-bark/60">{message.personName}</p>
      </div>
      <MessageForm mode="edit" messageId={message.id} defaults={defaults} />
    </div>
  );
}
