// 실제 OpenAI 연동 전, 데모용 모의 추천 생성
export async function mockRecommend({ location, mood, budget, companions }) {
  const near = (name, off) => ({
    name,
    address: `${location} 어딘가 ${off}번지`,
    priceRange: budget <= 10000 ? '₩' : budget <= 20000 ? '₩₩' : '₩₩₩',
    distanceM: 200 + off * 120,
    placeId: `PLACE_${Math.random().toString(36).slice(2, 10)}`,
    link: `https://map.kakao.com/`,
    reason: `${mood} 기분에 어울리고 ${companions}과(와) 가기 좋아요`
  });

  return {
    summary: { weather: '맑음 22℃(모의)', pick_reason: `${location} 근방 베스트 추린 결과(모의)` },
    restaurants: [near('맛있는김밥', 1), near('든든한백반', 2)],
    cafes: [near('달달카페', 3), near('조용한라운지', 4)]
  };
}

