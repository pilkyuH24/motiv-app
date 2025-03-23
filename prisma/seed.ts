import { PrismaClient, Status, MissionRepeatType, MissionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔥 Starting database seeding...");

  // ✅ Delete existing data
  await prisma.userMissionLog.deleteMany();
  await prisma.userMission.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.userSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding users...");

  const user1 = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: { email: "test@test.com", name: "Test User" },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@test.com" },
    update: {},
    create: { email: "user2@test.com", name: "User Two" },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "hpil331@gmail.com" },
    update: {},
    create: { email: "hpil331@gmail.com", name: "User Three" },
  });

  console.log("✅ Users seeded.");

  // ✅ Define mission data with types
  const missions = [
    // ===== HEALTH =====
    {
        title: "🚭 Quit Smoking",
        description: "Record your success in quitting smoking daily. Stay smoke-free every day.",
        type: "HEALTH",
    },
    {
        title: "🏋️ Exercise",
        description: "Exercise for at least 30 minutes a day. Any workout counts, whether cardio or strength training.",
        type: "HEALTH",
    },
    {
        title: "🌙 Sleep Early",
        description: "Go to bed before 11 PM and get enough sleep.",
        type: "HEALTH",
    },
    {
        title: "🥗 Eat Healthy",
        description: "Have a balanced meal every day with vegetables and protein.",
        type: "HEALTH",
    },

    // ===== SELF_DEVELOPMENT =====
    {
        title: "💻 Practice Coding",
        description: "Solve at least one coding problem a day to improve algorithmic thinking.",
        type: "SELF_DEVELOPMENT",
    },
    {
        title: "📖 Read a Book",
        description: "Read for at least 30 minutes a day to stimulate intellectual growth.",
        type: "SELF_DEVELOPMENT",
    },
    {
        title: "📝 Write a Journal",
        description: "Reflect on your day and organize your thoughts and emotions by writing a daily journal.",
        type: "SELF_DEVELOPMENT",
    },
    {
        title: "📚 Learn a New Skill",
        description: "Dedicate time to learning something new—language, tool, or topic.",
        type: "SELF_DEVELOPMENT",
    },

    // ===== PRODUCTIVITY =====
    {
        title: "✅ Plan Your Day",
        description: "Write a to-do list every morning to stay organized and focused.",
        type: "PRODUCTIVITY",
    },
    {
        title: "📂 Clean Your Workspace",
        description: "Keep your desk and digital workspace clean and distraction-free.",
        type: "PRODUCTIVITY",
    },
    {
        title: "🌐 Contribute to Open Source",
        description: "Spend 30 minutes to 1 hour contributing to an open-source project or your GitHub repo.",
        type: "PRODUCTIVITY",
    },
    {
        title: "📧 Inbox Zero",
        description: "Clear your inbox by replying or organizing emails daily.",
        type: "PRODUCTIVITY",
    },

    // ===== MINDFULNESS =====
    {
        title: "🧘 Meditate",
        description: "Meditate or practice deep breathing for 10 minutes a day to stay calm.",
        type: "MINDFULNESS",
    },
    {
        title: "🌳 Go for a Walk",
        description: "Take a walk outside and enjoy nature without distractions.",
        type: "MINDFULNESS",
    },
    {
        title: "🔌 Digital Detox",
        description: "Avoid screens for at least 1 hour before bed to rest your mind.",
        type: "MINDFULNESS",
    },
    {
        title: "🙏 Practice Gratitude",
        description: "Write down three things you're grateful for today.",
        type: "MINDFULNESS",
    },

    // ===== RELATIONSHIP =====
    {
        title: "📞 Call a Loved One",
        description: "Connect with someone close to you through a short call or message.",
        type: "RELATIONSHIP",
    },
    {
        title: "💬 Compliment Someone",
        description: "Say something kind or encouraging to someone around you.",
        type: "RELATIONSHIP",
    },
    {
        title: "💌 Write a Thank-You Note",
        description: "Express appreciation to someone by writing a short thank-you note or message.",
        type: "RELATIONSHIP",
    },
    {
        title: "👥 Help a Friend",
        description: "Support a friend or family member with their task or challenge.",
        type: "RELATIONSHIP",
    },
];

  await prisma.mission.createMany({
    data: missions.map((m) => ({
      title: m.title,
      description: m.description,
      rewardPoints: 100,
      type: m.type as MissionType,
    })),
    skipDuplicates: true,
  });

  console.log("✅ Missions seeded.");

  // ✅ Assign user missions
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 14);

  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() - 1);
  sevenDaysLater.setUTCHours(23, 59, 59, 999);

  const missionTitles = missions.map((m) => m.title);
  const missionRecords = await prisma.mission.findMany({
    where: { title: { in: missionTitles } },
  });

  const userMissions = [
    { userId: user1.id, missionTitle: "🚭 Quit Smoking", repeatType: "DAILY" },
    { userId: user1.id, missionTitle: "🏋️ Exercise", repeatType: "DAILY" },
    { userId: user2.id, missionTitle: "🌙 Sleep Early", repeatType: "DAILY" },
    { userId: user2.id, missionTitle: "📖 Read a Book", repeatType: "DAILY" },
    { userId: user3.id, missionTitle: "📖 Read a Book", repeatType: "DAILY" },
  ];

  for (const { userId, missionTitle, repeatType } of userMissions) {
    const mission = missionRecords.find((m) => m.title === missionTitle);
    if (!mission) continue;

    await prisma.userMission.upsert({
      where: { userId_missionId: { userId, missionId: mission.id } },
      update: {},
      create: {
        userId,
        missionId: mission.id,
        status: Status.ONGOING,
        startDate: sevenDaysAgo,
        endDate: sevenDaysLater,
        repeatType: repeatType as MissionRepeatType,
        repeatDays: [true, true, true, true, true, true, true],
      },
    });
  }

  console.log("✅ User missions assigned.");

  // ✅ Seed mission logs
  const userMissionsData = await prisma.userMission.findMany();

  for (const userMission of userMissionsData) {
    const repeatDays = userMission.repeatDays as boolean[];

    for (let i = -14; i <= -1; i++) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() + i);

      if (
        userMission.repeatType === "CUSTOM" &&
        repeatDays &&
        !repeatDays[logDate.getUTCDay()]
      ) {
        continue;
      }

      const isDone = i < 0 ? Math.random() < 0.6 : false;

      await prisma.userMissionLog.upsert({
        where: {
          userMissionId_date: {
            userMissionId: userMission.id,
            date: logDate,
          },
        },
        update: { isDone },
        create: {
          userMissionId: userMission.id,
          date: logDate,
          isDone,
        },
      });
    }
  }

  console.log("✅ Mission logs seeded.");
  console.log("🎉 Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
