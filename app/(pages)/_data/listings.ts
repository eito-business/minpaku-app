// 宿泊施設（Listing）のダミーデータ
export const featuredListings = [
  {
    id: "listing1",
    title: "京都の風情ある町家一棟貸し",
    category: "一軒家",
    price: 18500,
    location_value: "京都市東山区",
    listing_images: [
      {
        id: "img1",
        listing_id: "listing1",
        url: "/kyoto.jpg",
        order: 0,
        created_at: "2025-01-15T00:00:00.000Z",
      },
    ],
    room_count: 2,
    bathroom_count: 1,
    guest_count: 4,
    user_id: "user_dummy_1",
    description:
      "京都の風情ある町家を一棟貸し切りでご利用いただけます。清水寺や祇園からも徒歩圏内で観光に最適です。伝統的な和の雰囲気をお楽しみください。",
    created_at: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "listing2",
    title: "江ノ島プライベートビーチ前コテージ",
    category: "一軒家",
    price: 25000,
    location_value: "沖縄県恩納村",
    listing_images: [
      {
        id: "img2",
        listing_id: "listing2",
        url: "/enoshima.jpg",
        order: 0,
        created_at: "2025-01-20T00:00:00.000Z",
      },
    ],
    room_count: 3,
    bathroom_count: 2,
    guest_count: 6,
    user_id: "user_dummy_2",
    description:
      "沖縄本島の美しい海岸線に位置するプライベートコテージ。ビーチまで徒歩1分、シュノーケリングやBBQを楽しめる設備も完備。家族旅行や友人同士の旅行に最適です。",
    created_at: "2025-01-20T00:00:00.000Z",
  },
  {
    id: "listing3",
    title: "渋谷デザイナーズオフィスマンション",
    category: "マンション",
    price: 25000,
    location_value: "東京都渋谷",
    listing_images: [
      {
        id: "img3",
        listing_id: "listing3",
        url: "/shibuya.jpg",
        order: 0,
        created_at: "2025-01-20T00:00:00.000Z",
      },
    ],
    room_count: 3,
    bathroom_count: 2,
    guest_count: 6,
    user_id: "user_dummy_3",
    description:
      "渋谷駅から徒歩10分の便利な立地。モダンなデザインのオフィスマンションで快適に過ごせます。観光やビジネスの拠点として最適で、周辺にはレストランやショッピングスポットが豊富です。",
    created_at: "2025-01-20T00:00:00.000Z",
  },
  {
    id: "listing4",
    title: "白川郷の木造家屋",
    category: "一軒家",
    price: 12500,
    location_value: "岐阜県大野郡",
    listing_images: [
      {
        id: "img4",
        listing_id: "listing4",
        url: "/shirakawa.jpg",
        order: 0,
        created_at: "2025-03-10T00:00:00.000Z",
      },
    ],
    room_count: 1,
    bathroom_count: 1,
    guest_count: 3,
    user_id: "user_dummy_4",
    description:
      "世界遺産・白川郷の合掌造り集落にほど近い伝統的な木造家屋。美しい自然に囲まれた環境で、飛騨の伝統文化を体験できます。周辺の観光スポットへのアクセスも良好です。",
    created_at: "2025-03-10T00:00:00.000Z",
  },
];
