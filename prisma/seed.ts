import { PrismaClient, Status, MissionRepeatType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Starting database seeding...");

    // ✅ Delete all existing data from tables
    await prisma.userMissionLog.deleteMany();
    await prisma.userMission.deleteMany();
    await prisma.pointTransaction.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.userSetting.deleteMany();
    await prisma.user.deleteMany();

    console.log("🌱 Seeding database...");

    // ✅ Insert users
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

    console.log("✅ User data inserted!");

    // ✅ Insert missions
    const missionTitles = [
        "🚭 Quit Smoking",
        "🏋️ Exercise",
        "🌙 Sleep Early",
        "🥗 Eat Healthy",
        "🧘 Meditate",
        "📖 Read a Book",
        "🙏 Gratitude Journal",
        "💧 Stay Hydrated",
        "📵 Reduce Screen Time",
        "📝 Write a Journal",
        "🏠 Organize Home",
        "🧠 Learn a New Skill",
    ];

    const missionDescriptions: { [key: string]: string } = {
        "🚭 Quit Smoking": "Record your success in quitting smoking daily. Stay smoke-free every day.",
        "🏋️ Exercise": "Exercise for at least 30 minutes a day. Any workout counts, whether cardio or strength training.",
        "🌙 Sleep Early": "Go to bed before 11 PM and get enough sleep.",
        "🥗 Eat Healthy": "Have a balanced meal every day with vegetables and protein.",
        "🧘 Meditate": "Meditate or practice deep breathing for 10 minutes a day to stay calm.",
        "📖 Read a Book": "Read for at least 30 minutes a day to stimulate intellectual growth.",
        "🙏 Gratitude Journal": "Write down at least three things you are grateful for every day to develop a positive mindset.",
        "💧 Stay Hydrated": "Drink at least 8 glasses of water daily for a healthy hydration habit.",
        "📵 Reduce Screen Time": "Reduce smartphone and computer usage and engage in more real-world activities.",
        "📝 Write a Journal": "Reflect on your day and organize your thoughts and emotions by writing a daily journal.",
        "🏠 Organize Home": "Clean up one area of your home each day to maintain a tidy and organized living space.",
        "🧠 Learn a New Skill": "Dedicate at least 30 minutes daily to learning a new skill or language for self-development.",
    };

    await prisma.mission.createMany({
        data: missionTitles.map((title) => ({
            title,
            description: missionDescriptions[title],
            rewardPoints: 100,
        })),
        skipDuplicates: true, // Prevent duplicate entries
    });

    console.log("✅ Mission data inserted!");

    // ✅ Assign missions to users
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // UTC midnight

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); // 7 days ago

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7); // 7 days later
    sevenDaysLater.setUTCHours(23, 59, 59, 999); // ✅ Set to "23:59:59"

    const missions = await prisma.mission.findMany({ where: { title: { in: missionTitles } } });

    const userMissions = [
        { userId: user1.id, missionTitle: "🚭 Quit Smoking", repeatType: "DAILY" },
        { userId: user1.id, missionTitle: "🏋️ Exercise", repeatType: "DAILY" }, // CUSTOM for MON, TUE, WED
        { userId: user2.id, missionTitle: "🌙 Sleep Early", repeatType: "DAILY" },
        { userId: user2.id, missionTitle: "📖 Read a Book", repeatType: "DAILY" },
    ];

    for (const { userId, missionTitle, repeatType } of userMissions) {
        const mission = missions.find((m) => m.title === missionTitle);
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

    console.log("✅ User mission data inserted!");

    // ✅ Insert mission logs (-7 days to +7 days)
    const userMissionsData = await prisma.userMission.findMany();

    for (const userMission of userMissionsData) {
        let repeatDays: boolean[] | null = userMission.repeatDays ? (userMission.repeatDays as boolean[]) : null; // EDIT

        for (let i = -7; i <= 7; i++) {
            const logDate = new Date(today);
            logDate.setDate(today.getDate() + i);

            const dayOfWeek = logDate.toLocaleString("en-US", { weekday: "short" }).toUpperCase();

            // CUSTOM mission: Log only on specified days
            // Check based on index 0 (Sunday) to 6 (Saturday)
            if (userMission.repeatType === "CUSTOM" && repeatDays && !repeatDays[new Date(logDate).getUTCDay()]) { 
                continue;
            }

            // ✅ Set completion status randomly for past logs, future logs default to false
            const isDone = i < 0 ? Math.random() < 0.6 : false; 

            await prisma.userMissionLog.upsert({
                where: { userMissionId_date: { userMissionId: userMission.id, date: logDate } },
                update: { isDone },
                create: { userMissionId: userMission.id, date: logDate, isDone },
            });
        }
    }

    console.log("✅ Mission log data inserted!");

    // ✅ Insert badges
    await prisma.badge.createMany({
        data: [
            { title: "Quit Smoking Master", description: "Successfully quit smoking for 30 days", condition: "Achieved 30 days smoke-free" },
            { title: "Workout Champion", description: "Worked out for 30 consecutive days", condition: "Achieved 30 consecutive workout days" },
        ],
        skipDuplicates: true,
    });

    console.log("✅ Badge data inserted!");
    console.log("✅ Skipped inserting user badge data!");
    console.log("✅ Skipped inserting point transaction data!");

    console.log("🎉 Seed data created successfully.");
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
