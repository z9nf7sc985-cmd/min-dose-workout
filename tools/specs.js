// Pose specs for every exercise. Side view faces right. Angles: 0=right, 90=down, -90=up (SVG coords).
const F = 128;
const A = (a1, a2) => ({ a: [a1, a2] });
const T = (x, y, b = 1, extra = {}) => Object.assign({ to: [x, y], b }, extra);
const RF = (ref, dx = 0, dy = 0, b = 1) => ({ to: { ref, d: [dx, dy] }, b });
const stand = (x, o = {}) => Object.assign({ hip: [x, 72], t: -90, an: A(96, 88), af: A(84, 92), ln: T(x + 3, 124, 1, { f: 0 }), lf: T(x - 3, 124, 1, { f: 0 }) }, o);
// generic seat (side): stool x50..92 top 98; seated hip at (78,93)
const seated = (o = {}) => Object.assign({ hip: [76, 93], t: -92, order: ['ln', 'lf', 'an', 'af'], ln: T(108, 122, 1, { f: 0 }), lf: T(104, 122, 1, { f: 0 }), an: RF('knee', -8, -4, -1), af: RF('kneef', -10, -4, -1) }, o);
const SEAT = [['stool', { x: 44, top: 98, w: 42 }], 'floor'];
// car seat (side): hip (64,92), reclined back
const carSeat = (o = {}) => Object.assign({ hip: [64, 92], t: -100, order: ['ln', 'lf', 'an', 'af'], ln: T(108, 116, 1, { f: 4 }), lf: T(104, 116, 1, { f: 4 }), an: RF('knee', -10, -4, -1), af: RF('kneef', -12, -4, -1) }, o);
const CAR = ['car'];
// front-view seated (both modes)
const frontSeat = (o = {}) => Object.assign({ view: 'front', hip: [110, 90], t: -90, ln: { a: [50, 95], k: [0.55, 1], f: 10, fl: 6 }, lf: { a: [130, 85], k: [0.55, 1], f: 170, fl: 6 }, an: A(95, 95), af: A(85, 85) }, o);
const SEATF = [['seatFront']], SEATFC = [['seatFront', { car: true }]];
// supine (on back), head on the left
const supine = (hipX, o = {}) => Object.assign({ hip: [hipX, 123], t: 180, hd: 192, face: 1 }, o);
// prone (face down), head on the right
const prone = (hipX, o = {}) => Object.assign({ hip: [hipX, 123], t: -1, hd: -6, face: 1 }, o);

const S = {};
// ---------------- LEGS ----------------
S.splitsquat = { props: [['couch', { x: 18, w: 58, top: 100, back: 'l' }], 'floor'], arrows: [{ j: 'hip', off: [16, 0] }],
  poses: [{ hip: [116, 72], t: -84, an: A(92, 80), af: A(88, 84), ln: T(132, 124, 1, { f: 0 }), lf: T(76, 99, 1, { f: 190 }) },
          { hip: [106, 99], t: -76, an: A(88, 76), af: A(84, 80), ln: T(132, 124, 1, { f: 0 }), lf: T(76, 99, 1, { f: 190 }) }] };
S.revlunge = { props: ['floor'], arrows: [{ j: 'anklef', off: [0, -6], c: -10 }],
  poses: [stand(116, { ln: T(120, 124, 1, { f: 0 }), lf: T(114, 124, 1, { f: 0 }) }),
          { hip: [104, 98], t: -86, an: A(90, 85), af: A(86, 88), ln: T(126, 124, 1, { f: 0 }), lf: T(64, 121, -1, { f: 10 }) }] };
S.tempsquat = { props: ['floor'], arrows: [{ j: 'hip', off: [-16, 0] }],
  poses: [stand(110, { an: A(80, 80), af: A(76, 76), ln: T(114, 124, 1, { f: 0 }), lf: T(110, 124, 1, { f: 0 }) }),
          { hip: [88, 102], t: -54, an: A(-2, 0), af: A(2, 4), ln: T(114, 124, 1, { f: 0 }), lf: T(110, 124, 1, { f: 0 }) }] };
S.couchsquat = { props: [['couch', { x: 30, w: 62, top: 98, back: 'l' }], 'floor'], arrows: [{ j: 'hip', off: [-14, 0], c: 6 }],
  poses: [{ hip: [88, 93], t: -82, an: A(-4, 0), af: A(0, 4), ln: T(116, 124, 1, { f: 0 }), lf: { a: [-8, 8], f: -80 } },
          { hip: [112, 72], t: -86, an: A(-4, 0), af: A(0, 4), ln: T(116, 124, 1, { f: 0 }), lf: { a: [40, 52], f: -40 } }] };
S.shrimp = { props: [['cushion', { x: 76, w: 26 }], ['stool', { x: 150, top: 92, w: 30 }], 'floor'], arrows: [{ j: 'hip', off: [-18, 0] }],
  poses: [{ hip: [112, 72], t: -88, order: ['ln', 'lf', 'af', 'an'], an: T(152, 90, -1), ln: T(115, 124, 1, { f: 0 }), lf: { a: [100, -128], f: -150 }, af: RF('anklef', 2, 0, -1) },
          { hip: [100, 98], t: -60, order: ['ln', 'lf', 'af', 'an'], an: T(152, 90, -1), ln: T(115, 124, 1, { f: 0 }), lf: { a: [104, -150], f: -170 }, af: RF('anklef', 2, 0, -1) }] };
S.wallsit = { props: [['wall', { x: 28 }], 'floor'], iso: true, force: [{ at: [44, 70], ang: 180, len: 8 }, { at: [70, 104], ang: 90, len: 12 }],
  poses: [{ hip: [42, 98], t: -90, an: RF('knee', -4, -4, -1), af: RF('kneef', -6, -4, -1), ln: A(0, 90), lf: A(-2, 92) }, { hip: [42, 99], t: -90, an: RF('knee', -4, -4, -1), af: RF('kneef', -6, -4, -1), ln: A(1, 89), lf: A(-1, 91) }] };
S.wallsit.poses.forEach(p => { p.ln.f = 0; p.lf.f = 0; p.order = ['ln', 'lf', 'an', 'af']; });
S.slhipthrust = { props: [['couch', { x: 10, w: 56, top: 96, back: 'l' }], 'floor'], arrows: [{ j: 'hip', off: [0, -8] }],
  poses: [{ hip: [96, 116], t: -152, hd: -150, an: A(168, 176), af: A(172, 180), ln: T(124, 124, 1, { f: 0 }), lf: { a: [-62, -6], f: -80 } },
          { hip: [100, 94], t: 180, hd: -172, an: A(172, 178), af: A(176, 180), ln: T(124, 124, 1, { f: 0 }), lf: { a: [-40, 10], f: -80 } }] };
S.glutebridge = { props: ['floor'], arrows: [{ j: 'hip', off: [0, -8] }],
  poses: [supine(92, { an: A(2, 0), af: A(0, 0), ln: T(122, 124, 1, { f: 0 }), lf: T(118, 124, 1, { f: 0 }) }),
          { hip: [90, 104], t: 154, hd: 186, an: A(2, 0), af: A(0, 0), ln: T(122, 124, 1, { f: 0 }), lf: T(118, 124, 1, { f: 0 }) }] };
S.slidecurl = { props: ['floor'], arrows: [{ j: 'ankle', off: [0, -9], both: true }],
  poses: [{ hip: [88, 112], t: 165, hd: 190, an: A(5, 0), af: A(3, 0), ln: T(140, 123, 1, { f: -70 }), lf: T(137, 123, 1, { f: -70 }) },
          { hip: [90, 101], t: 154, hd: 186, an: A(5, 0), af: A(3, 0), ln: T(116, 123, 1, { f: -60 }), lf: T(113, 123, 1, { f: -60 }) }] };
S.walkout = { props: ['floor'], arrows: [{ j: 'ankle', off: [0, -9], both: true }], poses: [S.slidecurl.poses[1], S.slidecurl.poses[0]].map(p => JSON.parse(JSON.stringify(p))) };
S.walkout.poses.forEach(p => { p.ln.f = -40; p.lf.f = -40; });
S.nordic = { props: [['couch', { x: 6, w: 54, top: 88, back: 'l', gap: true }], ['cushion', { x: 72, w: 24 }], 'floor'], arrows: [{ j: 'head', off: [6, 0], c: -10 }],
  poses: [{ hip: [84, 98], t: -90, an: A(96, 70), af: A(90, 74), ln: { a: [92, 178], f: 186 }, lf: { a: [90, 178], f: 186 } },
          { hip: [103, 106], t: -42, an: A(52, 30), af: A(48, 34), ln: { a: [135, 178], f: 186 }, lf: { a: [133, 178], f: 186 } }] };
S.calfraise = { props: [['wall', { x: 146 }], 'floor'], arrows: [{ j: 'hip', off: [-14, 0] }], viewLabel: 'Floor or stair edge',
  poses: [{ hip: [104, 72], t: -90, an: T(146, 50, -1), af: A(88, 92), ln: T(106, 124, 1, { f: 0 }), lf: { a: [98, 160], f: 170 } },
          { hip: [107, 64], t: -90, an: T(146, 44, -1), af: A(88, 92), ln: T(109.5, 116.5, 1, { f: 62 }), lf: { a: [98, 160], f: 170 } }] };
// ---------------- PUSH ----------------
S.inclinepush = { props: [['couch', { x: 140, w: 70, top: 98, back: 'r' }], 'floor'], arrows: [{ j: 'shoulder', off: [-8, -8] }],
  poses: [{ hip: [94, 89], t: -38, hd: -38, an: T(146, 97, -1), af: T(143, 97, -1), ln: T(52, 122, 1, { f: 60 }), lf: T(50, 122, 1, { f: 60 }) },
          { hip: [101, 102], t: -22, hd: -22, an: T(146, 97, -1), af: T(143, 97, -1), ln: T(52, 122, 1, { f: 60 }), lf: T(50, 122, 1, { f: 60 }) }] };
const pushUp = (hx = 150) => [{ hip: [110, 100], t: -24, hd: -24, an: T(hx, 124, -1), af: T(hx - 3, 124, -1), ln: T(62, 121, 1, { f: 70 }), lf: T(60, 121, 1, { f: 70 }) },
  { hip: [114.5, 115.5], t: -6, hd: -6, an: T(hx, 124, -1), af: T(hx - 3, 124, -1), ln: T(62, 121, 1, { f: 75 }), lf: T(60, 121, 1, { f: 75 }) }];
S.pushup = { props: ['floor'], arrows: [{ j: 'shoulder', off: [-6, -10] }], poses: pushUp() };
S.diamond = { props: ['floor'], arrows: [{ j: 'shoulder', off: [-6, -10] }], poses: pushUp(140) };
S.declinepush = { props: [['couch', { x: 4, w: 54, top: 86, back: 'l' }], 'floor'], arrows: [{ j: 'shoulder', off: [-8, -8] }],
  poses: [{ hip: [107, 81], t: 0, hd: 2, an: T(150, 124, -1), af: T(147, 124, -1), ln: T(54, 82, 1, { f: 80 }), lf: T(52, 82, 1, { f: 80 }) },
          { hip: [105, 93], t: 15, hd: 15, an: T(150, 124, -1), af: T(147, 124, -1), ln: T(54, 82, 1, { f: 80 }), lf: T(52, 82, 1, { f: 80 }) }] };
// archer: front view (looking at the person head-on)
S.archer = { props: ['floor'], viewLabel: 'Front view (facing you)', arrows: [{ j: 'head', off: [0, -18] }],
  poses: [{ view: 'front', so: 14, hip: [110, 78], t: 90, tk: 0.42, hd: 90, hk: 0.8, an: T(66, 124, -1), af: T(154, 124, 1) },
          { view: 'front', so: 14, hip: [102, 89], t: 90, tk: 0.42, hd: 90, hk: 0.8, an: T(66, 124, -1), af: T(154, 124, 1) }] };
S.palmpress = { props: SEATF, iso: true, isoLabel: 'SQUEEZE', force: [{ at: [94, 64], ang: 0, len: 9 }, { at: [126, 64], ang: 180, len: 9 }],
  poses: [frontSeat({ an: { a: [40, 180], k: [0.65, 1] }, af: { a: [140, 0], k: [0.65, 1] } }), frontSeat({ an: { a: [41, 180], k: [0.64, 1] }, af: { a: [139, 0], k: [0.64, 1] } })] };
S.pikepush = { props: ['floor'], arrows: [{ j: 'head', off: [12, -4] }],
  poses: [{ hip: [90, 66], t: 28, hd: 60, an: T(130, 124, 1), af: T(127, 124, 1), ln: T(76, 120, -1, { f: 30 }), lf: T(74, 120, -1, { f: 30 }) },
          { hip: [100, 79], t: 45, hd: 70, an: T(130, 124, 1), af: T(127, 124, 1), ln: T(76, 120, -1, { f: 30 }), lf: T(74, 120, -1, { f: 30 }) }] };
S.elevpike = { props: [['couch', { x: 26, w: 56, top: 88, back: 'l' }], 'floor'], arrows: [{ j: 'head', off: [12, -2] }],
  poses: [{ hip: [116, 46], t: 82, hd: 88, an: T(126, 124, 1), af: T(123, 124, 1), ln: T(80, 84, -1, { f: 90 }), lf: T(78, 84, -1, { f: 90 }) },
          { hip: [121, 68], t: 86, hd: 92, an: T(126, 124, 1), af: T(123, 124, 1), ln: T(80, 84, -1, { f: 90 }), lf: T(78, 84, -1, { f: 90 }) }] };
S.sphinx = { props: ['floor'], arrows: [{ j: 'shoulder', off: [-4, -12] }],
  poses: [{ hip: [87.5, 109.4], t: -13.7, hd: -10, an: T(148, 124, -1), af: T(145, 124, -1), ln: T(36, 122, 1, { f: 75 }), lf: T(34, 122, 1, { f: 75 }) },
          { hip: [85.4, 103.7], t: -20.3, hd: -18, an: T(148, 124, -1), af: T(145, 124, -1), ln: T(36, 122, 1, { f: 75 }), lf: T(34, 122, 1, { f: 75 }) }] };
// ---------------- PULL / BACK ----------------
S.srrow = { props: SEAT, arrows: [{ j: 'elbow', off: [0, 10] }], force: [{ at: 'handf', d: [4, 4], ang: 0, len: 10 }],
  poses: [seated({ order: ['ln', 'lf', 'an', 'af'], an: A(10, 0), af: RF('hand', -3, 2, -1) }), seated({ order: ['ln', 'lf', 'an', 'af'], an: A(118, -4), af: RF('hand', -3, 2, -1) })] };
S.floorpull = { props: ['floor'], arrows: [{ j: 'hip', off: [0, -12] }],
  poses: [prone(64, { an: T(156, 123, 1), af: T(153, 123, 1), ln: T(11, 123, 1, { f: 180 }), lf: T(12, 124, 1, { f: 180 }) }),
          prone(96, { an: T(156, 123, 1), af: T(153, 123, 1), ln: T(43, 123, 1, { f: 180 }), lf: T(44, 124, 1, { f: 180 }) })] };
S.supermanpull = { props: ['floor'], arrows: [{ j: 'hand', off: [0, -6], c: -8 }],
  poses: [prone(78, { t: -10, hd: -18, an: A(-18, -18), af: A(-14, -14), ln: T(26, 121, 1, { f: 180 }), lf: T(27, 123, 1, { f: 180 }) }),
          prone(78, { t: -12, hd: -20, an: A(168, -40), af: A(172, -36), ln: T(26, 121, 1, { f: 180 }), lf: T(27, 123, 1, { f: 180 }) })] };
const top = (o) => Object.assign({ view: 'top', hip: [80, 65], t: 0, hd: 0, so: 12, ho: 7, ln: A(178, 180), lf: A(182, 180) }, o);
S.ytw = { props: ['mat'], viewLabel: 'Top view · lying face down', poseLabels: ['Y', 'T', 'W'], hold: 0.7, move: 0.9, ghost: false,
  poses: [top({ an: A(40, 40), af: A(-40, -40) }), top({ an: A(90, 90), af: A(-90, -90) }), top({ an: A(140, 40), af: A(-140, -40) })] };
S.snowangel = { props: ['mat'], viewLabel: 'Top view · lying face down', poseLabels: ['', '', ''], ghost: false, arrows: [{ j: 'hand', from: 0, to: 2, c: 34 }],
  poses: [top({ an: A(168, 172), af: A(-168, -172) }), top({ an: A(90, 90), af: A(-90, -90) }), top({ an: A(14, 10), af: A(-14, -10) })], holds: [0.4, 0.05, 0.6] };
S.snowangel.poseLabels = null;
S.srpullapart = { props: SEATF, iso: true, isoLabel: 'PULL', force: [{ at: [100, 48], ang: 180, len: 12 }, { at: [120, 48], ang: 0, len: 12 }],
  poses: [frontSeat({ an: { a: [12, 180], k: [0.6, 1] }, af: { a: [168, 0], k: [0.6, 1] } }), frontSeat({ an: { a: [12, 182], k: [0.62, 1] }, af: { a: [168, -2], k: [0.62, 1] } })] };
S.walllat = { props: [['wall', { x: 128 }], 'floor'], iso: true, isoLabel: 'PRESS', viewLabel: 'Front view', force: [{ at: [118, 58], ang: 0, len: 9 }],
  poses: [{ view: 'front', hip: [110, 72], t: -90, an: { a: [78, 100], k: [1, 0.45] }, af: A(95, 92), ln: { a: [88, 91], f: 10, fl: 6 }, lf: { a: [92, 89], f: 170, fl: 6 } },
          { view: 'front', hip: [110, 72], t: -90, an: { a: [77, 100], k: [1, 0.45] }, af: A(95, 92), ln: { a: [88, 91], f: 10, fl: 6 }, lf: { a: [92, 89], f: 170, fl: 6 } }] };
S.srlat = { props: SEATF, arrows: [{ j: 'elbow', off: [10, 0], c: -8 }], force: [{ at: 'elbow', d: [0, -7], ang: 90, len: 9 }],
  poses: [frontSeat({ order: ['ln', 'lf', 'an', 'af'], an: A(88, 94), af: RF('elbow', -2, -2, -1) }), frontSeat({ order: ['ln', 'lf', 'an', 'af'], an: A(28, 92), af: RF('elbow', -3, -2, -1) })] };
// ---------------- ARMS ----------------
S.legcurl = { props: SEAT, arrows: [{ j: 'knee', off: [8, -2], c: -6 }], force: [{ at: 'knee', d: [2, 6], ang: 90, len: 10 }],
  poses: [seated({ ln: { a: [2, 88], f: 0 }, an: RF('knee', -3, 4, -1), af: RF('knee', -5, 4, -1) }), seated({ ln: { a: [-42, 70], f: 0 }, an: RF('knee', -3, 4, -1), af: RF('knee', -5, 4, -1) })] };
S.srcurl = { props: SEAT, arrows: [{ j: 'hand', off: [8, 0], c: -10 }], force: [{ at: 'hand', d: [0, -6], ang: 90, len: 9 }],
  poses: [seated({ order: ['ln', 'lf', 'an', 'af'], an: A(84, 40), af: RF('hand', -2, -3, -1) }), seated({ order: ['ln', 'lf', 'an', 'af'], an: A(82, -86), af: RF('hand', 2, -3, -1) })] };
// ---------------- CORE ----------------
S.deadbug = { props: ['floor'], arrows: [{ j: 'hand', off: [0, -4], c: 10 }, { j: 'anklef', off: [0, -6], c: -6 }],
  poses: [supine(98, { an: A(-90, -90), af: A(-88, -88), ln: { a: [-90, 0], f: -80 }, lf: { a: [-88, 0], f: -80 } }),
          supine(98, { an: A(-170, -172), af: A(-88, -88), ln: { a: [-90, 0], f: -80 }, lf: { a: [-8, -8], f: -90 } })] };
S.hollow = { props: ['floor'], iso: true, force: [{ at: [100, 114], ang: 90, len: 8 }],
  poses: [supine(100, { t: 188, hd: 196, an: A(-170, -172), af: A(-168, -170), ln: { a: [-12, -12], f: -80 }, lf: { a: [-10, -10], f: -80 } }),
          supine(100, { t: 189, hd: 197, an: A(-171, -173), af: A(-169, -171), ln: { a: [-13, -13], f: -80 }, lf: { a: [-11, -11], f: -80 } })] };
S.revcrunch = { props: ['floor'], arrows: [{ j: 'knee', off: [8, -4], c: -8 }],
  poses: [supine(98, { an: A(2, 0), af: A(0, 0), ln: { a: [-90, 0], f: -80 }, lf: { a: [-88, 0], f: -80 } }),
          { hip: [96, 112], t: 166, hd: 190, an: A(4, 0), af: A(2, 0), ln: { a: [-128, -10], f: -90 }, lf: { a: [-126, -10], f: -90 } }] };
S.fingerplank = { props: ['floor'], iso: true, viewLabel: 'On fingertips', force: [{ at: [104, 92], ang: -90, len: 8 }], poses: [pushUp()[0], pushUp()[0]] };
S.fistsqueeze = { props: SEATF, iso: true, isoLabel: 'SQUEEZE', force: [{ at: [96, 72], ang: 0, len: 7 }, { at: [124, 72], ang: 180, len: 7 }],
  poses: [frontSeat({ an: { a: [94, -130], k: [1, 0.7] }, af: { a: [86, -50], k: [1, 0.7] } }), frontSeat({ an: { a: [94, -130], k: [1, 0.7] }, af: { a: [86, -50], k: [1, 0.7] } })] };
// ---------------- CAR ----------------
S.c_seatpush = { props: CAR, iso: true, isoLabel: 'PUSH', force: [{ at: [70, 84], ang: 90, len: 10 }, { at: 'hip', d: [0, -16], ang: -90, len: 8 }],
  poses: [carSeat({ an: T(74, 96, -1), af: T(71, 96, -1) }), carSeat({ hip: [64, 90], an: T(74, 96, -1), af: T(71, 96, -1) })] };
S.c_elbowdrive = { props: CAR, iso: true, isoLabel: 'DRIVE', force: [{ at: 'elbow', ang: 130, len: 11 }],
  poses: [carSeat({ an: A(102, -6), af: A(100, -8) }), carSeat({ an: A(103, -6), af: A(101, -8) })] };
S.c_ohp = { props: CAR, arrows: [{ j: 'hand', off: [10, 0] }], force: [{ at: 'hand', d: [0, -10], ang: 90, len: 8 }],
  poses: [carSeat({ order: ['ln', 'lf', 'an', 'af'], an: A(70, -84), af: RF('hand', 0, -4, -1) }), carSeat({ order: ['ln', 'lf', 'an', 'af'], an: A(-84, -86), af: RF('hand', 0, -4, -1) })] };
S.c_ankles = { props: CAR, iso: true, isoLabel: 'PUSH-PULL', viewLabel: 'Ankles crossed', force: [{ at: 'ankle', d: [4, -6], ang: 0, len: 10 }, { at: 'anklef', d: [-4, 4], ang: 180, len: 10 }],
  poses: [carSeat({ ln: T(110, 110, 1, { f: 30 }), lf: T(104, 111, 1, { f: 30 }) }), carSeat({ ln: T(110.5, 110, 1, { f: 30 }), lf: T(103.5, 111, 1, { f: 30 }) })] };
S.c_kneeext = { props: CAR, arrows: [{ j: 'ankle', off: [8, 0], c: 10 }],
  poses: [carSeat({ ln: { a: [-6, 80], f: 4 } }), carSeat({ ln: { a: [-6, -4], f: -80 } })] };
S.c_heeldig = { props: CAR, iso: true, isoLabel: 'DIG', force: [{ at: 'ankle', d: [-2, 4], ang: 160, len: 11 }],
  poses: [carSeat({ ln: T(100, 116, 1, { f: 4 }), lf: T(97, 116, 1, { f: 4 }) }), carSeat({ ln: T(99.5, 116.5, 1, { f: 4 }), lf: T(96.5, 116.5, 1, { f: 4 }) })] };
S.c_glute = { props: CAR, iso: true, isoLabel: 'SQUEEZE', force: [{ at: 'hip', d: [-6, 6], ang: -90, len: 9 }],
  poses: [carSeat(), carSeat({ hip: [64, 89] })] };
S.c_abduct = { props: SEATFC, iso: true, isoLabel: 'KNEES OUT', force: [{ at: 'knee', d: [5, 0], ang: 0, len: 10 }, { at: 'kneef', d: [-5, 0], ang: 180, len: 10 }],
  poses: [frontSeat({ order: ['ln', 'lf', 'an', 'af'], ln: { a: [60, 96], k: [0.5, 1], f: 10, fl: 6 }, lf: { a: [120, 84], k: [0.5, 1], f: 170, fl: 6 }, an: RF('knee', 4, -2, -1), af: RF('kneef', -4, -2, 1) }),
          frontSeat({ order: ['ln', 'lf', 'an', 'af'], ln: { a: [58, 96], k: [0.5, 1], f: 10, fl: 6 }, lf: { a: [122, 84], k: [0.5, 1], f: 170, fl: 6 }, an: RF('knee', 4, -2, -1), af: RF('kneef', -4, -2, 1) })] };
S.c_calf = { props: CAR, arrows: [{ j: 'ankle', off: [-8, 0] }], force: [{ at: 'knee', d: [0, -12], ang: 90, len: 8 }],
  poses: [carSeat({ ln: T(104, 119.5, 1, { f: 8 }), lf: T(100, 119.5, 1, { f: 8 }) }), carSeat({ ln: T(107, 114, 1, { f: 48 }), lf: T(103, 114, 1, { f: 48 }) })] };
S.c_brace = { props: CAR, iso: true, isoLabel: 'BRACE', force: [{ at: 'hand', d: [0, -6], ang: 90, len: 8 }],
  poses: [carSeat({ t: -88, hd: -70 }), carSeat({ t: -86, hd: -68 })] };
S.c_kneelift = { props: CAR, arrows: [{ j: 'knee', off: [6, -6], c: -6 }],
  poses: [carSeat({ an: T(70, 97, -1), af: T(67, 97, -1) }), carSeat({ an: T(70, 97, -1), af: T(67, 97, -1), ln: { a: [-46, 70], f: 0 }, lf: { a: [-44, 72], f: 0 } })] };
S.c_vacuum = { props: CAR, iso: true, isoLabel: 'BELLY IN', force: [{ at: [86, 76], ang: 190, len: 12 }],
  poses: [carSeat({ belly: 3 }), carSeat({ belly: -0.5 })], hold: 0.8, move: 1 };
S.c_vacuum.iso = true;
S.c_neck = { props: CAR, iso: true, isoLabel: 'GENTLE', poseLabels: ['Forward', 'Back'], viewLabel: '…then each side', hold: 1.4, move: 0.6,
  force: [],
  poses: [carSeat({ order: ['ln', 'lf', 'an', 'af'], an: RF('head', 10, -2, 1), af: RF('knee', -12, -4, -1) }), carSeat({ order: ['ln', 'lf', 'an', 'af'], an: RF('head', -10, -2, -1), af: RF('knee', -12, -4, -1) })] };
module.exports = S;
