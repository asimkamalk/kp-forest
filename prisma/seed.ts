import { PrismaClient, Role, PublishStatus, MessageKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const nav = [
    { label: "Home", href: "/", children: [] },
    {
      label: "About Us",
      href: null,
      children: [
        { label: "Introduction", href: "/about" },
        { label: "Vision & Mission", href: "/about/vision-mission" },
        { label: "Organogram", href: "/about/organogram" },
        { label: "Messages", href: "/messages" },
      ],
    },
    { label: "Regions", href: "/regions", dynamic: true, children: [] },
    {
      label: "Forest Operations",
      href: null,
      children: [
        { label: "Markings", href: "/operations/markings" },
        { label: "Harvestings", href: "/operations/harvestings" },
        { label: "Actions", href: "/operations/actions" },
        { label: "Monitoring", href: "/operations/monitoring" },
      ],
    },
    {
      label: "Plantation",
      href: null,
      children: [
        { label: "Campaigns", href: "/plantation/campaigns" },
        { label: "Targets & Achievements", href: "/plantation/targets" },
        { label: "Success Stories", href: "/plantation/success-stories" },
      ],
    },
    {
      label: "Projects",
      href: null,
      children: [
        { label: "Completed", href: "/projects/completed" },
        { label: "Ongoing", href: "/projects/ongoing" },
        { label: "Future", href: "/projects/future" },
      ],
    },
    {
      label: "Media Centre",
      href: null,
      children: [
        { label: "Press Releases", href: "/media/press-releases" },
        { label: "Press Notes", href: "/media/press-notes" },
        { label: "News Coverage", href: "/media/news" },
        { label: "Interviews", href: "/media/interviews" },
        { label: "Myths vs Facts", href: "/media/myths-vs-facts" },
        { label: "Rapid Response", href: "/media/rapid-response" },
      ],
    },
    {
      label: "Public Services",
      href: null,
      children: [
        { label: "Know Your Forest", href: "/know-your-forest" },
        { label: "Wildlife", href: "/wildlife" },
        { label: "Plant Request", href: "/services/plant-request" },
        { label: "Research Request", href: "/services/research-request" },
        { label: "Emergency Contacts", href: "/services/emergency-contacts" },
        { label: "Downloads", href: "/downloads" },
      ],
    },
    { label: "Contact", href: "/contact", children: [] },
  ];

  if ((await prisma.navItem.count()) === 0) {
    for (const [i, item] of nav.entries()) {
      const parent = await prisma.navItem.create({
        data: {
          label: item.label,
          href: item.href,
          orderIndex: i,
          isDynamicRegions: Boolean((item as any).dynamic),
          isMegaMenu: item.children.length > 4,
        },
      });
      for (const [j, child] of item.children.entries()) {
        await prisma.navItem.create({
          data: { label: child.label, href: child.href, orderIndex: j, parentId: parent.id },
        });
      }
    }
  }

  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "Guardians of Khyber Pakhtunkhwa's Forests",
          subtitle:
            "Three regions, eight circles and thirty-two divisions working to protect 1.9 million hectares of forest.",
          imageUrl: "/images/hero/forest-1.jpg",
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
          imageUrl: "/images/hero/plantation.jpg",
          ctaLabel: "View Campaigns",
          ctaHref: "/plantation/campaigns",
          orderIndex: 1,
          status: PublishStatus.PUBLISHED,
        },
        {
          title: "Wildlife of the North",
          subtitle: "Conserving the snow leopard, markhor and the habitats they depend on.",
          imageUrl: "/images/hero/wildlife.jpg",
          ctaLabel: "Know Your Forest",
          ctaHref: "/know-your-forest",
          orderIndex: 2,
          status: PublishStatus.PUBLISHED,
        },
      ],
    });
  }

  if ((await prisma.message.count()) === 0) {
    await prisma.message.createMany({
      data: [
        {
          slug: "message-from-the-minister",
          kind: MessageKind.MINISTER,
          personName: "Minister for Forestry, Environment & Wildlife",
          designation: "Government of Khyber Pakhtunkhwa",
          excerpt:
            "Our forests are a public trust. This portal is part of our commitment to transparency in how that trust is managed.",
          body: "Replace this text from the dashboard with the Minister's approved message.",
          orderIndex: 0,
          status: PublishStatus.PUBLISHED,
        },
        {
          slug: "message-from-the-secretary",
          kind: MessageKind.SECRETARY,
          personName: "Secretary, Forestry, Environment & Wildlife Department",
          designation: "Government of Khyber Pakhtunkhwa",
          excerpt:
            "Every division of the department now publishes its activities, targets and achievements in one place.",
          body: "Replace this text from the dashboard with the Secretary's approved message.",
          orderIndex: 1,
          status: PublishStatus.PUBLISHED,
        },
        {
          slug: "message-from-the-chief-conservator",
          kind: MessageKind.CHIEF_CONSERVATOR,
          personName: "Chief Conservator of Forests",
          designation: "Forest Department, Khyber Pakhtunkhwa",
          excerpt:
            "From marking and harvesting to monitoring, our field operations are recorded and reported here.",
          body: "Replace this text from the dashboard with the Chief Conservator's approved message.",
          orderIndex: 2,
          status: PublishStatus.PUBLISHED,
        },
      ],
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
}

async function seedAdmin() {
  const email = "admin@forest.kp.gov.pk";
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
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
  console.log("  login: admin@forest.kp.gov.pk / ChangeMe123!  (change this)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
