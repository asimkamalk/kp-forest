"use server";

import { RequestKind, RequestStatus } from "@prisma/client";
import { generateTicketNo, guardCitizenSubmit } from "@/lib/citizen-form-guard";
import { prisma } from "@/lib/prisma";
import { sanitiseMultiline, sanitiseText } from "@/lib/sanitise";
import {
  plantRequestSchema,
  researchRequestSchema,
} from "@/lib/validators/services";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

/** Public: free plant / sapling request (kind PLANT). */
export async function submitPlantRequest(
  input: unknown
): Promise<ActionResult<{ ticketNo: string }>> {
  const parsed = plantRequestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;
  const blocked = await guardCitizenSubmit({
    rateLimitKey: "plant-submit",
    website: data.website,
    formStartedAt: data.formStartedAt,
  });
  if (blocked) return blocked;

  try {
    const ticketNo = await generateTicketNo();
    const row = await prisma.publicRequest.create({
      data: {
        ticketNo,
        kind: RequestKind.PLANT,
        fullName: sanitiseText(data.fullName, 120),
        cnic: data.cnic,
        phone: data.phone,
        email: data.email ? sanitiseText(data.email, 160) : null,
        district: data.district,
        address: sanitiseText(data.address, 400),
        species: data.species.join(", "),
        quantity: data.quantity,
        purpose: sanitiseMultiline(data.purpose, 1000),
        requestStatus: RequestStatus.NEW,
      },
    });

    return actionOk({ ticketNo: row.ticketNo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not submit the request";
    return actionError(message);
  }
}

/** Public: research permission / data request (kind RESEARCH). */
export async function submitResearchRequest(
  input: unknown
): Promise<ActionResult<{ ticketNo: string }>> {
  const parsed = researchRequestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;
  const blocked = await guardCitizenSubmit({
    rateLimitKey: "research-submit",
    website: data.website,
    formStartedAt: data.formStartedAt,
  });
  if (blocked) return blocked;

  try {
    const ticketNo = await generateTicketNo();
    const row = await prisma.publicRequest.create({
      data: {
        ticketNo,
        kind: RequestKind.RESEARCH,
        fullName: sanitiseText(data.fullName, 120),
        cnic: data.cnic,
        phone: data.phone,
        email: data.email ? sanitiseText(data.email, 160) : null,
        institution: sanitiseText(data.institution, 200),
        topic: sanitiseText(data.topic, 300),
        purpose: sanitiseMultiline(data.purpose, 2000),
        attachmentUrl: data.attachmentUrl,
        requestStatus: RequestStatus.NEW,
      },
    });

    return actionOk({ ticketNo: row.ticketNo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not submit the request";
    return actionError(message);
  }
}
