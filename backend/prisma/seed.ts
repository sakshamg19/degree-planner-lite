import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing data in FK order
  await prisma.plannedCourse.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.user.deleteMany();

  // Disconnect all prerequisite links before deleting courses
  const allCourses = await prisma.course.findMany({
    select: { id: true },
  });
  for (const course of allCourses) {
    await prisma.course.update({
      where: { id: course.id },
      data: { prerequisites: { set: [] } },
    });
  }

  await prisma.course.deleteMany();
  await prisma.requirementCategory.deleteMany();
  await prisma.degreeProgram.deleteMany();

  // 2. Create DegreeProgram
  const program = await prisma.degreeProgram.create({
    data: {
      name: "Computer Sciences, BS",
      college: "College of Letters & Science",
      totalCreditsRequired: 120,
    },
  });

  // 3. Create RequirementCategories (8 major + 8 degree = 16)
  const categoryData = [
    // Major tier
    { name: "Basic CS", minCredits: 15, tier: "major" },
    { name: "Basic Calculus", minCredits: 9, tier: "major" },
    { name: "Linear Algebra", minCredits: 3, tier: "major" },
    { name: "Probability/Statistics", minCredits: 3, tier: "major" },
    { name: "Theory of CS", minCredits: 3, tier: "major" },
    { name: "Software & Hardware", minCredits: 6, tier: "major" },
    { name: "Applications", minCredits: 3, tier: "major" },
    { name: "CS Electives", minCredits: 6, tier: "major" },
    // Degree tier
    { name: "Communication A", minCredits: 3, tier: "degree" },
    { name: "Communication B", minCredits: 3, tier: "degree" },
    { name: "Ethnic Studies", minCredits: 3, tier: "degree" },
    { name: "Humanities", minCredits: 12, tier: "degree" },
    { name: "Social Science", minCredits: 12, tier: "degree" },
    { name: "Natural Science — Bio", minCredits: 6, tier: "degree" },
    { name: "Natural Science — Physical", minCredits: 6, tier: "degree" },
    { name: "Language", minCredits: 12, tier: "degree" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.requirementCategory.create({
      data: { ...cat, degreeProgramId: program.id },
    });
    categories[cat.name] = created.id;
  }

  // 4. Create all courses
  // Helper to create a course and return it
  async function createCourse(
    subject: string,
    number: string,
    title: string,
    credits: number,
    normalizedCode: string,
    categoryName: string
  ) {
    return prisma.course.create({
      data: {
        subject,
        number,
        title,
        credits,
        normalizedCode,
        categoryId: categories[categoryName],
        isCustom: false,
      },
    });
  }

  // --- Basic CS ---
  const cs200 = await createCourse("COMP SCI", "200", "Programming I", 3, "COMPSCI200", "Basic CS");
  const cs240 = await createCourse("COMP SCI", "240", "Intro to Discrete Mathematics", 3, "COMPSCI240", "Basic CS");
  const cs252 = await createCourse("COMP SCI", "252", "Intro to Computer Engineering", 3, "COMPSCI252", "Basic CS");
  const cs300 = await createCourse("COMP SCI", "300", "Programming II", 3, "COMPSCI300", "Basic CS");
  const cs354 = await createCourse("COMP SCI", "354", "Machine Organization and Programming", 3, "COMPSCI354", "Basic CS");
  const cs400 = await createCourse("COMP SCI", "400", "Programming III", 3, "COMPSCI400", "Basic CS");

  // --- Basic Calculus ---
  const math221 = await createCourse("MATH", "221", "Calculus and Analytic Geometry 1", 5, "MATH221", "Basic Calculus");
  const math222 = await createCourse("MATH", "222", "Calculus and Analytic Geometry 2", 4, "MATH222", "Basic Calculus");

  // --- Linear Algebra ---
  const math340 = await createCourse("MATH", "340", "Elementary Matrix and Linear Algebra", 3, "MATH340", "Linear Algebra");
  const math341 = await createCourse("MATH", "341", "Linear Algebra", 3, "MATH341", "Linear Algebra");

  // --- Probability/Statistics ---
  const stat324 = await createCourse("STAT", "324", "Intro to Statistics for Science and Engineering", 3, "STAT324", "Probability/Statistics");
  const stat309 = await createCourse("STAT", "309", "Intro to Probability and Mathematical Statistics I", 3, "STAT309", "Probability/Statistics");

  // --- Theory of CS ---
  const cs577 = await createCourse("COMP SCI", "577", "Introduction to Algorithms", 4, "COMPSCI577", "Theory of CS");
  const cs520 = await createCourse("COMP SCI", "520", "Introduction to Theory of Computing", 3, "COMPSCI520", "Theory of CS");

  // --- Software & Hardware ---
  const cs537 = await createCourse("COMP SCI", "537", "Intro to Operating Systems", 3, "COMPSCI537", "Software & Hardware");
  const cs564 = await createCourse("COMP SCI", "564", "Database Management Systems", 3, "COMPSCI564", "Software & Hardware");
  const cs552 = await createCourse("COMP SCI", "552", "Intro to Computer Architecture", 3, "COMPSCI552", "Software & Hardware");
  const cs536 = await createCourse("COMP SCI", "536", "Intro to Programming Languages and Compilers", 3, "COMPSCI536", "Software & Hardware");
  const cs640 = await createCourse("COMP SCI", "640", "Intro to Computer Networks", 3, "COMPSCI640", "Software & Hardware");

  // --- Applications ---
  const cs540 = await createCourse("COMP SCI", "540", "Introduction to Artificial Intelligence", 3, "COMPSCI540", "Applications");
  const cs559 = await createCourse("COMP SCI", "559", "Computer Graphics", 3, "COMPSCI559", "Applications");
  const cs570 = await createCourse("COMP SCI", "570", "Intro to Human-Computer Interaction", 3, "COMPSCI570", "Applications");
  const cs571 = await createCourse("COMP SCI", "571", "Building User Interfaces", 3, "COMPSCI571", "Applications");

  // --- CS Electives ---
  const cs407 = await createCourse("COMP SCI", "407", "Foundations of Mobile Systems", 3, "COMPSCI407", "CS Electives");
  const cs542 = await createCourse("COMP SCI", "542", "Intro to Software Security", 3, "COMPSCI542", "CS Electives");
  const cs506 = await createCourse("COMP SCI", "506", "Software Engineering", 3, "COMPSCI506", "CS Electives");

  // --- Communication A ---
  const eng100 = await createCourse("ENGLISH", "100", "Introduction to College Composition", 3, "ENGLISH100", "Communication A");

  // --- Communication B ---
  const interls210 = await createCourse("INTERLS", "210", "Career Development", 1, "INTERLS210", "Communication B");

  // --- Ethnic Studies ---
  const anthro104 = await createCourse("ANTHRO", "104", "Cultural Anthropology and Human Diversity", 3, "ANTHRO104", "Ethnic Studies");

  // --- Humanities ---
  const eng150 = await createCourse("ENGLISH", "150", "Introduction to Literature", 3, "ENGLISH150", "Humanities");
  const eng175 = await createCourse("ENGLISH", "175", "American Literature and Culture", 3, "ENGLISH175", "Humanities");
  const hist201 = await createCourse("HISTORY", "201", "The Historian's Craft", 3, "HISTORY201", "Humanities");
  const philos101 = await createCourse("PHILOS", "101", "Introduction to Philosophy", 3, "PHILOS101", "Humanities");

  // --- Social Science ---
  const econ101 = await createCourse("ECON", "101", "Principles of Microeconomics", 4, "ECON101", "Social Science");
  const polisci104 = await createCourse("POLISCI", "104", "Introduction to American Government", 3, "POLISCI104", "Social Science");
  const psych202 = await createCourse("PSYCH", "202", "Introduction to Psychology", 3, "PSYCH202", "Social Science");
  const soc134 = await createCourse("SOC", "134", "Social Problems", 3, "SOC134", "Social Science");

  // --- Natural Science — Bio ---
  const bio151 = await createCourse("BIOLOGY", "151", "Introductory Biology", 5, "BIOLOGY151", "Natural Science — Bio");

  // --- Natural Science — Physical ---
  const physics201 = await createCourse("PHYSICS", "201", "General Physics", 5, "PHYSICS201", "Natural Science — Physical");
  const chem103 = await createCourse("CHEM", "103", "General Chemistry I", 4, "CHEM103", "Natural Science — Physical");

  // --- Language ---
  const span101 = await createCourse("SPANISH", "101", "First Semester Spanish", 4, "SPANISH101", "Language");
  const span102 = await createCourse("SPANISH", "102", "Second Semester Spanish", 4, "SPANISH102", "Language");
  const span203 = await createCourse("SPANISH", "203", "Third Semester Spanish", 4, "SPANISH203", "Language");

  // 5. Connect prerequisites
  // For OR prerequisites, we pick the first option (noted as future improvement)
  const prereqLinks: { courseId: string; prereqIds: string[] }[] = [
    // Basic CS
    { courseId: cs240.id, prereqIds: [math221.id] },
    { courseId: cs300.id, prereqIds: [cs200.id] },
    { courseId: cs354.id, prereqIds: [cs252.id, cs300.id] },
    { courseId: cs400.id, prereqIds: [cs300.id] },
    // Basic Calculus
    { courseId: math222.id, prereqIds: [math221.id] },
    // Linear Algebra
    { courseId: math340.id, prereqIds: [math222.id] },
    { courseId: math341.id, prereqIds: [math222.id] }, // MATH 234 or MATH 222 → pick MATH 222
    // Probability/Statistics
    { courseId: stat324.id, prereqIds: [math222.id] },
    { courseId: stat309.id, prereqIds: [math222.id] }, // MATH 234 or MATH 222 → pick MATH 222
    // Theory of CS
    { courseId: cs577.id, prereqIds: [cs400.id, cs240.id] },
    { courseId: cs520.id, prereqIds: [cs400.id, cs240.id] },
    // Software & Hardware
    { courseId: cs537.id, prereqIds: [cs354.id, cs400.id] },
    { courseId: cs564.id, prereqIds: [cs354.id, cs400.id] },
    { courseId: cs552.id, prereqIds: [cs354.id] },
    { courseId: cs536.id, prereqIds: [cs354.id, cs400.id] },
    { courseId: cs640.id, prereqIds: [cs537.id] },
    // Applications
    { courseId: cs540.id, prereqIds: [cs400.id, cs240.id, math340.id] }, // MATH 340 or MATH 341 → pick MATH 340
    { courseId: cs559.id, prereqIds: [cs400.id, math340.id] }, // MATH 340 or MATH 341 → pick MATH 340
    { courseId: cs570.id, prereqIds: [cs400.id] },
    { courseId: cs571.id, prereqIds: [cs400.id] },
    // CS Electives
    { courseId: cs407.id, prereqIds: [cs400.id] },
    { courseId: cs542.id, prereqIds: [cs354.id, cs400.id] },
    { courseId: cs506.id, prereqIds: [cs400.id] }, // "one of 407/536/537/etc" simplified to cs400
    // Natural Science — Physical
    { courseId: physics201.id, prereqIds: [math221.id] },
    // Language
    { courseId: span102.id, prereqIds: [span101.id] },
    { courseId: span203.id, prereqIds: [span102.id] },
  ];

  let prereqCount = 0;
  for (const link of prereqLinks) {
    await prisma.course.update({
      where: { id: link.courseId },
      data: {
        prerequisites: {
          connect: link.prereqIds.map((id) => ({ id })),
        },
      },
    });
    prereqCount += link.prereqIds.length;
  }

  // 6. Summary
  const courseCount = await prisma.course.count();
  console.log(`Seed complete:`);
  console.log(`  - 1 degree program`);
  console.log(`  - ${categoryData.length} requirement categories`);
  console.log(`  - ${courseCount} courses`);
  console.log(`  - ${prereqCount} prerequisite links`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
