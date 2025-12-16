// メンバー一覧ページ用ダミーデータ
// TODO: バックエンド接続時に削除

// ========================================
// 型定義（ダミーデータ用）
// ========================================

/** 称号情報 */
export interface MemberTitle {
  level: number;
  nameJp: string;
  nameEn: string;
  colorTheme: string;
}

/** ソーシャルリンク */
export interface MemberSocialLink {
  platform: 'twitter' | 'instagram' | 'github' | 'website' | 'blog' | 'note' | 'linkedin';
  url: string;
  title?: string;
}

/** メンバー情報 */
export interface MemberItem {
  // 基本情報 (users)
  id: string;
  username: string;
  avatarUrl: string | null;

  // プロフィール情報 (user_metadata)
  displayName: string;
  tagline: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];

  // ビジョン (user_visions)
  vision: string | null;
  isVisionPublic: boolean;

  // ソーシャルリンク (user_social_links)
  socialLinks: MemberSocialLink[];

  // 参加統計 (attendance_statistics)
  totalAttendanceDays: number;
  currentStreakDays: number;
  maxStreakDays: number;

  // 称号 (title_achievements + titles)
  currentTitle: MemberTitle | null;

  // メタ情報
  joinedAt: string; // ISO date string
}

// ========================================
// 称号マスターデータ
// ========================================

export const TITLE_MASTER: MemberTitle[] = [
  { level: 1, nameJp: 'まどろみ見習い', nameEn: 'Sleeper', colorTheme: 'slate' },
  { level: 2, nameJp: '目覚めの探求者', nameEn: 'Awakener', colorTheme: 'zinc' },
  { level: 3, nameJp: '朝霧の歩行者', nameEn: 'Dawn Walker', colorTheme: 'blue' },
  { level: 4, nameJp: '暁の先駆者', nameEn: 'Daybreak Pioneer', colorTheme: 'cyan' },
  { level: 5, nameJp: '黎明の賢者', nameEn: 'Twilight Sage', colorTheme: 'violet' },
  { level: 6, nameJp: '曙光の守護者', nameEn: 'Aurora Guardian', colorTheme: 'amber' },
  { level: 7, nameJp: '太陽の使者', nameEn: 'Solar Messenger', colorTheme: 'orange' },
  { level: 8, nameJp: '朝焼けの覇者', nameEn: 'Sunrise Sovereign', colorTheme: 'rose' },
];

// ========================================
// ダミーメンバーデータ
// ========================================

export const dummyMembers: MemberItem[] = [
  {
    id: '1',
    username: 'yamada_taro',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    displayName: '山田太郎',
    tagline: '毎朝5時起きを目指すエンジニア',
    bio: 'フロントエンドエンジニアとして5年目。朝活で読書と技術学習を続けています。最近はRustに興味があります。',
    skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
    interests: ['読書', 'ランニング', 'コーヒー'],
    vision: '技術で社会に貢献するエンジニアになる',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/yamada_taro' },
      { platform: 'github', url: 'https://github.com/yamada-taro' },
    ],
    totalAttendanceDays: 156,
    currentStreakDays: 23,
    maxStreakDays: 45,
    currentTitle: TITLE_MASTER[5],
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    username: 'suzuki_hanako',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
    displayName: '鈴木花子',
    tagline: 'デザイナー × 朝活コミュニティ運営',
    bio: 'UIデザイナーです。朝活でデザインの勉強と英語学習をしています。コミュニティの力を信じています！',
    skills: ['Figma', 'UI/UX', 'Photoshop', 'Illustration'],
    interests: ['デザイン', '英語学習', 'ヨガ'],
    vision: '世界で活躍するデザイナーになる',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/suzuki_hanako' },
      { platform: 'instagram', url: 'https://instagram.com/suzuki_hanako' },
      { platform: 'note', url: 'https://note.com/suzuki_hanako' },
    ],
    totalAttendanceDays: 234,
    currentStreakDays: 67,
    maxStreakDays: 67,
    currentTitle: TITLE_MASTER[6],
    joinedAt: '2023-08-01',
  },
  {
    id: '3',
    username: 'tanaka_jiro',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
    displayName: '田中二郎',
    tagline: 'スタートアップCTO / 朝型人間',
    bio: 'テックスタートアップでCTOをしています。朝の時間を使って経営書を読むのが日課です。',
    skills: ['Python', 'Machine Learning', 'Data Science', 'Leadership'],
    interests: ['読書', '瞑想', '登山'],
    vision: 'テクノロジーで世界を変える',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/tanaka_jiro' },
      { platform: 'linkedin', url: 'https://linkedin.com/in/tanaka-jiro' },
    ],
    totalAttendanceDays: 312,
    currentStreakDays: 89,
    maxStreakDays: 120,
    currentTitle: TITLE_MASTER[7],
    joinedAt: '2023-03-10',
  },
  {
    id: '4',
    username: 'sato_yuki',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
    displayName: '佐藤ゆき',
    tagline: '大学生 / 資格取得に向けて勉強中',
    bio: '大学3年生です。公認会計士を目指して朝活で勉強しています。みなさんの頑張りに刺激をもらっています！',
    skills: ['簿記', '財務会計', 'Excel'],
    interests: ['資格取得', 'カフェ巡り', '映画鑑賞'],
    vision: '公認会計士として独立する',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/sato_yuki' },
    ],
    totalAttendanceDays: 78,
    currentStreakDays: 12,
    maxStreakDays: 21,
    currentTitle: TITLE_MASTER[3],
    joinedAt: '2024-06-01',
  },
  {
    id: '5',
    username: 'watanabe_ken',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
    displayName: '渡辺健',
    tagline: 'フリーランスエンジニア / 朝ラン派',
    bio: 'フリーランスでWeb開発をしています。朝はランニングと技術ブログの執筆をしています。',
    skills: ['Go', 'Kubernetes', 'Terraform', 'GCP'],
    interests: ['ランニング', 'ブログ執筆', 'オープンソース'],
    vision: null,
    isVisionPublic: false,
    socialLinks: [
      { platform: 'github', url: 'https://github.com/watanabe-ken' },
      { platform: 'blog', url: 'https://watanabe-ken.dev' },
    ],
    totalAttendanceDays: 189,
    currentStreakDays: 34,
    maxStreakDays: 56,
    currentTitle: TITLE_MASTER[5],
    joinedAt: '2023-11-20',
  },
  {
    id: '6',
    username: 'ito_mika',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
    displayName: '伊藤美香',
    tagline: '主婦 / 副業でライター',
    bio: '2児の母です。子どもが起きる前の朝時間を使ってライティングの仕事をしています。',
    skills: ['ライティング', 'SEO', 'WordPress'],
    interests: ['子育て', '料理', '読書'],
    vision: 'ライターとして月収50万円を達成する',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/ito_mika' },
      { platform: 'note', url: 'https://note.com/ito_mika' },
    ],
    totalAttendanceDays: 45,
    currentStreakDays: 8,
    maxStreakDays: 15,
    currentTitle: TITLE_MASTER[2],
    joinedAt: '2024-08-15',
  },
  {
    id: '7',
    username: 'kobayashi_ryo',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobayashi',
    displayName: '小林涼',
    tagline: 'PM / アジャイルコーチ',
    bio: 'プロダクトマネージャーとして働いています。朝活ではPM関連の書籍を読んでいます。',
    skills: ['プロダクトマネジメント', 'Scrum', 'データ分析'],
    interests: ['読書', 'ポッドキャスト', 'ボードゲーム'],
    vision: 'ユーザーに愛されるプロダクトを作り続ける',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/kobayashi_ryo' },
      { platform: 'linkedin', url: 'https://linkedin.com/in/kobayashi-ryo' },
    ],
    totalAttendanceDays: 98,
    currentStreakDays: 0,
    maxStreakDays: 32,
    currentTitle: TITLE_MASTER[4],
    joinedAt: '2024-02-28',
  },
  {
    id: '8',
    username: 'yoshida_mai',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoshida',
    displayName: '吉田舞',
    tagline: '新卒エンジニア / 成長中！',
    bio: '今年から新卒エンジニアとして働き始めました。先輩方の朝活を見習って参加しています！',
    skills: ['Java', 'Spring Boot', 'SQL'],
    interests: ['プログラミング', 'アニメ', 'ゲーム'],
    vision: 'フルスタックエンジニアになる',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/yoshida_mai' },
      { platform: 'github', url: 'https://github.com/yoshida-mai' },
    ],
    totalAttendanceDays: 23,
    currentStreakDays: 5,
    maxStreakDays: 10,
    currentTitle: TITLE_MASTER[1],
    joinedAt: '2024-09-01',
  },
  {
    id: '9',
    username: 'nakamura_sho',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakamura',
    displayName: '中村翔',
    tagline: 'バックエンドエンジニア / OSS貢献者',
    bio: 'Rustが好きなバックエンドエンジニアです。朝活でOSSにコントリビュートしています。',
    skills: ['Rust', 'C++', 'システムプログラミング', 'Linux'],
    interests: ['OSS', '低レイヤー', 'コンパイラ'],
    vision: '世界的なOSSメンテナーになる',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'github', url: 'https://github.com/nakamura-sho' },
      { platform: 'twitter', url: 'https://twitter.com/nakamura_sho' },
    ],
    totalAttendanceDays: 267,
    currentStreakDays: 45,
    maxStreakDays: 78,
    currentTitle: TITLE_MASTER[6],
    joinedAt: '2023-05-15',
  },
  {
    id: '10',
    username: 'matsumoto_aya',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=matsumoto',
    displayName: '松本彩',
    tagline: 'マーケター / SNS運用のプロ',
    bio: 'BtoBマーケティングを担当しています。朝活でマーケティングの最新トレンドをキャッチアップ！',
    skills: ['デジタルマーケティング', 'SNS運用', 'Google Analytics', 'HubSpot'],
    interests: ['マーケティング', '旅行', 'カメラ'],
    vision: 'CMOとして事業成長に貢献する',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/matsumoto_aya' },
      { platform: 'instagram', url: 'https://instagram.com/matsumoto_aya' },
      { platform: 'linkedin', url: 'https://linkedin.com/in/matsumoto-aya' },
    ],
    totalAttendanceDays: 134,
    currentStreakDays: 21,
    maxStreakDays: 40,
    currentTitle: TITLE_MASTER[5],
    joinedAt: '2024-01-01',
  },
  {
    id: '11',
    username: 'takahashi_yu',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
    displayName: '高橋優',
    tagline: 'データサイエンティスト / Kaggle Expert',
    bio: 'データ分析が専門です。朝活でKaggleのコンペに参加しています。機械学習の勉強会も開催中！',
    skills: ['Python', 'TensorFlow', 'PyTorch', '統計学', 'SQL'],
    interests: ['機械学習', 'Kaggle', '数学'],
    vision: 'Kaggle Grandmasterになる',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/takahashi_yu' },
      { platform: 'github', url: 'https://github.com/takahashi-yu' },
    ],
    totalAttendanceDays: 201,
    currentStreakDays: 56,
    maxStreakDays: 90,
    currentTitle: TITLE_MASTER[6],
    joinedAt: '2023-07-20',
  },
  {
    id: '12',
    username: 'morita_kana',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morita',
    displayName: '森田佳奈',
    tagline: '英語講師 / TOEIC 990点',
    bio: '英語講師をしています。朝活で生徒さんと一緒に英語学習をしています。',
    skills: ['英語', 'TOEIC', '英検', 'IELTS'],
    interests: ['英語学習', '海外ドラマ', '旅行'],
    vision: '英語教育で日本を変える',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/morita_kana' },
      { platform: 'instagram', url: 'https://instagram.com/morita_kana' },
    ],
    totalAttendanceDays: 178,
    currentStreakDays: 34,
    maxStreakDays: 60,
    currentTitle: TITLE_MASTER[5],
    joinedAt: '2023-09-10',
  },
  {
    id: '13',
    username: 'fujita_takeshi',
    avatarUrl: null,
    displayName: '藤田武',
    tagline: '経営コンサルタント',
    bio: '中小企業の経営コンサルティングをしています。朝活で経営戦略の勉強をしています。',
    skills: ['経営戦略', '財務分析', 'MBA'],
    interests: ['経営', 'ゴルフ', 'ワイン'],
    vision: null,
    isVisionPublic: false,
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/fujita-takeshi' },
    ],
    totalAttendanceDays: 67,
    currentStreakDays: 0,
    maxStreakDays: 28,
    currentTitle: TITLE_MASTER[3],
    joinedAt: '2024-04-15',
  },
  {
    id: '14',
    username: 'shimizu_rin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu',
    displayName: '清水凛',
    tagline: 'イラストレーター / 朝活お絵描き',
    bio: 'フリーランスのイラストレーターです。朝活で毎日1枚絵を描いています。',
    skills: ['イラスト', 'Procreate', 'Clip Studio', 'キャラクターデザイン'],
    interests: ['お絵描き', 'アニメ', '漫画'],
    vision: '自分の画集を出版する',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/shimizu_rin' },
      { platform: 'instagram', url: 'https://instagram.com/shimizu_rin' },
    ],
    totalAttendanceDays: 289,
    currentStreakDays: 100,
    maxStreakDays: 100,
    currentTitle: TITLE_MASTER[7],
    joinedAt: '2023-04-01',
  },
  {
    id: '15',
    username: 'ogawa_hiroshi',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ogawa',
    displayName: '小川博',
    tagline: 'インフラエンジニア / SRE',
    bio: 'SREとして働いています。朝活でクラウドの勉強と資格取得を目指しています。',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Prometheus'],
    interests: ['インフラ', 'モニタリング', '自動化'],
    vision: 'SRE文化を日本に広める',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'github', url: 'https://github.com/ogawa-hiroshi' },
      { platform: 'twitter', url: 'https://twitter.com/ogawa_hiroshi' },
    ],
    totalAttendanceDays: 145,
    currentStreakDays: 28,
    maxStreakDays: 42,
    currentTitle: TITLE_MASTER[5],
    joinedAt: '2023-12-01',
  },
  {
    id: '16',
    username: 'kimura_saki',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimura',
    displayName: '木村咲',
    tagline: '看護師 / 夜勤明けの朝活',
    bio: '看護師として働いています。夜勤明けでも朝活に参加して生活リズムを整えています。',
    skills: ['看護', '医療知識', 'コミュニケーション'],
    interests: ['健康', 'ヨガ', '植物'],
    vision: '専門看護師の資格を取得する',
    isVisionPublic: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/kimura_saki' },
    ],
    totalAttendanceDays: 56,
    currentStreakDays: 3,
    maxStreakDays: 14,
    currentTitle: TITLE_MASTER[2],
    joinedAt: '2024-07-01',
  },
];

// ========================================
// スキル・興味の一覧（フィルター用）
// ========================================

export const ALL_SKILLS = [
  'TypeScript', 'React', 'Node.js', 'AWS', 'Figma', 'UI/UX', 'Photoshop', 'Illustration',
  'Python', 'Machine Learning', 'Data Science', 'Leadership', '簿記', '財務会計', 'Excel',
  'Go', 'Kubernetes', 'Terraform', 'GCP', 'ライティング', 'SEO', 'WordPress',
  'プロダクトマネジメント', 'Scrum', 'データ分析', 'Java', 'Spring Boot', 'SQL',
  'Rust', 'C++', 'システムプログラミング', 'Linux', 'デジタルマーケティング', 'SNS運用',
  'Google Analytics', 'HubSpot', 'TensorFlow', 'PyTorch', '統計学', '英語', 'TOEIC',
  '英検', 'IELTS', '経営戦略', 'MBA', 'イラスト', 'Procreate', 'Clip Studio',
  'キャラクターデザイン', 'Prometheus', '看護', '医療知識', 'コミュニケーション',
];

export const ALL_INTERESTS = [
  '読書', 'ランニング', 'コーヒー', 'デザイン', '英語学習', 'ヨガ', '瞑想', '登山',
  '資格取得', 'カフェ巡り', '映画鑑賞', 'ブログ執筆', 'オープンソース', '子育て', '料理',
  'ポッドキャスト', 'ボードゲーム', 'プログラミング', 'アニメ', 'ゲーム', 'OSS', '低レイヤー',
  'コンパイラ', 'マーケティング', '旅行', 'カメラ', '機械学習', 'Kaggle', '数学',
  '海外ドラマ', '経営', 'ゴルフ', 'ワイン', 'お絵描き', '漫画', 'インフラ', 'モニタリング',
  '自動化', '健康', '植物',
];
