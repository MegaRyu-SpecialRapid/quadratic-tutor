// 簡易パーサ: y = ax^2 + bx + c を抽出し、判別式や頂点などを計算
module.exports = async function (context, req) {
  const text = (req.body && req.body.text || '').replace(/\s+/g, '').toLowerCase();

  // "y=..." を抽出
  const m = text.match(/y=([^=]+)/);
  if (!m) return context.res = { status: 200, jsonBody: { answer: help() } };

  // a（ax^2 の係数）
  const ax2 = m[1].match(/([+-]?[\d.]*?)x\^?2/);
  const a = ax2 ? parseFloat((ax2[1] === '' || ax2[1] === '+' || ax2[1] === undefined) ? '1' : (ax2[1] === '-' ? '-1' : ax2[1])) : 0;

  // b（bx の係数）
  const bx = m[1].match(/([+-][\d.]*?)x(?!\^)/);
  const b = bx ? parseFloat((bx[1] === '+' || bx[1] === '-') ? (bx[1]+'1') : bx[1]) : 0;

  // c（定数項）
  let c = 0;
  const parts = m[1].split(/(?=[+-])/);
  for (const p of parts) if (!p.includes('x')) { const v = parseFloat(p); if (!isNaN(v)) c += v; }

  if (a === 0 && b === 0) return context.res = { status: 200, jsonBody: { answer: '二次関数の形 y=ax^2+bx+c を検出できませんでした。例: y=2x^2-3x+1' } };
  if (a === 0) return context.res = { status: 200, jsonBody: { answer: 'a=0 のため一次関数です。二次関数 y=ax^2+bx+c の形で入力してください。' } };

  const D = b*b - 4*a*c;                 // 判別式
  const axis = -b/(2*a);                 // 軸
  const vertexY = a*axis*axis + b*axis + c; // 頂点の y

  // 解
  let roots = '';
  if (D > 0) {
    const r1 = (-b + Math.sqrt(D)) / (2*a);
    const r2 = (-b - Math.sqrt(D)) / (2*a);
    roots = `実数解2つ: x=${fmt(r1)}, ${fmt(r2)}`;
  } else if (D === 0) {
    roots = `重解: x=${fmt(-b/(2*a))}`;
  } else {
    roots = '実数解なし（複素数解）';
  }

  // 平方完成
  const h = -b/(2*a);
  const k = c - (b*b)/(4*a);
  const completed = `y=${fmt(a)}(x${fmtSign(-h)})^2${fmtSign(k, true)}`;

  // 開き方
  const openDir = (a > 0) ? '上に開く' : '下に開く';

  const answer = [
    `入力を y=ax^2+bx+c と読むと、a=${fmt(a)}, b=${fmt(b)}, c=${fmt(c)} です。`,
    `判別式 D=b^2-4ac=${fmt(D)} ⇒ ${roots}`,
    `軸: x=${fmt(axis)}`,
    `頂点: (${fmt(axis)}, ${fmt(vertexY)})`,
    `開き方: ${openDir}`,
    `平方完成: ${completed}`
  ].join('\n');

  context.res = { status: 200, jsonBody: { answer } };
};

function fmt(n){ return Number.isInteger(n) ? String(n) : (Math.round(n*1e6)/1e6).toString(); }
function fmtSign(n, withZero=false){
  const s = (n>=0? '+' : ''); 
  if (!withZero && n===0) return '';
  return s + fmt(n);
}
function help(){
  return '二次関数 y=ax^2+bx+c を含む質問に答えます。例: 「y=2x^2-3x+1 の頂点と解」';
}
