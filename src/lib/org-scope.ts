import { type Prisma } from "@prisma/client";
import { scopeFilter, type SessionUser } from "@/lib/auth";

type Session = { user: SessionUser };

/**
 * Apply scopeFilter(session) to Region / Circle / Division queries.
 * scopeFilter returns user-shaped keys; org models need id / parent-id mapping.
 */
export function regionWhere(session: Session): Prisma.RegionWhereInput {
  const scope = scopeFilter(session);
  if (Object.keys(scope).length === 0) return {};
  if (typeof scope.regionId === "string") return { id: scope.regionId };
  if (typeof scope.circleId === "string") {
    return { circles: { some: { id: scope.circleId } } };
  }
  if (typeof scope.divisionId === "string") {
    return { circles: { some: { divisions: { some: { id: scope.divisionId } } } } };
  }
  if (typeof scope.id === "string") return { id: scope.id };
  return { id: "__no_scope__" };
}

export function circleWhere(session: Session): Prisma.CircleWhereInput {
  const scope = scopeFilter(session);
  if (Object.keys(scope).length === 0) return {};
  if (typeof scope.regionId === "string") return { regionId: scope.regionId };
  if (typeof scope.circleId === "string") return { id: scope.circleId };
  if (typeof scope.divisionId === "string") {
    return { divisions: { some: { id: scope.divisionId } } };
  }
  if (typeof scope.id === "string") return { id: scope.id };
  return { id: "__no_scope__" };
}

export function divisionWhere(session: Session): Prisma.DivisionWhereInput {
  const scope = scopeFilter(session);
  if (Object.keys(scope).length === 0) return {};
  if (typeof scope.regionId === "string") {
    return { circle: { regionId: scope.regionId } };
  }
  if (typeof scope.circleId === "string") return { circleId: scope.circleId };
  if (typeof scope.divisionId === "string") return { id: scope.divisionId };
  if (typeof scope.id === "string") return { id: scope.id };
  return { id: "__no_scope__" };
}

export function projectWhere(session: Session): Prisma.ProjectWhereInput {
  const scope = scopeFilter(session);
  if (Object.keys(scope).length === 0) return {};
  if (typeof scope.regionId === "string") {
    return {
      OR: [
        { regionId: scope.regionId },
        { circle: { regionId: scope.regionId } },
        { division: { circle: { regionId: scope.regionId } } },
      ],
    };
  }
  if (typeof scope.circleId === "string") {
    return {
      OR: [
        { circleId: scope.circleId },
        { division: { circleId: scope.circleId } },
      ],
    };
  }
  if (typeof scope.divisionId === "string") {
    return { divisionId: scope.divisionId };
  }
  if (typeof scope.id === "string") return { id: scope.id };
  return { id: "__no_scope__" };
}

/** Gallery albums scoped by division ownership (and parent region/circle). */
export function galleryAlbumWhere(session: Session): Prisma.GalleryAlbumWhereInput {
  const scope = scopeFilter(session);
  if (Object.keys(scope).length === 0) return {};
  if (typeof scope.regionId === "string") {
    return {
      OR: [
        { regionId: scope.regionId },
        { circle: { regionId: scope.regionId } },
        { division: { circle: { regionId: scope.regionId } } },
      ],
    };
  }
  if (typeof scope.circleId === "string") {
    return {
      OR: [
        { circleId: scope.circleId },
        { division: { circleId: scope.circleId } },
      ],
    };
  }
  if (typeof scope.divisionId === "string") {
    return { divisionId: scope.divisionId };
  }
  if (typeof scope.id === "string") return { id: scope.id };
  return { id: "__no_scope__" };
}

/** Aliases used by older call sites. */
export function regionScopeWhere(user: SessionUser): Prisma.RegionWhereInput {
  return regionWhere({ user });
}

export function circleScopeWhere(user: SessionUser): Prisma.CircleWhereInput {
  return circleWhere({ user });
}

export function divisionScopeWhere(user: SessionUser): Prisma.DivisionWhereInput {
  return divisionWhere({ user });
}
