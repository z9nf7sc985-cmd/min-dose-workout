/* Program data: Minimum-Effective-Dose full-body training.
   Muscle credit for coverage: primary = 1 set, secondary = 0.5 set. */
window.MUSCLES = [
  ['chest','Chest'],['lats','Lats'],['upperBack','Upper back'],
  ['frontDelts','Front delts'],['sideDelts','Side delts'],['rearDelts','Rear delts'],
  ['biceps','Biceps'],['triceps','Triceps'],['quads','Quads'],['hamstrings','Hamstrings'],
  ['glutes','Glutes'],['calves','Calves'],['core','Core'],['forearms','Forearms / grip']
];
window.TARGET = { min: 4, max: 10 }; // hard sets per muscle per week

const E = (name, p, s, cues, swaps, extra) => Object.assign({ name, p, s, cues, swaps }, extra || {});
window.EX = {
  // ---------- Squat / single-leg ----------
  legpress: E('Leg Press', ['quads','glutes'], [], ['Feet shoulder-width, mid-platform.','Lower until just before your hips curl off the pad.','Push through the whole foot; don\'t slam into locked knees.'], ['hacksquat','backsquat','gobletsquat','dbsplit']),
  hacksquat: E('Hack Squat / Smith Squat', ['quads','glutes'], [], ['Back flat on pad, feet slightly forward.','Sink deep with control, knees track over toes.','Drive up smoothly, keep tension.'], ['legpress','backsquat','gobletsquat']),
  backsquat: E('Barbell Back Squat', ['quads','glutes'], ['core','upperBack'], ['Bar on upper back, brace your belly hard.','Sit down between your heels, knees follow toes.','Stand up keeping chest and hips rising together.'], ['legpress','hacksquat','gobletsquat'], { load: 'big' }),
  gobletsquat: E('Goblet Squat', ['quads','glutes'], ['core','upperBack'], ['Hold one dumbbell vertically at your chest.','Elbows inside knees at the bottom, chest tall.','Slow 2-3 s down, drive up.'], ['dbsplit','revlunge','bwsplitsquat']),
  bwsplitsquat: E('Bulgarian Split Squat (bodyweight)', ['quads','glutes'], ['core'], ['Rear foot on a couch/chair, front foot ~2 ft forward.','Drop the back knee straight down, slow 3 s lowering.','Too easy? Hold a backpack or pause 2 s at the bottom.'], ['revlunge','gobletsquat','dbsplit'], { perSide: true }),
  dbsplit: E('DB Bulgarian Split Squat', ['quads','glutes'], ['forearms'], ['Rear foot on a bench, dumbbells at your sides.','Slight forward lean = more glute; upright = more quad.','Control the descent, drive through the front heel.'], ['revlunge','gobletsquat','legpress'], { perSide: true }),
  revlunge: E('Reverse Lunge', ['quads','glutes'], ['core'], ['Step back, lower the back knee to just above the floor.','Front shin roughly vertical, torso tall.','Hold a backpack or dumbbells to progress.'], ['bwsplitsquat','dbsplit','gobletsquat'], { perSide: true }),
  // ---------- Hinge / hamstrings / glutes ----------
  rdl: E('Barbell Romanian Deadlift', ['hamstrings','glutes'], ['upperBack','forearms'], ['Soft knees, push hips straight back.','Bar slides along thighs; flat back the whole time.','Stop when hamstrings are fully stretched (around mid-shin).'], ['dbrdl','legcurl','hipthrust'], { load: 'big' }),
  dbrdl: E('Dumbbell Romanian Deadlift', ['hamstrings','glutes'], ['upperBack','forearms'], ['Dumbbells close to your legs, soft knees.','Hinge at the hips until a deep hamstring stretch.','Squeeze glutes to stand; never round your lower back.'], ['dbslrdl','rdl','slrdl']),
  slrdl: E('Single-Leg RDL (bodyweight / backpack)', ['hamstrings','glutes'], ['core'], ['Hinge on one leg, other leg reaches back.','Hips square to the floor; touch a wall for balance if needed.','Slow 3 s down; add a backpack when 12 reps is easy.'], ['slidecurl','slbridge','dbslrdl'], { perSide: true }),
  dbslrdl: E('DB Single-Leg RDL', ['hamstrings','glutes'], ['core','forearms'], ['Dumbbell in the hand opposite the standing leg.','Hinge until a strong hamstring stretch, hips square.','Stand tall by squeezing the glute.'], ['dbrdl','slrdl']),
  legcurl: E('Seated or Lying Leg Curl', ['hamstrings'], [], ['Seated version is slightly better (stretch under load).','Full range: all the way out, all the way in.','Slow 2-3 s on the way back.'], ['rdl','dbrdl','slidecurl']),
  slidecurl: E('Sliding Leg Curl (towel / socks)', ['hamstrings'], ['glutes'], ['Lie on your back, heels on a towel on a smooth floor.','Lift hips, slide heels out slowly, pull them back in.','Too hard? Only do the slow "slide out" part.'], ['slrdl','slbridge']),
  hipthrust: E('Hip Thrust (barbell or machine)', ['glutes'], ['hamstrings'], ['Upper back on bench, feet flat, shins vertical at top.','Tuck chin, ribs down, drive hips up and squeeze 1 s.','Don\'t arch your lower back to "finish" the rep.'], ['dbhipthrust','rdl','slbridge']),
  dbhipthrust: E('Dumbbell Hip Thrust', ['glutes'], ['hamstrings'], ['Upper back on a bench/couch, dumbbell on hips (use a towel).','Drive through heels, squeeze glutes hard at the top.','Pause 1 s, lower with control.'], ['slbridge','dbrdl']),
  slbridge: E('Single-Leg Hip Thrust', ['glutes'], ['hamstrings'], ['Upper back on couch, one foot planted.','Drive up through the heel, pause 2 s at top.','Easier: both feet on the floor.'], ['slrdl','dbhipthrust'], { perSide: true }),
  // ---------- Push ----------
  benchpress: E('Barbell Bench Press', ['chest','triceps'], ['frontDelts'], ['Shoulder blades pinched, feet planted.','Lower to lower chest, elbows ~45° from body.','Use safeties or a spotter when near failure.'], ['dbbench','machinechest','pushup'], { load: 'big' }),
  dbbench: E('Dumbbell Bench Press', ['chest','triceps'], ['frontDelts'], ['Shoulder blades back and down.','Lower until a good chest stretch, elbows ~45°.','Press up and slightly in.'], ['dbfloorpress','benchpress','pushup']),
  dbfloorpress: E('Dumbbell Floor Press', ['chest','triceps'], ['frontDelts'], ['Lie on the floor, knees bent (no bench needed).','Lower until upper arms touch the floor lightly.','Pause, then press.'], ['dbbench','pushup']),
  machinechest: E('Machine Chest Press', ['chest','triceps'], ['frontDelts'], ['Seat so handles line up with mid-chest.','Deep stretch, smooth press.','Great for safely training near failure.'], ['benchpress','dbbench','dips']),
  dips: E('Dip (assisted if needed)', ['chest','triceps'], ['frontDelts'], ['Slight forward lean for chest.','Lower until shoulders are just below elbows - only as deep as comfortable.','Use the assisted machine or band to hit the rep range.'], ['machinechest','dbbench','pushup']),
  pushup: E('Push-up', ['chest','triceps'], ['frontDelts','core'], ['Hands slightly wider than shoulders, body in a straight line.','Chest to an inch above the floor, elbows ~45°.','Too hard: hands on a counter. Too easy: feet elevated or backpack.'], ['declinepush','diamond','dbfloorpress']),
  inclinedb: E('Incline Dumbbell Press', ['chest','frontDelts'], ['triceps'], ['Bench at 30-45°.','Lower to upper chest with a full stretch.','Press up, don\'t clang the dumbbells.'], ['dbbench','machinechest','declinepush']),
  declinepush: E('Feet-Elevated Push-up', ['chest','frontDelts'], ['triceps','core'], ['Feet on a chair/couch, hands on floor.','Keep glutes tight, no sagging hips.','Easier: regular push-up.'], ['pushup','pikepush']),
  ohp: E('Seated Shoulder Press (DB or machine)', ['frontDelts','triceps'], ['sideDelts'], ['Back supported, core braced.','Lower to ear/chin height.','Press up and slightly back over your head.'], ['dbohp','inclinedb','pikepush']),
  dbohp: E('Dumbbell Overhead Press', ['frontDelts','triceps'], ['sideDelts','core'], ['Seated or standing, ribs down - don\'t lean back.','Lower to shoulder height, palms forward or neutral.','Press straight up.'], ['ohp','pikepush']),
  pikepush: E('Pike Push-up', ['frontDelts','triceps'], ['sideDelts','upperBack'], ['Hips high in an upside-down V.','Lower your head toward the floor in front of your hands.','Progress: feet on a chair.'], ['pushup','declinepush']),
  // ---------- Pull ----------
  pulldown: E('Lat Pulldown', ['lats'], ['biceps','upperBack','rearDelts'], ['Grip just outside shoulders, slight lean back.','Pull elbows down to your sides, bar to upper chest.','Full stretch at the top every rep.'], ['pullup','assistedpullup','dbrow1']),
  pullup: E('Pull-up / Chin-up', ['lats','biceps'], ['upperBack','forearms','core'], ['Start from a dead hang, pull chest toward the bar.','Chin-up (palms toward you) = more biceps.','Can\'t do 4? Do slow 5 s lowerings, or swap to inverted rows.'], ['assistedpullup','invrow','towelrow','pulldown']),
  assistedpullup: E('Pull-up (assisted if needed)', ['lats','biceps'], ['upperBack','forearms'], ['Use the assist machine or a band so you hit the rep range.','Pull elbows down to your ribs.','Reduce assistance as you get stronger.'], ['pulldown','pullup','dbrow1']),
  dbrow1: E('One-Arm Dumbbell Row', ['lats','upperBack'], ['biceps','rearDelts','forearms'], ['Hand and knee on a bench (or hand on a chair).','Pull the dumbbell toward your hip, not your armpit.','Full stretch at the bottom.'], ['dbcsrow','dbpullover','pulldown'], { perSide: true }),
  dbpullover: E('Dumbbell Pullover', ['lats'], ['chest','triceps'], ['Lie across or along a bench, one DB held over chest.','Arc it back behind your head with slightly bent elbows.','Feel the lats stretch, then pull back over chest.'], ['dbrow1','dbcsrow']),
  csrow: E('Chest-Supported Row (machine/T-bar)', ['upperBack','lats'], ['rearDelts','biceps'], ['Chest stays on the pad - no swinging.','Drive elbows back, squeeze shoulder blades.','Let shoulders stretch forward at the bottom.'], ['cablerow','dbcsrow','invrow']),
  cablerow: E('Seated Cable Row', ['upperBack','lats'], ['rearDelts','biceps'], ['Tall chest, slight knee bend.','Pull handle to your belly, elbows back.','Reach forward for a stretch without rounding.'], ['csrow','dbcsrow']),
  dbcsrow: E('Chest-Supported DB Row', ['upperBack','lats'], ['rearDelts','biceps'], ['Lie face-down on an incline bench (or hinge over with flat back).','Row both dumbbells, squeeze 1 s.','Lower slowly to a full stretch.'], ['dbrow1','invrow']),
  invrow: E('Inverted Row (sturdy table / bar)', ['upperBack','lats'], ['biceps','rearDelts'], ['Lie under a sturdy table or low bar, grip the edge.','Body straight, pull chest up to it.','Harder: walk feet forward or elevate them.'], ['towelrow','pullup','dbcsrow']),
  towelrow: E('Door-Towel Row', ['upperBack','lats'], ['biceps','rearDelts','forearms'], ['Loop a towel around both handles of a closed, sturdy door (pull it shut toward you).','Lean back with straight body, pull chest to door.','Walk feet closer to the door to make it harder.'], ['invrow','pullup']),
  // ---------- Delts ----------
  latraise: E('Lateral Raise (cable or DB)', ['sideDelts'], [], ['Slight forward lean, lead with elbows.','Raise to shoulder height, pinkies not higher than thumbs.','Light weight, strict, slow lowering.'], ['dblatraise','bandlatraise']),
  dblatraise: E('Dumbbell Lateral Raise', ['sideDelts'], [], ['Raise out to the sides to shoulder height.','Think "push the dumbbells out to the walls".','2-3 s lowering; no swinging.'], ['latraise','bandlatraise']),
  bandlatraise: E('Lateral Raise (band / water jugs)', ['sideDelts'], [], ['Use a resistance band under your foot, or water jugs/backpack.','Raise arms to shoulder height, elbows slightly bent.','Go slow - light load is fine taken near failure.'], ['dblatraise','pikepush']),
  reardelt: E('Reverse Pec-Deck or Face Pull', ['rearDelts'], ['upperBack'], ['Arms wide, move from the shoulder not the elbow.','Squeeze for 1 s, light weight.','Face pull: rope to forehead, elbows high.'], ['dbreardelt','proneyt']),
  dbreardelt: E('Dumbbell Rear-Delt Fly', ['rearDelts'], ['upperBack'], ['Chest on incline bench or hinge forward with flat back.','Swing arms out wide, pinkies leading.','Light weights, strict.'], ['reardelt','proneyt']),
  proneyt: E('Prone Y-T Raise', ['rearDelts','upperBack'], [], ['Lie face down, thumbs up.','Raise arms into a "Y", lower, then a "T" = 1 rep.','Hold light water bottles to progress.'], ['dbreardelt','invrow']),
  // ---------- Arms ----------
  curl: E('Cable or EZ-Bar Curl', ['biceps'], ['forearms'], ['Elbows pinned at your sides.','Full stretch at the bottom, squeeze at top.','No body swing.'], ['dbcurl','hammer']),
  dbcurl: E('Incline Dumbbell Curl', ['biceps'], ['forearms'], ['Lean back on a 45-60° bench (or stand).','Let arms hang straight down for a big stretch.','Curl up, lower slowly.'], ['hammer','curl','towelcurl']),
  hammer: E('Hammer Curl', ['biceps','forearms'], [], ['Palms face each other.','Elbows still, curl to shoulder.','Great for grip & forearms too.'], ['dbcurl','curl']),
  towelcurl: E('Backpack / Towel Curl', ['biceps'], ['forearms'], ['Curl a loaded backpack, or step on a towel and curl it against your own resistance.','Slow 3 s lowering.','Chin-ups also train biceps hard.'], ['pullup','invrow']),
  pushdown: E('Overhead Cable Triceps Extension', ['triceps'], [], ['Face away from the cable, rope behind head.','Big stretch behind your head, extend fully.','Elbows stay pointing forward.'], ['dbskull','dips']),
  dbskull: E('DB Overhead Triceps Extension', ['triceps'], [], ['Hold one dumbbell with both hands overhead.','Lower behind your head for a deep stretch.','Extend fully, elbows in.'], ['pushdown','diamond']),
  diamond: E('Close-Grip Push-up', ['triceps'], ['chest','frontDelts'], ['Hands under shoulders, elbows brush your ribs.','Body straight, chest to near floor.','Easier: hands on a counter.'], ['pushup','pikepush']),
  // ---------- Calves ----------
  calf: E('Standing Calf Raise (machine/Smith)', ['calves'], [], ['Balls of feet on the edge, heels hang low.','Pause 1-2 s in the deep stretch.','Rise all the way up, no bouncing.'], ['dbcalf','bwcalf']),
  dbcalf: E('Single-Leg DB Calf Raise (on a step)', ['calves'], ['forearms'], ['Hold DB in one hand, other hand on a wall.','Heel all the way down, pause 2 s.','Up onto the big toe, squeeze.'], ['calf','bwcalf'], { perSide: true }),
  bwcalf: E('Single-Leg Calf Raise (on a step)', ['calves'], [], ['Ball of foot on a stair, hand on the rail.','Full stretch down with a 2 s pause.','Hold a backpack when 20 reps is easy.'], ['dbcalf'], { perSide: true }),
  // ---------- Core / grip ----------
  cablecrunch: E('Cable Crunch', ['core'], [], ['Kneel, rope by your head.','Curl ribs toward hips - round your spine on purpose.','Hips stay still.'], ['hkr','deadbug']),
  hkr: E('Hanging Knee Raise', ['core'], ['forearms'], ['Hang from a bar, no swinging.','Curl pelvis up - knees toward chest.','Harder: straight legs.'], ['cablecrunch','deadbug']),
  deadbug: E('Dead Bug', ['core'], [], ['On your back, low back pressed into the floor.','Slowly extend opposite arm and leg, exhale.','Hold a light weight to progress.'], ['plank','hkr']),
  plank: E('Plank (RKC-style)', ['core'], ['frontDelts'], ['Forearms down, squeeze glutes and quads hard.','Pull elbows toward toes - make it brutal, not long.','Log seconds.'], ['deadbug','hkr'], { unit: 'sec' }),
  farmer: E('Farmer Carry', ['forearms','core'], ['upperBack'], ['Heavy dumbbells at your sides, stand tall.','Short quick steps, shoulders down.','Log seconds walked.'], ['suitcase','hammer'], { unit: 'sec' }),
  suitcase: E('Suitcase Carry (jug / backpack / bag)', ['forearms','core'], ['upperBack'], ['Heavy bag/jug in ONE hand, don\'t lean.','Walk slowly, switch hands each set (or each lap).','Log seconds per hand.'], ['farmer','plank'], { unit: 'sec', perSide: true })
};

/* Slot = one exercise position in a workout; variant per equipment mode. */
const S = (gym, db, bw, sets, reps, rest, extra) => Object.assign({ v: { gym, db, bw }, sets, reps, rest }, extra || {});
window.WORKOUTS = {
  A: { title: 'Workout A', focus: 'Squat · Horizontal push · Vertical pull', slots: [
    S('legpress', 'gobletsquat', 'bwsplitsquat', 3, [8, 12], 120),
    S('benchpress', 'dbbench', 'pushup', 3, [6, 10], 120, { bwReps: [6, 20] }),
    S('pulldown', 'dbrow1', 'pullup', 3, [8, 12], 120, { bwReps: [4, 12] }),
    S('legcurl', 'dbslrdl', 'slidecurl', 2, [8, 12], 90),
    S('latraise', 'dblatraise', 'bandlatraise', 2, [12, 20], 60, { ss: 'A1' }),
    S('calf', 'dbcalf', 'bwcalf', 2, [10, 15], 60, { ss: 'A1' }),
    S('cablecrunch', 'deadbug', 'deadbug', 2, [8, 15], 60)
  ]},
  B: { title: 'Workout B', focus: 'Hinge · Overhead press · Row · Arms', slots: [
    S('rdl', 'dbrdl', 'slrdl', 3, [6, 10], 150, { bwReps: [8, 15] }),
    S('ohp', 'dbohp', 'pikepush', 3, [6, 10], 120, { bwReps: [5, 15] }),
    S('csrow', 'dbcsrow', 'invrow', 3, [8, 12], 120, { bwReps: [6, 15] }),
    S('inclinedb', 'inclinedb', 'declinepush', 2, [8, 12], 90, { bwReps: [6, 20] }),
    S('curl', 'dbcurl', 'towelcurl', 2, [8, 15], 60, { ss: 'B1' }),
    S('pushdown', 'dbskull', 'diamond', 2, [8, 15], 60, { ss: 'B1', bwReps: [6, 20] }),
    S('hkr', 'plank', 'plank', 2, [8, 15], 60, { dbReps: [20, 45], bwReps: [20, 45] })
  ]},
  C: { title: 'Workout C', focus: 'Single-leg · Glutes · Pull-up · Dips', slots: [
    S('dbsplit', 'dbsplit', 'revlunge', 2, [8, 12], 90),
    S('assistedpullup', 'dbpullover', 'pullup', 3, [6, 12], 120, { bwReps: [4, 12] }),
    S('dips', 'dbfloorpress', 'pushup', 3, [6, 12], 120, { bwReps: [6, 20] }),
    S('hipthrust', 'dbhipthrust', 'slbridge', 3, [8, 12], 120, { bwReps: [10, 20] }),
    S('reardelt', 'dbreardelt', 'proneyt', 2, [12, 20], 60, { ss: 'C1' }),
    S('dblatraise', 'dblatraise', 'bandlatraise', 2, [12, 20], 60, { ss: 'C1' }),
    S('calf', 'dbcalf', 'bwcalf', 2, [10, 15], 60),
    S('farmer', 'farmer', 'suitcase', 2, [30, 45], 60)
  ]}
};

window.WARMUP = [
  '2-3 min easy cardio: brisk walk, bike, or marching in place',
  '10 arm circles each way + 10 band pull-aparts or scap push-ups',
  '10 bodyweight squats + 10 hip hinges (good-mornings)',
  '5 leg swings each leg (front-back & side-side)',
  'Before the first exercise: 1-2 ramp-up sets (≈50% × 8, ≈75% × 3). These don\'t count.'
];
