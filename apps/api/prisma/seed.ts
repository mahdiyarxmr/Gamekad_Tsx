import { PrismaClient, MembershipOrigin, CategoryKind } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { MAFIA_SCENARIOS } from './mafia-scenarios';

const prisma = new PrismaClient();

async function main() {
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || randomBytes(8).toString('hex');
  if (!process.env.ADMIN_BOOTSTRAP_PASSWORD) {
    console.log('ADMIN_BOOTSTRAP_PASSWORD was empty. Generated for this seed only:', adminPass);
  }

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: bcrypt.hashSync(adminPass, 12),
      role: 'admin',
      godGameAllowed: true,
      status: 'active',
      membershipOrigin: MembershipOrigin.ROKAD,
      email: 'admin@example.local',
    },
    create: {
      username: 'admin',
      email: 'admin@example.local',
      password: bcrypt.hashSync(adminPass, 12),
      displayName: 'مدیر',
      role: 'admin',
      godGameAllowed: true,
      membershipOrigin: MembershipOrigin.ROKAD,
      wallet: { create: { balance: 0 } },
    },
  });

  const player = await prisma.user.upsert({
    where: { username: 'player' },
    update: { password: bcrypt.hashSync('player-pass-9', 12), membershipOrigin: MembershipOrigin.ROKAD },
    create: {
      username: 'player',
      email: 'player@example.local',
      password: bcrypt.hashSync('player-pass-9', 12),
      displayName: 'آرمین رضایی',
      gender: 'boy',
      role: 'user',
      membershipOrigin: MembershipOrigin.ROKAD,
      avatar: '/img/presets/p1.jpg',
      wallet: { create: { balance: 250000 } },
    },
  });

  const host = await prisma.user.upsert({
    where: { username: 'host' },
    update: { godGameAllowed: true, password: bcrypt.hashSync('host-pass-9', 12), membershipOrigin: MembershipOrigin.ROKAD },
    create: {
      username: 'host',
      email: 'host@example.local',
      password: bcrypt.hashSync('host-pass-9', 12),
      displayName: 'میزبان میز',
      role: 'user',
      godGameAllowed: true,
      gender: 'boy',
      membershipOrigin: MembershipOrigin.ROKAD,
      wallet: { create: { balance: 0 } },
    },
  });

  const extras: {
    username: string;
    email: string;
    displayName: string;
    gender: string;
    origin: MembershipOrigin;
    bio: string;
    avatar: string;
    points: number;
    wins: number;
    losses: number;
  }[] = [
    { username: 'arian', email: 'arian@example.local', displayName: 'آرین کاظمی', gender: 'boy', origin: MembershipOrigin.ROKAD, bio: 'بازپرس همیشگی میز مافیا.', avatar: '/img/presets/p2.jpg', points: 992, wins: 19, losses: 6 },
    { username: 'sara', email: 'sara@example.local', displayName: 'سارا محمدی', gender: 'girl', origin: MembershipOrigin.ROKAD, bio: 'ملکه گل یا پوچ.', avatar: '/img/presets/p3.jpg', points: 760, wins: 12, losses: 8 },
    { username: 'kian', email: 'kian@example.local', displayName: 'کیان رضایی', gender: 'boy', origin: MembershipOrigin.ROKAD, bio: 'کم‌حرف، زیاد برنده.', avatar: '/img/presets/p4.jpg', points: 910, wins: 16, losses: 7 },
    { username: 'nika', email: 'nika@example.local', displayName: 'نیکا احمدی', gender: 'girl', origin: MembershipOrigin.ROKAD, bio: 'دکتر نجات‌دهنده.', avatar: '/img/presets/p5.jpg', points: 870, wins: 15, losses: 8 },
    { username: 'pouya', email: 'pouya@example.local', displayName: 'پویا کریمی', gender: 'boy', origin: MembershipOrigin.ROKAD, bio: 'شطرنج‌باز قدیمی سالن.', avatar: '/img/presets/p6.jpg', points: 720, wins: 11, losses: 9 },
    { username: 'elnaz', email: 'elnaz@example.local', displayName: 'الناز حسینی', gender: 'girl', origin: MembershipOrigin.EXTERNAL, bio: 'شهروندنما حرفه‌ای.', avatar: '/img/presets/p7.jpg', points: 820, wins: 14, losses: 9 },
    { username: 'mahdi', email: 'mahdi@example.local', displayName: 'مهدی نوری', gender: 'boy', origin: MembershipOrigin.EXTERNAL, bio: 'بردگیم‌باز شب‌های یکشنبه.', avatar: '/img/presets/p8.jpg', points: 480, wins: 6, losses: 11 },
    { username: 'yasamin', email: 'yasamin@example.local', displayName: 'یاسمن فتحی', gender: 'girl', origin: MembershipOrigin.EXTERNAL, bio: 'گرگینه و مافیا، هر دو.', avatar: '/img/presets/p9.jpg', points: 610, wins: 9, losses: 11 },
    { username: 'amir', email: 'amir@example.local', displayName: 'امیرحسین جعفری', gender: 'boy', origin: MembershipOrigin.EXTERNAL, bio: 'تازه‌وارد میز کلاسیک.', avatar: '/img/presets/p10.jpg', points: 540, wins: 7, losses: 10 },
    { username: 'donya', email: 'donya@example.local', displayName: 'دنیا مرادی', gender: 'girl', origin: MembershipOrigin.EXTERNAL, bio: 'خواندن چهره تخصص اوست.', avatar: '/img/presets/p11.jpg', points: 690, wins: 10, losses: 8 },
    { username: 'navid', email: 'navid@example.local', displayName: 'نوید صالحی', gender: 'boy', origin: MembershipOrigin.ROKAD, bio: 'ساقی سناریوها.', avatar: '/img/presets/p12.jpg', points: 640, wins: 9, losses: 10 },
  ];
  const extraUsers: { id: number; username: string }[] = [];
  const demoPass = bcrypt.hashSync('sample-pass-9', 12);
  for (const e of extras) {
    extraUsers.push(
      await prisma.user.upsert({
        where: { username: e.username },
        update: {
          membershipOrigin: e.origin,
          displayName: e.displayName,
          gender: e.gender,
          bio: e.bio,
          avatar: e.avatar,
        },
        create: {
          username: e.username,
          email: e.email,
          displayName: e.displayName,
          gender: e.gender,
          bio: e.bio,
          avatar: e.avatar,
          membershipOrigin: e.origin,
          password: demoPass,
          role: 'user',
          wallet: { create: { balance: 0 } },
        },
      }),
    );
  }

  const mafia = await prisma.category.upsert({
    where: { slug: 'mafia' },
    update: { kind: CategoryKind.TABLE, image: '/assets/generated/cat-tabletop.jpg' },
    create: {
      name: 'مافیا',
      slug: 'mafia',
      kind: CategoryKind.TABLE,
      hasRoles: true,
      description: 'بازی نقش روی میز با شب و روز و رأی.',
      sortOrder: 1,
      image: '/assets/generated/cat-tabletop.jpg',
    },
  });
  const chess = await prisma.category.upsert({
    where: { slug: 'chess' },
    update: { image: '/assets/generated/cat-chess.jpg' },
    create: { name: 'شطرنج', slug: 'chess', kind: CategoryKind.TABLE, hasRoles: false, sortOrder: 2, image: '/assets/generated/cat-chess.jpg', description: 'میز شطرنج حضوری.' },
  });
  const fifa = await prisma.category.upsert({
    where: { slug: 'fifa' },
    update: { kind: CategoryKind.ELECTRONIC, image: '/assets/generated/cat-electronic.jpg' },
    create: {
      name: 'کنسول',
      slug: 'fifa',
      kind: CategoryKind.ELECTRONIC,
      hasRoles: false,
      description: 'بازی‌های کنسولی در سالن.',
      sortOrder: 3,
      image: '/assets/generated/cat-electronic.jpg',
    },
  });

  await prisma.electronicGame.upsert({
    where: { slug: 'fc-console' },
    update: {},
    create: {
      title: 'فوتبال کنسولی',
      slug: 'fc-console',
      description: 'مسابقه دوستانه روی کنسول سالن. کاور بازی رسمی نیست؛ تصویر فضای سالن است.',
      cover: '/assets/generated/cat-electronic.jpg',
      platform: 'PlayStation',
      categoryId: fifa.id,
      playersNote: '۱ در برابر ۱ یا ۲ در برابر ۲',
      sortOrder: 1,
    },
  });

  let classic = await prisma.scenario.findUnique({ where: { slug: 'classic' } });
  if (!classic) {
    classic = await prisma.scenario.create({
      data: {
        name: 'کلاسیک',
        slug: 'classic',
        categoryId: mafia.id,
        cover: '/assets/generated/scenario-mystery.jpg',
        howto: 'شب اول معارفه است. روز نوبت حرف است. رأی با تیک به دفاع می‌رود. میزبان ترتیب بیداری شب را از نقش‌ها می‌خواند.',
        winConditions: 'شهر وقتی برنده است که مافیا تمام شود. مافیا وقتی برنده است که تعدادش با شهر برابر شود.',
        dayNight: 'شب نقش‌های بیدار، صبح اعلام کشته، روز نطق، نامزدی، دفاع، رأی.',
        minPlayers: 8,
        maxPlayers: 16,
        sortOrder: 5,
        gameRoles: {
          create: [
            { name: 'مافیا', side: 'mafia', symbol: 'M', nightWake: true, wakeOrder: 2, description: 'شب یک نفر را هدف می‌گیرد.' },
            { name: 'دکتر', side: 'citizen', symbol: 'D', nightWake: true, wakeOrder: 3, description: 'شب یک نفر را نجات می‌دهد.' },
            { name: 'بازپرس', side: 'citizen', symbol: 'I', nightWake: true, wakeOrder: 4, description: 'استعلام شب از یک بازیکن.' },
            { name: 'شهروند', side: 'citizen', symbol: 'C', nightWake: false, wakeOrder: 0, description: 'روز حرف می‌زند و رأی می‌دهد.' },
          ],
        },
      },
    });
  } else {
    await prisma.scenario.update({ where: { id: classic.id }, data: { sortOrder: 5 } });
  }

  for (const s of MAFIA_SCENARIOS) {
    const row = await prisma.scenario.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        howto: s.howto,
        cover: s.cover,
        winConditions: s.winConditions,
        dayNight: s.dayNight,
        minPlayers: s.minPlayers,
        maxPlayers: s.maxPlayers,
        sortOrder: s.sortOrder,
        published: true,
        categoryId: mafia.id,
      },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.description,
        howto: s.howto,
        cover: s.cover,
        winConditions: s.winConditions,
        dayNight: s.dayNight,
        minPlayers: s.minPlayers,
        maxPlayers: s.maxPlayers,
        sortOrder: s.sortOrder,
        published: true,
        categoryId: mafia.id,
      },
    });
    for (const r of s.roles) {
      const data = {
        name: r.name,
        side: r.side,
        symbol: r.symbol,
        color: r.color,
        description: r.description,
        nightWake: r.nightWake,
        wakeOrder: r.wakeOrder,
      };
      const existing = await prisma.gameRole.findFirst({ where: { scenarioId: row.id, name: r.name } });
      if (existing) await prisma.gameRole.update({ where: { id: existing.id }, data });
      else await prisma.gameRole.create({ data: { ...data, scenarioId: row.id } });
    }
  }

  if ((await prisma.event.count()) === 0) {
    const start = new Date(Date.now() + 2 * 86400000);
    start.setHours(18, 0, 0, 0);
    await prisma.event.createMany({
      data: [
        {
          title: 'نشست مافیا پنجشنبه',
          startsAt: start,
          capacity: 12,
          price: 180000,
          audience: 'boys',
          status: 'open',
          categoryId: mafia.id,
          venue: 'سالن اصلی',
          payType: 'full',
          cover: '/assets/generated/cat-tabletop.jpg',
          description: 'میز کلاسیک، دوازده صندلی، ورود با رزرو.',
        },
        {
          title: 'میز مختلط جمعه',
          startsAt: new Date(start.getTime() + 86400000),
          capacity: 10,
          price: 180000,
          audience: 'mixed',
          status: 'open',
          categoryId: mafia.id,
          venue: 'سالن اصلی',
          cover: '/assets/generated/scenario-mystery.jpg',
        },
      ],
    });
  }

  const badgeDefs: { slug: string; name: string; hint: string; color: string }[] = [
    { slug: 'mvp', name: 'ستاره میز', hint: 'بهترین بازیکن آن شب', color: '#f4971f' },
    { slug: 'clutch', name: 'کلاچ', hint: 'برگشت در لحظهٔ آخر', color: '#e0195b' },
    { slug: 'host', name: 'میزبان شب', hint: 'گرداندگی تمیز', color: '#58bdaf' },
    { slug: 'fair', name: 'بازی‌تمیز', hint: 'احترام به میز', color: '#21295a' },
    { slug: 'wolf', name: 'گرگ شب', hint: 'کشتار تمیز و بی‌سروصدا', color: '#4f215a' },
    { slug: 'detective', name: 'بازپرس', hint: 'کشف درست نقش', color: '#347e75' },
    { slug: 'speech', name: 'سخنور', hint: 'نطق و دفاع قوی', color: '#ce1754' },
    { slug: 'survivor', name: 'بازمانده', hint: 'تا صبح سر میز ماند', color: '#59bbaf' },
    { slug: 'shield', name: 'محافظ', hint: 'جان کسی را خرید', color: '#21295a' },
    { slug: 'jester', name: 'لوده', hint: 'برد نقش مستقل', color: '#f4971f' },
    { slug: 'veteran', name: 'کهنه‌کار', hint: 'شب‌های زیاد روی میز', color: '#8a5a10' },
    { slug: 'spark', name: 'تازه‌نفس', hint: 'شروع درخشان', color: '#58bdaf' },
    { slug: 'duo', name: 'هماهنگی', hint: 'بازی تیمی تمیز', color: '#e0195b' },
    { slug: 'night', name: 'بیدارشب', hint: 'نقش شب را خوب زد', color: '#202a5a' },
    { slug: 'gold', name: 'طلایی', hint: 'سه برد ثبت‌شده در یک دسته', color: '#C47B16' },
  ];
  const badgeBySlug: Record<string, number> = {};
  for (const b of badgeDefs) {
    const row = await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { name: b.name, hint: b.hint, color: b.color },
      create: b,
    });
    badgeBySlug[b.slug] = row.id;
  }
  const grants: [string, string[]][] = [
    ['player', ['gold', 'host']],
    ['arian', ['mvp', 'detective', 'speech', 'veteran', 'night']],
    ['sara', ['mvp', 'spark', 'duo']],
    ['kian', ['mvp', 'wolf', 'night']],
    ['nika', ['clutch', 'survivor', 'shield', 'detective']],
    ['pouya', ['veteran']],
    ['elnaz', ['speech']],
    ['amir', ['fair']],
    ['navid', ['host']],
    ['donya', ['speech', 'spark']],
  ];
  const userByName: Record<string, number> = {
    player: player.id,
    ...Object.fromEntries(extraUsers.map((u) => [u.username, u.id])),
  };
  for (const [uname, slugs] of grants) {
    const uid = userByName[uname];
    if (!uid) continue;
    for (const slug of slugs) {
      const badgeId = badgeBySlug[slug];
      if (!badgeId) continue;
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: uid, badgeId } },
        update: {},
        create: { userId: uid, badgeId, level: 1 },
      });
    }
  }

  await prisma.playerStat.upsert({
    where: { userId_categoryId: { userId: player.id, categoryId: mafia.id } },
    update: { points: 240, wins: 4, losses: 1 },
    create: { userId: player.id, categoryId: mafia.id, points: 240, wins: 4, losses: 1 },
  });
  await prisma.playerStat.upsert({
    where: { userId_categoryId: { userId: player.id, categoryId: chess.id } },
    update: { points: 180, wins: 3, losses: 2 },
    create: { userId: player.id, categoryId: chess.id, points: 180, wins: 3, losses: 2 },
  });
  await prisma.playerStat.upsert({
    where: { userId_categoryId: { userId: player.id, categoryId: fifa.id } },
    update: { points: 120, wins: 2, losses: 2 },
    create: { userId: player.id, categoryId: fifa.id, points: 120, wins: 2, losses: 2 },
  });
  const extraBoard: Record<string, { chess?: [number, number, number]; fifa?: [number, number, number] }> = {
    arian: { chess: [720, 12, 8], fifa: [480, 7, 8] },
    sara: { chess: [410, 6, 9], fifa: [330, 5, 8] },
    kian: { chess: [640, 10, 9], fifa: [510, 8, 9] },
    nika: { chess: [390, 5, 7], fifa: [440, 7, 6] },
    pouya: { chess: [1100, 20, 4], fifa: [280, 4, 9] },
    elnaz: { chess: [650, 12, 10], fifa: [360, 6, 8] },
    mahdi: { chess: [860, 15, 7], fifa: [400, 6, 8] },
    yasamin: { chess: [300, 4, 8], fifa: [370, 5, 8] },
    amir: { chess: [300, 4, 8], fifa: [250, 3, 7] },
    donya: { chess: [880, 18, 7], fifa: [410, 6, 7] },
    navid: { chess: [500, 8, 10], fifa: [420, 6, 9] },
  };
  for (const e of extras) {
    const u = extraUsers.find((x) => x.username === e.username);
    if (!u) continue;
    await prisma.playerStat.upsert({
      where: { userId_categoryId: { userId: u.id, categoryId: mafia.id } },
      update: { points: e.points, wins: e.wins, losses: e.losses },
      create: { userId: u.id, categoryId: mafia.id, points: e.points, wins: e.wins, losses: e.losses },
    });
    const more = extraBoard[e.username];
    if (more?.chess) {
      const [points, wins, losses] = more.chess;
      await prisma.playerStat.upsert({
        where: { userId_categoryId: { userId: u.id, categoryId: chess.id } },
        update: { points, wins, losses },
        create: { userId: u.id, categoryId: chess.id, points, wins, losses },
      });
    }
    if (more?.fifa) {
      const [points, wins, losses] = more.fifa;
      await prisma.playerStat.upsert({
        where: { userId_categoryId: { userId: u.id, categoryId: fifa.id } },
        update: { points, wins, losses },
        create: { userId: u.id, categoryId: fifa.id, points, wins, losses },
      });
    }
  }

  if ((await prisma.match.count()) === 0 && classic) {
    const burst: { user: string; role: string; result: 'win' | 'loss'; points: number }[] = [];
    const add = (user: string, role: string, wins: number, losses: number, pts: number) => {
      for (let i = 0; i < wins; i++) burst.push({ user, role, result: 'win', points: pts });
      for (let i = 0; i < losses; i++) burst.push({ user, role, result: 'loss', points: 0 });
    };
    add('arian', 'بازپرس', 8, 2, 40);
    add('arian', 'دکتر', 3, 2, 30);
    add('arian', 'مافیا', 4, 1, 35);
    add('arian', 'شهروند', 4, 1, 20);
    add('nika', 'دکتر', 7, 3, 30);
    add('nika', 'شهروند', 5, 3, 20);
    add('nika', 'بازپرس', 3, 2, 40);
    add('kian', 'مافیا', 8, 2, 35);
    add('kian', 'شهروند', 5, 3, 20);
    add('sara', 'شهروند', 6, 4, 20);
    add('sara', 'دکتر', 4, 2, 30);
    add('player', 'شهروند', 3, 1, 20);
    add('player', 'مافیا', 1, 0, 35);
    for (const row of burst) {
      const uid = userByName[row.user];
      if (!uid) continue;
      const match = await prisma.match.create({
        data: {
          categoryId: mafia.id,
          scenarioId: classic.id,
          title: 'میز کلاسیک',
          winner: row.result === 'win' ? 'citizen' : 'mafia',
          scored: true,
        },
      });
      await prisma.matchPlayer.create({
        data: { matchId: match.id, userId: uid, result: row.result, points: row.points, roleName: row.role },
      });
    }
  }

  const settings: [string, string][] = [
    ['name', 'رکاد'],
    ['tagline', 'باشگاه بازی و رویداد'],
    ['phone', '09332881180'],
    ['address', 'مشهد، بلوار شهید فرامرز عباسی، رسالت ۳۲، بین ۴۵ و ۴۷، پلاک ۲۳'],
    ['hours', '۱۶:۰۰ تا ۲۲:۰۰'],
    ['timezone', 'Asia/Tehran'],
    ['about', 'رکاد هنرستان پسرانه استارتاپی است. این سامانه برای رزرو میز، آمار بازیکن و میزبانی نشست ساخته شده. داده‌های نمونه فقط برای محیط توسعه است.'],
  ];
  for (const [key, value] of settings) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  if ((await prisma.article.count()) === 0) {
    await prisma.article.create({
      data: {
        title: 'چطور میز را رزرو کنیم',
        slug: 'howto-table',
        excerpt: 'ظرفیت در سرور قفل می‌شود. اگر موجودی کیف کافی باشد همان‌جا کم می‌شود؛ وگرنه فقط درگاه.',
        body: 'رویداد را باز کن، مخاطب و قیمت را بخوان، بعد رزرو بزن. تا وقتی پرداخت تأیید نشده صندلی فقط برای پانزده دقیقه نگه داشته می‌شود. پرداخت موفق را فقط سرور اعلام می‌کند.',
        kind: 'guide',
        published: true,
        cover: '/assets/generated/learn-cover.jpg',
        authorId: admin.id,
      },
    });
  }

  const arian = extraUsers.find((x) => x.username === 'arian');
  await prisma.mvpAward.createMany({
    data: [{ userId: arian?.id || player.id, title: 'بازیکن هفته', period: 'این هفته', active: true, rank: 1 }],
    skipDuplicates: true,
  });

  const home = [
    ['hero', 'سرصفحه', 1],
    ['spotlight', 'رویداد ویژه', 2],
    ['events', 'میزهای پیش رو', 3],
    ['categories', 'بازی‌ها', 4],
    ['guide', 'آموزش سناریو', 5],
    ['leaderboard', 'لیدربورد', 6],
    ['mvp', 'منتخبان', 7],
    ['matches', 'بازی‌های اخیر', 8],
    ['articles', 'آموزش', 9],
    ['about', 'درباره', 10],
  ] as const;
  for (const [key, title, sortOrder] of home) {
    await prisma.homepageSection.upsert({ where: { key }, update: {}, create: { key, title, sortOrder, enabled: key !== 'matches' } });
  }

  void host;
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
