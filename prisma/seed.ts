import "dotenv/config";
import { PrismaClient, Role, PublishStatus, MessageKind } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* ------------------------------------------------------------------
   ORG STRUCTURE — exactly as per the Forest Department document
------------------------------------------------------------------ */

type DivisionSeed = { slug: string; name: string; headquarters?: string };
type CircleSeed = {
  slug: string;
  name: string;
  headquarters: string;
  divisions: DivisionSeed[];
};
type RegionSeed = {
  slug: string;
  code: string;
  name: string;
  headquarters: string;
  centerLat: number;
  centerLng: number;
  shortDesc: string;
  circles: CircleSeed[];
};

const REGIONS: RegionSeed[] = [
  {
    slug: "central-southern-forest-region-i",
    code: "I",
    name: "Central Southern Forest Region – I",
    headquarters: "Peshawar",
    centerLat: 33.5,
    centerLng: 70.9,
    shortDesc:
      "Covering the central plains and southern districts of Khyber Pakhtunkhwa, from Peshawar valley through Kohat down to the Waziristan belt.",
    circles: [
      {
        slug: "central-forest-circle",
        name: "Central Forest Circle, Peshawar",
        headquarters: "Peshawar",
        divisions: [
          { slug: "peshawar", name: "Peshawar Forest Division", headquarters: "Peshawar" },
          { slug: "mardan", name: "Mardan Forest Division", headquarters: "Mardan" },
          { slug: "khyber", name: "Khyber Forest Division", headquarters: "Jamrud" },
          { slug: "mohmand", name: "Mohmand Forest Division", headquarters: "Ghalanai" },
          { slug: "bajaur", name: "Bajaur Forest Division", headquarters: "Khar" },
        ],
      },
      {
        slug: "kohat-forest-circle",
        name: "Kohat Forest Circle, Kohat",
        headquarters: "Kohat",
        divisions: [
          { slug: "kohat", name: "Kohat Forest Division", headquarters: "Kohat" },
          { slug: "orakzai", name: "Orakzai Forest Division", headquarters: "Kalaya" },
          { slug: "kurram", name: "Kurram Forest Division", headquarters: "Parachinar" },
        ],
      },
      {
        slug: "bannu-forest-circle",
        name: "Bannu Forest Circle, Bannu",
        headquarters: "Bannu",
        divisions: [
          { slug: "bannu", name: "Bannu Forest Division", headquarters: "Bannu" },
          { slug: "di-khan", name: "D.I. Khan Forest Division", headquarters: "Dera Ismail Khan" },
          { slug: "north-waziristan", name: "North Waziristan Forest Division", headquarters: "Miranshah" },
          {
            slug: "south-waziristan-upper",
            name: "South Waziristan Forest Division (Upper)",
            headquarters: "Wana",
          },
          {
            slug: "south-waziristan-lower",
            name: "South Waziristan Forest Division (Lower)",
            headquarters: "Tank",
          },
        ],
      },
    ],
  },
  {
    slug: "northern-forest-region-ii",
    code: "II",
    name: "Northern Forest Region – II",
    headquarters: "Abbottabad",
    centerLat: 34.6,
    centerLng: 73.2,
    shortDesc:
      "The Hazara belt — moist temperate forests of Galiyat, Kaghan and Kohistan, together with the province's watershed management divisions.",
    circles: [
      {
        slug: "lower-hazara-forest-circle",
        name: "Lower Hazara Forest Circle, Abbottabad",
        headquarters: "Abbottabad",
        divisions: [
          { slug: "galies", name: "Galies Forest Division", headquarters: "Nathiagali" },
          { slug: "haripur", name: "Haripur Forest Division", headquarters: "Haripur" },
          { slug: "kaghan", name: "Kaghan Forest Division", headquarters: "Balakot" },
          { slug: "siran", name: "Siran Forest Division", headquarters: "Mansehra" },
        ],
      },
      {
        slug: "upper-hazara-forest-circle",
        name: "Upper Hazara Forest Circle, Mansehra",
        headquarters: "Mansehra",
        divisions: [
          { slug: "hazara-tribal", name: "Hazara Tribal Forest Division", headquarters: "Mansehra" },
          { slug: "torghar", name: "Torghar Forest Division", headquarters: "Judbah" },
          { slug: "agror-tanawal", name: "Agror Tanawal Forest Division", headquarters: "Oghi" },
          { slug: "lower-kohistan", name: "Lower Kohistan Forest Division", headquarters: "Pattan" },
          { slug: "upper-kohistan", name: "Upper Kohistan Forest Division", headquarters: "Dasu" },
        ],
      },
      {
        slug: "watershed-circle",
        name: "Watershed Circle",
        headquarters: "Abbottabad",
        divisions: [
          { slug: "daur-watershed", name: "Daur Watershed Division" },
          { slug: "kunhar-watershed", name: "Kunhar Watershed Division" },
          { slug: "unhar-watershed", name: "Unhar Watershed Division" },
          { slug: "kohistan-watershed", name: "Kohistan Watershed Division" },
          { slug: "buner-watershed", name: "Buner Watershed Division" },
        ],
      },
    ],
  },
  {
    slug: "malakand-forest-region-iii",
    code: "III",
    name: "Malakand Forest Region – III",
    headquarters: "Swat",
    centerLat: 35.2,
    centerLng: 72.1,
    shortDesc:
      "Swat, Dir, Chitral and Buner — the province's richest coniferous forests and its most visited natural landscapes.",
    circles: [
      {
        slug: "malakand-east-forest-circle",
        name: "Malakand East Forest Circle",
        headquarters: "Saidu Sharif, Swat",
        divisions: [
          { slug: "lower-swat", name: "Lower Swat Forest Division", headquarters: "Saidu Sharif" },
          { slug: "upper-swat", name: "Upper Swat Forest Division", headquarters: "Matta" },
          { slug: "buner", name: "Buner Forest Division", headquarters: "Daggar" },
          { slug: "kalam", name: "Kalam Forest Division", headquarters: "Kalam" },
          { slug: "alpuri", name: "Alpuri Forest Division", headquarters: "Alpuri, Shangla" },
          { slug: "malakand", name: "Malakand Forest Division", headquarters: "Batkhela" },
        ],
      },
      {
        slug: "malakand-west-forest-circle",
        name: "Malakand West Forest Circle",
        headquarters: "Timergara, Lower Dir",
        divisions: [
          { slug: "lower-dir", name: "Lower Dir Forest Division", headquarters: "Timergara" },
          { slug: "upper-dir", name: "Upper Dir Forest Division", headquarters: "Dir" },
          { slug: "dir-kohistan", name: "Dir Kohistan Forest Division", headquarters: "Sheringal" },
          { slug: "chitral", name: "Chitral Forest Division", headquarters: "Chitral" },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */

async function seedOrgStructure() {
  for (const [ri, r] of REGIONS.entries()) {
    const region = await prisma.region.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        headquarters: r.headquarters,
        shortDesc: r.shortDesc,
        orderIndex: ri,
      },
      create: {
        slug: r.slug,
        code: r.code,
        name: r.name,
        headquarters: r.headquarters,
        shortDesc: r.shortDesc,
        centerLat: r.centerLat,
        centerLng: r.centerLng,
        orderIndex: ri,
        status: PublishStatus.PUBLISHED,
        officerDesignation: "Chief Conservator of Forests",
      },
    });

    for (const [ci, c] of r.circles.entries()) {
      const circle = await prisma.circle.upsert({
        where: { regionId_slug: { regionId: region.id, slug: c.slug } },
        update: { name: c.name, headquarters: c.headquarters, orderIndex: ci },
        create: {
          slug: c.slug,
          name: c.name,
          headquarters: c.headquarters,
          regionId: region.id,
          orderIndex: ci,
          status: PublishStatus.PUBLISHED,
          officerDesignation: "Conservator of Forests",
          shortDesc: `${c.name} administers ${c.divisions.length} forest divisions from its headquarters at ${c.headquarters}.`,
        },
      });

      for (const [di, d] of c.divisions.entries()) {
        await prisma.division.upsert({
          where: { circleId_slug: { circleId: circle.id, slug: d.slug } },
          update: { name: d.name, headquarters: d.headquarters, orderIndex: di },
          create: {
            slug: d.slug,
            name: d.name,
            headquarters: d.headquarters,
            circleId: circle.id,
            orderIndex: di,
            status: PublishStatus.PUBLISHED,
            officerDesignation: "Divisional Forest Officer",
          },
        });

        // every division must have a gallery
        const div = await prisma.division.findUniqueOrThrow({
          where: { circleId_slug: { circleId: circle.id, slug: d.slug } },
        });
        const existing = await prisma.galleryAlbum.findFirst({
          where: { divisionId: div.id, slug: "general" },
        });
        if (!existing) {
          await prisma.galleryAlbum.create({
            data: {
              slug: "general",
              title: `${d.name} — Gallery`,
              divisionId: div.id,
              status: PublishStatus.PUBLISHED,
            },
          });
        }
      }
    }
  }
}

async function seedSite() {
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Forest Department, Khyber Pakhtunkhwa",
      siteNameUr: "محکمہ جنگلات، خیبر پختونخوا",
      tagline: "Protecting, restoring and growing the forests of Khyber Pakhtunkhwa",
      address: "Shami Road, Peshawar, Khyber Pakhtunkhwa",
      email: "info@forest.kp.gov.pk",
      phone: "+92 91 921 0000",
      helplineNumber: "1422",
    },
  });

  const nav: {
    label: string;
    href: string | null;
    isDynamicRegions?: boolean;
    isMegaMenu?: boolean;
    children: { label: string; href: string }[];
  }[] = [
    { label: "Home", href: "/", children: [] },
    {
      label: "About KP Forest",
      href: "/about",
      children: [
        { label: "Introduction", href: "/about" },
        { label: "Vision & Mission", href: "/about/vision-mission" },
        { label: "Organogram", href: "/about/organogram" },
        { label: "Functions & Mandate", href: "/about/mandate" },
      ],
    },
    {
      label: "Messages",
      href: null,
      children: [
        {
          label: "Message from the Chief Minister, KP",
          href: "/messages/chief-minister",
        },
        {
          label: "Message from the Secretary, Climate Change",
          href: "/messages/secretary-climate-change",
        },
      ],
    },
    {
      label: "KP Forest Regions",
      href: "/regions",
      isDynamicRegions: true,
      children: [],
    },
    {
      label: "Projects",
      href: null,
      children: [
        { label: "Completed", href: "/projects/completed" },
        { label: "Ongoing", href: "/projects/ongoing" },
        { label: "Future Projects", href: "/projects/future" },
      ],
    },
    {
      label: "Downloads",
      href: null,
      children: [
        { label: "Publications", href: "/downloads/publications" },
        { label: "Notifications", href: "/downloads/notifications" },
        { label: "Acts, Rules & Policies", href: "/downloads/acts-rules-policies" },
      ],
    },
    {
      label: "Media Gallery",
      href: null,
      isMegaMenu: true,
      children: [
        { label: "Press Releases", href: "/media/press-releases" },
        { label: "Photo Gallery", href: "/media/photos" },
        { label: "Video Gallery", href: "/media/videos" },
        { label: "News Coverage", href: "/media/news" },
      ],
    },
    {
      label: "Contact Us",
      href: null,
      children: [
        { label: "Contact Directory", href: "/contact" },
        { label: "Lodge a Complaint", href: "/contact/complaint" },
        { label: "Submit a Suggestion", href: "/contact/suggestion" },
      ],
    },
  ];

  // Reseed navigation so the canonical menu stays exact across runs.
  await prisma.navItem.deleteMany();
  for (const [i, item] of nav.entries()) {
    const parent = await prisma.navItem.create({
      data: {
        label: item.label,
        href: item.href,
        orderIndex: i,
        isDynamicRegions: Boolean(item.isDynamicRegions),
        isMegaMenu: Boolean(item.isMegaMenu),
      },
    });
    for (const [j, child] of item.children.entries()) {
      await prisma.navItem.create({
        data: { label: child.label, href: child.href, orderIndex: j, parentId: parent.id },
      });
    }
  }

  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "Guardians of Khyber Pakhtunkhwa's Forests",
          subtitle:
            "Three regions, eight circles and thirty-two divisions working to protect 1.9 million hectares of forest.",
          imageUrl: "/hero/forest-1.jpg",
          imageAlt: "Forest canopy in Khyber Pakhtunkhwa",
          ctaLabel: "Explore Regions",
          ctaHref: "/regions",
          secondaryCtaLabel: "Our Projects",
          secondaryCtaHref: "/projects/ongoing",
          orderIndex: 0,
          status: PublishStatus.PUBLISHED,
        },
        {
          title: "Plant for Pakhtunkhwa",
          subtitle: "Urban and rural plantation campaigns across every district of the province.",
          imageUrl: "/hero/plantation.jpg",
          imageAlt: "Plantation campaign in Khyber Pakhtunkhwa",
          ctaLabel: "Request plants",
          ctaHref: "/services/plant-request",
          orderIndex: 1,
          status: PublishStatus.PUBLISHED,
        },
        {
          title: "Wildlife of the North",
          subtitle: "Conserving the snow leopard, markhor and the habitats they depend on.",
          imageUrl: "/hero/wildlife.jpg",
          imageAlt: "Wildlife habitat in northern Khyber Pakhtunkhwa",
          ctaLabel: "Know Your Forest",
          ctaHref: "/know-your-forest",
          orderIndex: 2,
          status: PublishStatus.PUBLISHED,
        },
      ],
    });
  }

  await prisma.heroSlide.updateMany({
    where: { ctaHref: "/plantation/campaigns" },
    data: { ctaHref: "/services/plant-request", ctaLabel: "Request plants" },
  });

  const messages = [
    {
      slug: "chief-minister",
      kind: MessageKind.CHIEF_MINISTER,
      personName: "Chief Minister, Khyber Pakhtunkhwa",
      designation: "Government of Khyber Pakhtunkhwa",
      excerpt: "A message from the Chief Minister of Khyber Pakhtunkhwa.",
      body: "The real message is to be entered from the dashboard.",
      orderIndex: 0,
      status: PublishStatus.PUBLISHED,
    },
    {
      slug: "secretary-climate-change",
      kind: MessageKind.SECRETARY_CLIMATE_CHANGE,
      personName: "Secretary, Climate Change, Environment & Forestry Department",
      designation: "Government of Khyber Pakhtunkhwa",
      excerpt: "A message from the Secretary, Climate Change, Environment & Forestry Department.",
      body: "The real message is to be entered from the dashboard.",
      orderIndex: 1,
      status: PublishStatus.PUBLISHED,
    },
  ] as const;

  await prisma.message.deleteMany({
    where: {
      slug: {
        in: [
          "message-from-the-minister",
          "message-from-the-secretary",
          "message-from-the-chief-conservator",
        ],
      },
    },
  });

  for (const msg of messages) {
    await prisma.message.upsert({
      where: { slug: msg.slug },
      update: {
        kind: msg.kind,
        personName: msg.personName,
        designation: msg.designation,
        excerpt: msg.excerpt,
        body: msg.body,
        orderIndex: msg.orderIndex,
        status: msg.status,
      },
      create: { ...msg },
    });
  }

  if ((await prisma.statCounter.count()) === 0) {
    await prisma.statCounter.createMany({
      data: [
        { label: "Forest Regions", value: 3, orderIndex: 0, icon: "Map" },
        { label: "Forest Circles", value: 8, orderIndex: 1, icon: "Layers" },
        { label: "Forest Divisions", value: 32, orderIndex: 2, icon: "TreePine" },
        { label: "Saplings Planted", value: 1.2, suffix: "B+", orderIndex: 3, icon: "Sprout" },
      ],
    });
  }

  const cmsPages = [
    {
      slug: "free-plant-scheme",
      title: "Free plant scheme",
      body: [
        "Citizens, schools and community organisations can request saplings from departmental nurseries under the free plant scheme.",
        "Submit this form with your district, preferred species and planting purpose. After approval you will be told which nursery to collect from and when stock is ready. Bring your ticket number and a valid CNIC.",
        "Collection is free. Planting and aftercare remain the requester's responsibility.",
      ].join("\n\n"),
      orderIndex: 0,
    },
    {
      slug: "forest-fire-reporting",
      title: "Reporting a forest fire",
      body: [
        "If you see smoke or flame in a forest area, call the departmental helpline immediately. Give the nearest landmark, village or road and a rough direction from there.",
        "Do not enter a burning compartment. Keep clear of roads used by fire crews. If you can do so safely, note the wind direction and whether the fire is moving uphill.",
        "Use the regional emergency numbers below when the helpline is busy or when an officer asks you to coordinate locally.",
      ].join("\n\n"),
      orderIndex: 1,
    },
  ] as const;

  for (const page of cmsPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        body: page.body,
        orderIndex: page.orderIndex,
        status: PublishStatus.PUBLISHED,
      },
      create: {
        ...page,
        status: PublishStatus.PUBLISHED,
      },
    });
  }

  if ((await prisma.knowYourForestArticle.count()) === 0) {
    await prisma.knowYourForestArticle.createMany({
      data: [
        {
          slug: "chir-pine-forests",
          title: "Chir pine forests",
          summary:
            "How Pinus roxburghii shapes the mid-hill working circles of Khyber Pakhtunkhwa.",
          body: [
            "Chir pine dominates many mid-elevation slopes from Hazara through Kohat. Working plans treat it as a timber and resin species with a clear regeneration cycle.",
            "Fire is the main management risk in chir pine belts. Controlled grazing, timely thinning and community fire lines reduce the chance of crown fire.",
          ].join("\n\n"),
          coverImage: "/hero/forest-1.jpg",
          orderIndex: 0,
          status: PublishStatus.PUBLISHED,
        },
        {
          slug: "deodar-and-moist-temperate",
          title: "Deodar and moist temperate forest",
          summary:
            "Cedrus deodara stands in the northern circles and why regeneration matters.",
          body: [
            "Deodar marks the moist temperate zone of the northern region. These stands store high timber value and also protect catchments that feed downstream agriculture.",
            "Natural regeneration needs openings that still keep the understorey moist. Over-extraction and uncontrolled browsing are the usual failure modes.",
          ].join("\n\n"),
          coverImage: "/hero/plantation.jpg",
          orderIndex: 1,
          status: PublishStatus.PUBLISHED,
        },
      ],
    });
  }

  if ((await prisma.wildlifeSpecies.count()) === 0) {
    await prisma.wildlifeSpecies.createMany({
      data: [
        {
          slug: "markhor",
          commonName: "Markhor",
          scientificName: "Capra falconeri",
          category: "Mammal",
          conservationStatus: "NT",
          habitat: "Steep cliffs and scrub of Chitral and Kohistan",
          imageUrl: "/hero/wildlife.jpg",
          status: PublishStatus.PUBLISHED,
        },
        {
          slug: "western-tragopan",
          commonName: "Western tragopan",
          scientificName: "Tragopan melanocephalus",
          category: "Bird",
          conservationStatus: "VU",
          habitat: "Moist temperate forest understorey of Hazara",
          imageUrl: "/hero/forest-1.jpg",
          status: PublishStatus.PUBLISHED,
        },
        {
          slug: "leopard",
          commonName: "Common leopard",
          scientificName: "Panthera pardus",
          category: "Mammal",
          conservationStatus: "VU",
          habitat: "Forest edges and broken hill country across the province",
          imageUrl: "/hero/wildlife.jpg",
          status: PublishStatus.PUBLISHED,
        },
        {
          slug: "monitor-lizard",
          commonName: "Bengal monitor",
          scientificName: "Varanus bengalensis",
          category: "Reptile",
          conservationStatus: "LC",
          habitat: "Plains scrub, riverbanks and lower hill forests",
          status: PublishStatus.PUBLISHED,
        },
      ],
    });
  }
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const legacyAdminEmail = process.env.LEGACY_ADMIN_EMAIL;

  if (!email) {
    throw new Error("SEED_ADMIN_EMAIL is not set");
  }
  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD is not set");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Optional: delete legacy admin only when explicitly enabled.
  if (
    legacyAdminEmail &&
    process.env.DELETE_LEGACY_ADMIN === "true" &&
    email !== legacyAdminEmail
  ) {
    await prisma.user.deleteMany({ where: { email: legacyAdminEmail } });
  }

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.SUPER_ADMIN, isActive: true },
    create: {
      email,
      name: "System Administrator",
      passwordHash,
      role: Role.SUPER_ADMIN,
      designation: "IT Administrator",
    },
  });
}

async function main() {
  console.log("→ seeding site settings, navigation, hero, messages");
  await seedSite();
  console.log("→ seeding regions / circles / divisions");
  await seedOrgStructure();
  console.log("→ seeding admin user");
  await seedAdmin();

  const [r, c, d] = await Promise.all([
    prisma.region.count(),
    prisma.circle.count(),
    prisma.division.count(),
  ]);
  console.log(`✓ done — ${r} regions, ${c} circles, ${d} divisions`);
  console.log("  super admin updated (from SEED_ADMIN_EMAIL)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
