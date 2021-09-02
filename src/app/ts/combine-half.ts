export function combineFirstHalf(game, baseGame) {
  // 主隊 讓分大小單雙
  
  game['l_1'] = baseGame.l;
  game['o_1'] = baseGame.o;
  game['q_1'] = baseGame.q;
  // 客隊 讓分大小單雙
  game['m_1'] = baseGame.m;
  game['p_1'] = baseGame.p;
  game['r_1'] = baseGame.r;
  // 讓分 強弱球頭
  game['j_1'] = baseGame.j;
  game['k_1'] = baseGame.k;
  // 大小球頭
  game['n_1'] = baseGame.n;

  return game;
}

export function combineSecondHalf(game, baseGame) {
  // 主隊 讓分大小單雙
  game['l_2'] = baseGame.l;
  game['o_2'] = baseGame.o;
  game['q_2'] = baseGame.q;
  // 客隊 讓分大小單雙
  game['m_2'] = baseGame.m;
  game['p_2'] = baseGame.p;
  game['r_2'] = baseGame.r;
  // 讓分 強弱球頭
  game['j_2'] = baseGame.j;
  game['k_2'] = baseGame.k;
  // 大小球頭
  game['n_2'] = baseGame.n;

  return game;
}

export function doCombine(half, game, baseGame) {
  if (half === 1) {
    game = combineFirstHalf(game, baseGame);
  } else if (half === 2) {
    game = combineSecondHalf(game, baseGame);
  }
  return game;
}
