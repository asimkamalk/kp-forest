import { Role, type Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth";

export function regionScopeWhere(user: SessionUser): Prisma.RegionWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return {};
    case Role.REGION_ADMIN:
      return user.regionId ? { id: user.regionId } : { id: "__no_scope__" };
    case Role.CIRCLE_ADMIN:
      return user.circleId
        ? { circles: { some: { id: user.circleId } } }
        : { id: "__no_scope__" };
    case Role.DIVISION_ADMIN:
      return user.divisionId
        ? { circles: { some: { divisions: { some: { id: user.divisionId } } } } }
        : { id: "__no_scope__" };
    default:
      return { id: "__no_scope__" };
  }
}

export function circleScopeWhere(user: SessionUser): Prisma.CircleWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return {};
    case Role.REGION_ADMIN:
      return user.regionId ? { regionId: user.regionId } : { id: "__no_scope__" };
    case Role.CIRCLE_ADMIN:
      return user.circleId ? { id: user.circleId } : { id: "__no_scope__" };
    case Role.DIVISION_ADMIN:
      return user.divisionId
        ? { divisions: { some: { id: user.divisionId } } }
        : { id: "__no_scope__" };
    default:
      return { id: "__no_scope__" };
  }
}

export function divisionScopeWhere(user: SessionUser): Prisma.DivisionWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return {};
    case Role.REGION_ADMIN:
      return user.regionId
        ? { circle: { regionId: user.regionId } }
        : { id: "__no_scope__" };
    case Role.CIRCLE_ADMIN:
      return user.circleId ? { circleId: user.circleId } : { id: "__no_scope__" };
    case Role.DIVISION_ADMIN:
      return user.divisionId ? { id: user.divisionId } : { id: "__no_scope__" };
    default:
      return { id: "__no_scope__" };
  }
}
