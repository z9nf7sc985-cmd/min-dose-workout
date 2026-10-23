/* MinDose v2 — zero-equipment program.
   Modes: 'home' (Living room: floor + bodyweight, optional sturdy chair/couch) and
          'car'  (seated only, parked with the engine off).
   Coverage credit: primary muscle = 1 set, secondary = 0.5 set. */
window.MUSCLES = [
  ['chest','Chest'],['lats','Lats'],['upperBack','Upper back'],
  ['frontDelts','Front delts'],['sideDelts','Side delts'],['rearDelts','Rear delts'],
  ['biceps','Biceps'],['triceps','Triceps'],['quads','Quads'],['hamstrings','Hamstrings'],
  ['glutes','Glutes'],['calves','Calves'],['core','Core'],['forearms','Forearms / grip']
];
window.TARGET = { min: 4, max: 10 };
window.MODES = { home: 'Living room', car: 'Car' };

const H = ['home'], C = ['car'], HC = ['home', 'car'];
const E = (name, modes, p, s, cues, swaps, extra) => Object.assign({ name, modes, p, s, cues, swaps }, extra || {});
const ISO = 'Isometric: push/pull at ~90-100% effort the whole hold, breathe steadily (don\'t hold your breath).';

window.EX = {
  // ================= LIVING ROOM =================
  // --- Quads / glutes ---
  splitsquat: E('Bulgarian Split Squat (rear foot on couch)', H, ['quads','glutes'], ['core'],
    ['Rear foot on a couch/chair, front foot ~2 ft forward.','Lower for 3 s until the back knee nearly touches the floor.','Drive up through the front foot. Touch a wall for balance if needed.'],
    ['revlunge','couchsquat','tempsquat'], { perSide: true, harder: 'Pause 2 s at the bottom and use a 4-5 s lowering, then progress to Single-Leg Sit-to-Stand / Shrimp Squat.' }),
  revlunge: E('Reverse Lunge (slow)', H, ['quads','glutes'], ['core'],
    ['Step back, lower the back knee to just above the floor in 3 s.','Front shin roughly vertical, torso tall.','Easier version of the split squat.'],
    ['splitsquat','tempsquat'], { perSide: true, harder: 'Rear-foot-elevated split squat.' }),
  tempsquat: E('Tempo Squat (4 s down, 2 s pause)', H, ['quads','glutes'], [],
    ['Feet shoulder-width, sit down for a slow 4 count.','Pause 2 s at the bottom, stay tight.','Stand up fast. Easiest leg option.'],
    ['revlunge','splitsquat','wallsit'], { harder: 'Bulgarian split squat.' }),
  couchsquat: E('Single-Leg Sit-to-Stand (couch)', H, ['quads','glutes'], ['core'],
    ['Sit on the front edge of a couch/chair, one foot planted, the other foot lifted.','Stand up on one leg without rocking, lower back down over 3-4 s.','Too hard? Use a higher seat or a light fingertip assist.'],
    ['splitsquat','shrimp','tempsquat'], { perSide: true, harder: 'Use a lower seat, then Shrimp Squats.' }),
  shrimp: E('Shrimp Squat (assisted)', H, ['quads','glutes'], ['core'],
    ['Stand on one leg, hold the other foot behind you.','Lower until the back knee touches a cushion, fingertips on a chair for balance.','Advanced - use only after sit-to-stands are easy.'],
    ['couchsquat','splitsquat'], { perSide: true }),
  wallsit: E('Wall Sit', H, ['quads'], ['glutes'],
    ['Back flat on a wall, thighs parallel to the floor.','Push your lower back into the wall.','Make it harder: lift one heel, or go single-leg.'],
    ['tempsquat','splitsquat'], { unit: 'sec' }),
  // --- Glutes / hamstrings ---
  slhipthrust: E('Single-Leg Hip Thrust (shoulders on couch)', H, ['glutes'], ['hamstrings'],
    ['Upper back on the couch edge, one foot planted, shin vertical at the top.','Tuck chin, ribs down, drive the hip up and squeeze 2 s.','Easier: both feet down (glute bridge).'],
    ['glutebridge','walkout'], { perSide: true, harder: 'Add a 3 s lowering and a 3 s squeeze at the top.' }),
  glutebridge: E('Glute Bridge (2 s squeeze)', H, ['glutes'], ['hamstrings'],
    ['On your back, knees bent, feet flat.','Drive hips up, squeeze glutes hard 2 s.','Lower slowly.'],
    ['slhipthrust','walkout'], { harder: 'Single-leg hip thrust.' }),
  slidecurl: E('Sliding Leg Curl (socks on smooth floor)', H, ['hamstrings'], ['glutes'],
    ['On your back, heels in socks on a hard, smooth floor.','Lift hips, slowly slide heels out (3-4 s) and pull them back in.','Too hard? Do only the slow slide-out and walk your feet back.'],
    ['walkout','nordic','glutebridge'], { harder: 'Single-leg sliding curls, or keep hips higher the whole time.' }),
  walkout: E('Hamstring Bridge Walkout', H, ['hamstrings'], ['glutes'],
    ['Start in a glute bridge.','Walk heels out in small steps until legs are almost straight, keep hips up.','Walk back in = 1 rep. Carpet-friendly alternative to sliding curls.'],
    ['slidecurl','glutebridge'], { harder: 'Hold the farthest point 3 s each rep.' }),
  nordic: E('Nordic Curl Negative (feet under couch)', H, ['hamstrings'], ['glutes'],
    ['Kneel on a cushion, heels hooked under a HEAVY couch (it must not tip).','Hips straight, lower your torso forward as slowly as you can.','Catch yourself with your hands, push back up. Very hard - start with 3-5 reps.'],
    ['slidecurl','walkout'], { note: 'Optional: only if you have a heavy couch that won\'t move.' }),
  calfraise: E('Single-Leg Calf Raise (stair or floor)', HC.slice(0,1), ['calves'], [],
    ['Ball of foot on a stair edge (or flat floor), fingertips on a wall.','Heel all the way down, pause 2 s in the stretch.','Rise as high as possible, 1 s squeeze.'],
    ['tempsquat'], { perSide: true, harder: 'Add a 3 s lowering and a pause at the top.' }),
  // --- Chest / front delts / triceps ---
  inclinepush: E('Incline Push-up (hands on couch)', H, ['chest','triceps'], ['frontDelts','core'],
    ['Hands on a sturdy couch/chair seat, body straight.','Lower chest to the edge in 2-3 s.','Easiest push-up; move to floor push-ups when 20 is easy.'],
    ['pushup','palmpress'], { harder: 'Floor push-up.' }),
  pushup: E('Push-up', H, ['chest','triceps'], ['frontDelts','core'],
    ['Hands slightly wider than shoulders, body in one line.','Lower in 3 s to an inch off the floor, elbows ~45°.','Too hard: Incline push-up. 20+ easy: feet-elevated.'],
    ['inclinepush','declinepush','archer','palmpress'], { harder: 'Feet-elevated push-up, then archer push-up.' }),
  declinepush: E('Feet-Elevated Push-up (feet on couch)', H, ['chest','frontDelts'], ['triceps','core'],
    ['Feet on a couch/chair, hands on the floor.','Glutes tight, no sagging hips.','Slow 3 s lowering.'],
    ['pushup','archer','pikepush'], { harder: 'Archer push-up.' }),
  archer: E('Archer Push-up', H, ['chest','triceps'], ['frontDelts','core'],
    ['Very wide hands; lower toward one hand while the other arm straightens.','Alternate sides.','Hardest push-up here.'],
    ['declinepush','pushup'], { perSide: true }),
  palmpress: E('Palm Press Isometric', HC, ['chest'], ['frontDelts','triceps'],
    ['Palms together in front of your chest, elbows out.', 'Squeeze the palms together as hard as you can.', ISO],
    ['pushup','c_seatpush'], { unit: 'sec' }),
  pikepush: E('Pike Push-up', H, ['frontDelts','triceps'], ['sideDelts','upperBack'],
    ['Hips high in an upside-down V.','Lower your head toward the floor in front of your hands in 3 s.','Press back up.'],
    ['elevpike','declinepush'], { harder: 'Elevated pike push-up (feet on couch).' }),
  elevpike: E('Elevated Pike Push-up (feet on couch)', H, ['frontDelts','triceps'], ['sideDelts','upperBack'],
    ['Feet on a couch, hips stacked high over your shoulders.','Head lowers to the floor between hands.','Very hard - use after 15 pike push-ups are easy.'],
    ['pikepush'], {}),
  sphinx: E('Sphinx Push-up', H, ['triceps'], ['chest'],
    ['Plank on your forearms.','Press through your palms to straighten the elbows, lifting forearms off the floor.','Lower back to forearms slowly. Easier: from knees.'],
    ['diamond','c_seatpush'], { harder: 'Move hands farther forward.' }),
  diamond: E('Close-Grip Push-up', H, ['triceps'], ['chest','frontDelts'],
    ['Hands under shoulders, elbows brush your ribs.','Body straight, chest near the floor.','Easier: hands on the couch.'],
    ['sphinx','pushup'], {}),
  // --- Back / rear delts ---
  srrow: E('Self-Resisted One-Arm Row', HC, ['upperBack','lats'], ['biceps','rearDelts','forearms'],
    ['Elbow bent 90° in front of you; your other hand grips that wrist.','Pull the elbow back hard while the other hand resists - let it move slowly (~4 s) to the end range.','Then resist on the way back. Make every rep feel like a hard 8-12-rep set.'],
    ['floorpull','supermanpull','c_elbowdrive'], { perSide: true, harder: 'Push harder with the resisting hand; add a 3 s squeeze at the end.' }),
  floorpull: E('Prone Floor Slide Pull', H, ['lats'], ['upperBack','biceps','core'],
    ['Lie face down on a hard, smooth floor in a sweatshirt, arms overhead, palms down.','Press hands/forearms into the floor and pull your body forward until hands reach your shoulders.','Slide back, repeat. Too easy? Do it on carpet or with slower reps.'],
    ['supermanpull','srrow'], { harder: 'Do them on a higher-friction surface or pause 2 s at the end.' }),
  supermanpull: E('Superman Pulldown (prone lat pull)', H, ['lats','upperBack'], ['rearDelts'],
    ['Lie face down, chest and arms lifted, arms overhead.','Pull elbows down to your ribs as if doing a pull-up, squeeze back 2 s.','Reach back overhead; keep chest up the whole set.'],
    ['floorpull','ytw','srrow'], { harder: '3 s squeeze and pull your hands against each other.' }),
  ytw: E('Prone Y-T-W Raise', H, ['rearDelts','upperBack'], [],
    ['Lie face down, thumbs up.','Raise arms into a Y, lower; T, lower; W, lower = 1 rep.','Lift with shoulder blades, not your lower back.'],
    ['snowangel','srpullapart'], { harder: 'Hold each letter 2 s.' }),
  snowangel: E('Reverse Snow Angel', H, ['rearDelts','upperBack'], ['lats'],
    ['Lie face down, arms by your sides, hands hovering.','Sweep arms in a wide arc overhead and back - never touching the floor.','Slow 3 s each way.'],
    ['ytw','supermanpull'], {}),
  srpullapart: E('Hand-Pull Isometric (pull-apart)', HC, ['rearDelts','upperBack'], [],
    ['Hook fingers of both hands together at chest height, elbows high.','Pull outward as hard as you can, squeezing shoulder blades together.', ISO],
    ['ytw','srrow'], { unit: 'sec' }),
  // --- Side delts ---
  walllat: E('Wall Lateral Press (isometric)', H, ['sideDelts'], [],
    ['Stand side-on to a wall, elbow bent 90°, arm by your side.','Press the outside of your elbow/forearm into the wall as if doing a lateral raise.', ISO],
    ['srlat'], { unit: 'sec', perSide: true }),
  srlat: E('Self-Resisted Lateral Raise', HC, ['sideDelts'], [],
    ['Elbow slightly bent, arm by your side; reach across and press your other hand on the outside of that arm near the elbow.','Raise the arm out to the side while the other hand resists - slow, ~4 s up and down.','Stop around shoulder height (or as high as your other hand can still resist).'],
    ['walllat'], { perSide: true }),
  // --- Arms ---
  legcurl: E('Leg-Resisted Biceps Curl', HC, ['biceps'], ['forearms'],
    ['Sit on a couch/seat edge, clasp hands under one thigh near the knee.','Curl the leg up toward your chest with your arms while the leg pushes down against you.','Slow 3 s down. Your leg sets the resistance - make it a hard set.'],
    ['srcurl'], { perSide: true }),
  srcurl: E('Self-Resisted Curl', HC, ['biceps'], ['forearms'],
    ['Make a fist, palm up. Other hand presses down on that wrist.','Curl up against the resistance over ~4 s, then resist on the way down.','Switch arms (the pressing arm also works triceps).'],
    ['legcurl'], { perSide: true }),
  // --- Core / grip ---
  deadbug: E('Dead Bug', H, ['core'], [],
    ['On your back, low back pressed into the floor.','Slowly extend opposite arm and leg, exhale fully.','Return and switch sides.'],
    ['hollow','revcrunch'], { perSide: true }),
  hollow: E('Hollow Body Hold', H, ['core'], [],
    ['Low back glued to the floor, arms and legs extended and lifted.','Easier: bend knees / arms by sides.','Stop when your back starts to arch.'],
    ['deadbug','revcrunch'], { unit: 'sec' }),
  revcrunch: E('Reverse Crunch', H, ['core'], [],
    ['On your back, knees bent 90°.','Curl hips off the floor toward your ribs, slow 3 s down.','No swinging.'],
    ['deadbug','hollow'], {}),
  fingerplank: E('Fingertip Plank', H, ['forearms'], ['core','chest'],
    ['High plank on your fingertips (or knees + fingertips).','Fingers spread and strong, body straight.','Stop if fingers or wrists hurt.'],
    ['fistsqueeze'], { unit: 'sec' }),
  fistsqueeze: E('Max Fist Squeeze + Finger Spread', HC, ['forearms'], [],
    ['Squeeze both fists as hard as possible for the hold.','Then spread fingers wide against the other hand for 10 s.','Works grip without any tool.'],
    ['fingerplank'], { unit: 'sec' }),

  // ================= CAR (parked, engine off) =================
  c_seatpush: E('Seat Push-Down (triceps)', C, ['triceps'], ['chest','frontDelts'],
    ['Hands flat on the seat beside your hips, elbows slightly bent.','Push straight down as if lifting your body off the seat.', ISO],
    ['palmpress'], { unit: 'sec' }),
  c_elbowdrive: E('Elbow-Drive Lat Isometric', C, ['lats'], ['upperBack'],
    ['Sit tall, elbows bent at your sides.','Drive both elbows down and back into the seat back/sides as hard as you can, chest proud.', ISO],
    ['srrow','srpullapart'], { unit: 'sec' }),
  c_ohp: E('Self-Resisted Overhead Press', C, ['frontDelts','triceps'], ['sideDelts'],
    ['One hand at shoulder height, palm up; the other hand pushes down on it.','Press up overhead over ~4 s while resisting (stop before the roof).','Alternative: if you can reach the roof with bent arms, press palms up into it (isometric).'],
    ['palmpress'], { perSide: true }),
  c_ankles: E('Crossed-Ankle Push-Pull', C, ['quads','hamstrings'], [],
    ['Seat back a little, cross ankles with feet off the pedals.','Front leg kicks forward (quads) while back leg pulls back (hamstrings) - nothing moves.', ISO + ' Switch legs = one set.'],
    ['c_kneeext','c_heeldig'], { unit: 'sec', perSide: true }),
  c_kneeext: E('Seated Knee Extension (self-resisted)', C, ['quads'], [],
    ['Extend one knee straight, toes up, squeeze the thigh 2 s.','Harder: press the other foot down on that shin while you extend.','Slow 3 s down.'],
    ['c_ankles'], { perSide: true }),
  c_heeldig: E('Heel-Dig Hamstring Isometric', C, ['hamstrings'], ['glutes'],
    ['Feet flat, knees bent ~90°.','Dig heels down and pull them back toward the seat as hard as you can.', ISO],
    ['c_ankles'], { unit: 'sec' }),
  c_glute: E('Glute Squeeze + Hip Press', C, ['glutes'], [],
    ['Squeeze both glutes as hard as you can, pressing hips into the seat.','You should rise slightly in the seat.', ISO],
    ['c_abduct'], { unit: 'sec' }),
  c_abduct: E('Seated Knees-Out Isometric', C, ['glutes'], [],
    ['Hands on the outsides of your knees.','Push knees out against your hands as hard as you can (side glutes).', ISO],
    ['c_glute'], { unit: 'sec' }),
  c_calf: E('Seated Calf Raise (hands press knees)', C, ['calves'], [],
    ['Feet flat, hands pressing down on your knees for resistance.','Rise onto the balls of your feet, squeeze 2 s, lower slowly.','Do one leg at a time with both hands for more resistance.'],
    [], {}),
  c_brace: E('Seated Ab Brace Crunch', C, ['core'], [],
    ['Hands on knees; crunch ribs toward pelvis and push hands into knees.','Brace like you\'re about to be punched.', ISO],
    ['c_kneelift','c_vacuum'], { unit: 'sec' }),
  c_kneelift: E('Seated Knee Lift', C, ['core'], ['quads'],
    ['Sit tall, hands lightly on the seat edges.','Lift both knees toward your chest (or one at a time), slow down.','Harder: hold 2 s at the top.'],
    ['c_brace'], {}),
  c_vacuum: E('Stomach Vacuum', C, ['core'], [],
    ['Exhale everything, then pull your belly button in toward your spine.','Hold while breathing shallowly.','Trains the deep core; pairs well with bracing.'],
    ['c_brace'], { unit: 'sec' }),
  c_neck: E('Neck Isometrics (4 directions)', C, [], [],
    ['Hand on forehead: push head forward into it. Then back of head, then each side.','Gentle-to-moderate effort (50-70%), no movement, 10 s each direction.','Skip if you have neck problems.'],
    [], { unit: 'sec', bonus: 'Neck (bonus)' })
};
EX.calfraise.modes = H;

/* Workouts per mode. Slot: { ex, sets, reps:[lo,hi], rest(sec), ss } */
const S = (ex, sets, reps, rest, ss) => ({ ex, sets, reps, rest, ss });
window.WORKOUTS = {
  home: {
    A: { title: 'Workout A', focus: 'Legs (quad) · Push-ups · Rows · Hamstrings', slots: [
      S('splitsquat', 3, [8, 15], 90),
      S('pushup', 3, [6, 20], 90),
      S('srrow', 3, [6, 10], 60),
      S('slidecurl', 3, [6, 12], 90),
      S('ytw', 2, [8, 15], 45, 'A1'),
      S('calfraise', 2, [10, 20], 45, 'A1'),
      S('deadbug', 2, [6, 12], 45)
    ]},
    B: { title: 'Workout B', focus: 'Glutes · Shoulders · Lats · Arms', slots: [
      S('slhipthrust', 3, [8, 15], 60),
      S('pikepush', 3, [5, 15], 90),
      S('floorpull', 3, [6, 15], 90),
      S('sphinx', 2, [6, 15], 60, 'B1'),
      S('legcurl', 2, [6, 12], 60, 'B1'),
      S('walllat', 2, [15, 30], 45),
      S('hollow', 2, [15, 40], 45)
    ]},
    C: { title: 'Workout C', focus: 'Single-leg · Hamstrings · Chest · Back', slots: [
      S('couchsquat', 3, [6, 12], 90),
      S('walkout', 2, [6, 10], 90),
      S('declinepush', 3, [6, 20], 90),
      S('supermanpull', 3, [8, 15], 60),
      S('srlat', 2, [6, 10], 45, 'C1'),
      S('snowangel', 2, [8, 15], 45, 'C1'),
      S('calfraise', 2, [10, 20], 45),
      S('fingerplank', 2, [15, 30], 45)
    ]}
  },
  car: {
    A: { title: 'Car A', focus: 'Chest · Lats · Legs · Arms (seated)', slots: [
      S('palmpress', 3, [15, 30], 30),
      S('c_elbowdrive', 3, [15, 30], 30),
      S('c_ankles', 3, [15, 30], 30),
      S('c_calf', 2, [15, 30], 30),
      S('legcurl', 2, [6, 12], 30),
      S('c_seatpush', 2, [15, 30], 30),
      S('c_brace', 2, [15, 30], 30)
    ]},
    B: { title: 'Car B', focus: 'Shoulders · Upper back · Hamstrings · Glutes', slots: [
      S('c_ohp', 3, [6, 10], 30),
      S('srrow', 3, [6, 10], 30),
      S('c_heeldig', 3, [15, 30], 30),
      S('c_abduct', 2, [15, 30], 30),
      S('srlat', 3, [6, 10], 30),
      S('c_kneelift', 2, [10, 20], 30),
      S('fistsqueeze', 2, [20, 30], 30)
    ]},
    C: { title: 'Car C', focus: 'Rear delts · Quads · Glutes · Arms', slots: [
      S('c_seatpush', 2, [15, 30], 30),
      S('palmpress', 2, [15, 30], 30),
      S('srpullapart', 3, [15, 30], 30),
      S('c_elbowdrive', 2, [15, 30], 30),
      S('c_kneeext', 3, [10, 15], 30),
      S('c_glute', 2, [15, 30], 30),
      S('c_calf', 2, [15, 30], 30),
      S('srcurl', 2, [6, 10], 30),
      S('c_vacuum', 1, [15, 30], 30),
      S('c_neck', 1, [10, 10], 30)
    ]}
  }
};

window.WARMUP = {
  home: [
    '1-2 min marching or jogging in place',
    '10 arm circles each way + 10 slow scap push-ups',
    '10 bodyweight squats + 10 hip hinges (good-mornings)',
    '5 leg swings each leg (front-back & side-side)',
    'First exercise: 1 easy set of 5 to groove the movement (doesn\'t count)'
  ],
  car: [
    'PARK and turn the engine OFF. Seat back a little, phone down.',
    '10 shoulder rolls + 10 neck turns (slow, small range)',
    '10 ankle pumps + 10 seated knee lifts',
    'First hold of each exercise: start at ~50% effort for 5 s, then go hard'
  ]
};
window.COOLDOWN = {
  home: ['30 s easy walk around the room, slow breathing', 'Couch/hip-flexor stretch 30 s / side', 'Hamstring stretch (heel on couch) 30 s / side', 'Doorway or wall chest stretch 30 s', 'Child\'s pose 30 s'],
  car: ['Sit tall, 5 slow breaths (in 4 s, out 6 s)', 'Seated figure-4 glute stretch 20 s / side (if room)', 'Cross-body shoulder stretch 20 s / side', 'Gentle neck side-tilts 15 s / side', 'Wait a minute and make sure you feel normal before you drive']
};
/* v1 (equipment) exercises, kept only so old logs still count toward coverage */
window.LEGACY_EX = {"legpress":{"name":"Leg Press","p":["quads","glutes"],"s":[]},"hacksquat":{"name":"Hack Squat / Smith Squat","p":["quads","glutes"],"s":[]},"backsquat":{"name":"Barbell Back Squat","p":["quads","glutes"],"s":["core","upperBack"]},"gobletsquat":{"name":"Goblet Squat","p":["quads","glutes"],"s":["core","upperBack"]},"bwsplitsquat":{"name":"Bulgarian Split Squat (bodyweight)","p":["quads","glutes"],"s":["core"]},"dbsplit":{"name":"DB Bulgarian Split Squat","p":["quads","glutes"],"s":["forearms"]},"revlunge":{"name":"Reverse Lunge","p":["quads","glutes"],"s":["core"]},"rdl":{"name":"Barbell Romanian Deadlift","p":["hamstrings","glutes"],"s":["upperBack","forearms"]},"dbrdl":{"name":"Dumbbell Romanian Deadlift","p":["hamstrings","glutes"],"s":["upperBack","forearms"]},"slrdl":{"name":"Single-Leg RDL (bodyweight / backpack)","p":["hamstrings","glutes"],"s":["core"]},"dbslrdl":{"name":"DB Single-Leg RDL","p":["hamstrings","glutes"],"s":["core","forearms"]},"legcurl":{"name":"Seated or Lying Leg Curl","p":["hamstrings"],"s":[]},"slidecurl":{"name":"Sliding Leg Curl (towel / socks)","p":["hamstrings"],"s":["glutes"]},"hipthrust":{"name":"Hip Thrust (barbell or machine)","p":["glutes"],"s":["hamstrings"]},"dbhipthrust":{"name":"Dumbbell Hip Thrust","p":["glutes"],"s":["hamstrings"]},"slbridge":{"name":"Single-Leg Hip Thrust","p":["glutes"],"s":["hamstrings"]},"benchpress":{"name":"Barbell Bench Press","p":["chest","triceps"],"s":["frontDelts"]},"dbbench":{"name":"Dumbbell Bench Press","p":["chest","triceps"],"s":["frontDelts"]},"dbfloorpress":{"name":"Dumbbell Floor Press","p":["chest","triceps"],"s":["frontDelts"]},"machinechest":{"name":"Machine Chest Press","p":["chest","triceps"],"s":["frontDelts"]},"dips":{"name":"Dip (assisted if needed)","p":["chest","triceps"],"s":["frontDelts"]},"pushup":{"name":"Push-up","p":["chest","triceps"],"s":["frontDelts","core"]},"inclinedb":{"name":"Incline Dumbbell Press","p":["chest","frontDelts"],"s":["triceps"]},"declinepush":{"name":"Feet-Elevated Push-up","p":["chest","frontDelts"],"s":["triceps","core"]},"ohp":{"name":"Seated Shoulder Press (DB or machine)","p":["frontDelts","triceps"],"s":["sideDelts"]},"dbohp":{"name":"Dumbbell Overhead Press","p":["frontDelts","triceps"],"s":["sideDelts","core"]},"pikepush":{"name":"Pike Push-up","p":["frontDelts","triceps"],"s":["sideDelts","upperBack"]},"pulldown":{"name":"Lat Pulldown","p":["lats"],"s":["biceps","upperBack","rearDelts"]},"pullup":{"name":"Pull-up / Chin-up","p":["lats","biceps"],"s":["upperBack","forearms","core"]},"assistedpullup":{"name":"Pull-up (assisted if needed)","p":["lats","biceps"],"s":["upperBack","forearms"]},"dbrow1":{"name":"One-Arm Dumbbell Row","p":["lats","upperBack"],"s":["biceps","rearDelts","forearms"]},"dbpullover":{"name":"Dumbbell Pullover","p":["lats"],"s":["chest","triceps"]},"csrow":{"name":"Chest-Supported Row (machine/T-bar)","p":["upperBack","lats"],"s":["rearDelts","biceps"]},"cablerow":{"name":"Seated Cable Row","p":["upperBack","lats"],"s":["rearDelts","biceps"]},"dbcsrow":{"name":"Chest-Supported DB Row","p":["upperBack","lats"],"s":["rearDelts","biceps"]},"invrow":{"name":"Inverted Row (sturdy table / bar)","p":["upperBack","lats"],"s":["biceps","rearDelts"]},"towelrow":{"name":"Door-Towel Row","p":["upperBack","lats"],"s":["biceps","rearDelts","forearms"]},"latraise":{"name":"Lateral Raise (cable or DB)","p":["sideDelts"],"s":[]},"dblatraise":{"name":"Dumbbell Lateral Raise","p":["sideDelts"],"s":[]},"bandlatraise":{"name":"Lateral Raise (band / water jugs)","p":["sideDelts"],"s":[]},"reardelt":{"name":"Reverse Pec-Deck or Face Pull","p":["rearDelts"],"s":["upperBack"]},"dbreardelt":{"name":"Dumbbell Rear-Delt Fly","p":["rearDelts"],"s":["upperBack"]},"proneyt":{"name":"Prone Y-T Raise","p":["rearDelts","upperBack"],"s":[]},"curl":{"name":"Cable or EZ-Bar Curl","p":["biceps"],"s":["forearms"]},"dbcurl":{"name":"Incline Dumbbell Curl","p":["biceps"],"s":["forearms"]},"hammer":{"name":"Hammer Curl","p":["biceps","forearms"],"s":[]},"towelcurl":{"name":"Backpack / Towel Curl","p":["biceps"],"s":["forearms"]},"pushdown":{"name":"Overhead Cable Triceps Extension","p":["triceps"],"s":[]},"dbskull":{"name":"DB Overhead Triceps Extension","p":["triceps"],"s":[]},"diamond":{"name":"Close-Grip Push-up","p":["triceps"],"s":["chest","frontDelts"]},"calf":{"name":"Standing Calf Raise (machine/Smith)","p":["calves"],"s":[]},"dbcalf":{"name":"Single-Leg DB Calf Raise (on a step)","p":["calves"],"s":["forearms"]},"bwcalf":{"name":"Single-Leg Calf Raise (on a step)","p":["calves"],"s":[]},"cablecrunch":{"name":"Cable Crunch","p":["core"],"s":[]},"hkr":{"name":"Hanging Knee Raise","p":["core"],"s":["forearms"]},"deadbug":{"name":"Dead Bug","p":["core"],"s":[]},"plank":{"name":"Plank (RKC-style)","p":["core"],"s":["frontDelts"]},"farmer":{"name":"Farmer Carry","p":["forearms","core"],"s":["upperBack"]},"suitcase":{"name":"Suitcase Carry (jug / backpack / bag)","p":["forearms","core"],"s":["upperBack"]}};
