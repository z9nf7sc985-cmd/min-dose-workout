/* MinDose v4 - cheap SHELF-STABLE, NO-COOK car meals, supplements, natural & herbal.
   Everything here is shelf-stable and can live in a car (shaded) with no cooling and no cooking.
   All prices are ROUGH estimates; protein grams are approximate, from typical nutrition labels - check yours. */
window.FUEL = {
  headPills: ['~$5-8 / day*', 'Shelf-stable', 'No cooking', 'Car-pantry'],
  goals: {
    lose: { label: 'Lose fat', carbs: '1 carb item per meal: 1 ready rice cup OR 1 tortilla OR 1 instant-oatmeal packet (about 1/2 cup oats); fruit with breakfast', fats: '1 peanut-butter squeeze pack (or a small handful of nuts) per day, not per meal', extra: 'Build each meal around a protein pouch/can plus beans or canned veg. Keep protein high so you hold on to muscle.' },
    maintain: { label: 'Maintain', carbs: '1-2 carb items per meal (rice cup, tortilla, oatmeal packets, crackers or rice cakes)', fats: '1-2 PB squeeze packs or small handfuls of nuts/seeds per day', extra: 'Eat the plan as written; adjust if your weight drifts over 2-3 weeks.' },
    build: { label: 'Build muscle', carbs: '2 carb items per meal (e.g. 2 tortillas, or rice cup + crackers, or 2 oatmeal packets)', fats: '2-3 PB squeeze packs or handfuls of nuts/trail mix per day', extra: 'Add the "builder snack" every day: tortilla + PB squeeze pack + banana, with a UHT milk box or a protein-powder shake.' }
  },
  proteinFoods: [
    ['Tuna pouch (2.6 oz)', 17], ['Chicken pouch (2.6 oz)', 15], ['Salmon pouch (2.5 oz)', 14], ['Sardines, 1 can (3.75 oz)', 21],
    ['Chili with beans, 1 cup', 15], ['Canned beans, 1/2 cup', 7], ['Beef jerky, 1 oz', 9], ['Protein powder, 1 scoop', '20-25'],
    ['UHT milk box (8 oz) or 1/3 cup powdered milk', 8], ['PB squeeze pack (1.15 oz)', 7], ['Peanuts, 1 oz', 7], ['Instant oatmeal packet', 4], ['Flour tortilla (8")', 4]
  ],
  plan: [
    { d: 'Mon', type: 'workout', w: 'A', meals: [['Breakfast', 'Jar oats: oats + water + 2 Tbsp powdered milk + 1 scoop protein powder, shake, wait 10-15 min; + banana'], ['Lunch', 'Tuna-bean tortilla wrap + apple'], ['Before/after workout', 'Banana + PB squeeze pack + rice cake'], ['Dinner', 'Chicken pouch + ready rice cup bowl (room temp) + can of corn']] },
    { d: 'Tue', type: 'rest', meals: [['Breakfast', '1 instant-oatmeal packet in water + protein shake (powder + water)'], ['Lunch', 'Bean & salsa crackers + tuna pouch'], ['Snack', 'Jerky + raisins'], ['Dinner', 'Canned chili (eat as is) + crackers + canned green beans']] },
    { d: 'Wed', type: 'workout', w: 'B', meals: [['Breakfast', 'PB-banana-oat wrap + UHT milk box'], ['Lunch', 'Salmon pouch + ready rice cup + hot sauce packet'], ['Before/after workout', 'Rice cakes + PB squeeze pack + banana'], ['Dinner', 'Chili + ready rice cup']] },
    { d: 'Thu', type: 'rest', meals: [['Breakfast', 'Jar oats + protein powder (water-soaked)'], ['Lunch', 'Chicken pouch tortilla wrap + canned fruit cup'], ['Snack', 'Peanuts + raisins (no-chocolate trail mix)'], ['Dinner', 'Bean & salsa crackers + tuna pouch + canned green beans']] },
    { d: 'Fri', type: 'workout', w: 'C', meals: [['Breakfast', '2 instant-oatmeal packets in water + protein shake + orange'], ['Lunch', 'Tuna-bean tortilla wrap'], ['Before/after workout', 'Banana + rice cakes + PB squeeze pack'], ['Dinner', 'Chicken pouch + rice cup bowl + can of corn']] },
    { d: 'Sat', type: 'rest', meals: [['Breakfast', 'PB tortilla + UHT milk box'], ['Lunch', 'Sardines + crackers + applesauce pouch'], ['Snack', 'Jerky + trail mix (no chocolate)'], ['Dinner', 'Chili + crackers + canned veg']] },
    { d: 'Sun', type: 'restock', meals: [['Breakfast', 'Jar oats + protein powder + apple'], ['Lunch', 'Use up the oldest pouches/cans first'], ['Restock (15 min)', 'Check every can and pouch, toss damaged ones, buy fresh fruit, refill the car bin (see checklist)'], ['Dinner', 'Chicken pouch + rice cup + canned veg']] }
  ],
  dayNotes: { workout: 'Workout day: slightly more carbs - keep the banana, oats, rice cup or rice cakes around your workout.', rest: 'Rest day: same protein, a little less rice/oats/tortilla, more canned veg and fruit. Walk.', restock: 'Restock day: rotate your car pantry - oldest first.' },
  grocery: [
    { s: 'Protein pouches & cans', cost: '$13-18', items: ['Tuna pouches (light tuna) - 6', 'Chicken pouches - 4', 'Salmon pouches or sardine cans (pull-tab) - 2-3', 'Beef jerky - 1 small bag (optional, pricier)'] },
    { s: 'Beans & ready-to-eat cans', cost: '$5-7', items: ['Canned beans (black/pinto), low-sodium, pull-tab if possible - 3-4', 'Canned chili with beans - 2-3', 'Single-serve salsa cups or hot-sauce packets'] },
    { s: 'Grains & carbs', cost: '$8-10', items: ['Instant oatmeal packets or a canister of oats', 'Tortillas - 10-pack (check for mold after ~a week)', 'Ready rice cups (microwavable, eaten room temp) - 4-6', 'Rice cakes and/or whole-grain crackers'] },
    { s: 'Spreads, nuts & dried fruit', cost: '$5-7', items: ['Peanut-butter squeeze packs (or a jar)', 'Peanuts or sunflower seeds', 'Raisins or other dried fruit', 'Trail mix WITHOUT chocolate (it melts)'] },
    { s: 'Fruit & veg (shelf-stable)', cost: '$5-7', items: ['Bananas - 4-6 (eat within 2-3 days)', 'Apples or oranges - 4-6', 'Applesauce pouches', 'Canned corn / green beans (no-salt-added) and canned fruit cups'] },
    { s: 'Shelf-stable milk & protein', cost: '$5-8', items: ['Powdered milk or UHT (shelf-stable) milk boxes', 'Protein powder - weekly share of a tub (a tub lasts weeks)', 'Water - a case (keep it out of the sun)'] }
  ],
  groceryTotal: 'About $40-55 per week (roughly $6-8/day). Rough estimate only - prices vary a lot by store, region and season. Oats, protein powder, powdered milk and PB last more than a week, so later weeks are often cheaper.',
  pantry: ['Pull-tab cans/pouches (or a small manual can opener)', 'Spoon + fork, paper bowls, napkins', 'Wet wipes or hand sanitizer', 'Small trash bags', 'Sealable jar or shaker bottle (for oats and protein shakes)', 'Salt, pepper and hot-sauce packets', '2-3 days of backup protein pouches', 'Water bottles (shaded, under a seat)'],
  storage: [
    'Keep food in a closed bin or insulated bag under a seat or in the trunk, out of direct sun. The bag is only a heat shield - no ice or cooling needed.',
    'Hot cars wear food down over time: rotate weekly (oldest first), keep only a few days of stock on very hot weeks, and bring it inside on scorching days if you can.',
    'Throw away bulging, leaking, rusty or badly dented cans (especially dents on the seams) and puffy or torn pouches. When in doubt, throw it out.',
    'Once a can or pouch is opened, eat it in one sitting - no saving leftovers.',
    'Fresh fruit: bananas 2-3 days, apples and oranges about a week in the car.',
    'Water: keep bottles out of the sun and drink plenty, especially on workout days.',
    'Sodium watch: pouches, canned chili and jerky are salty. Pick low-sodium / no-salt-added beans and veg, and drink water. If you have high blood pressure or kidney issues, ask your doctor.',
    'Clean hands (wipes or sanitizer) before eating.'
  ],
  recipesTitle: '🥫 No-cook car "assembly" recipes',
  recipes: [
    { n: 'Tuna-bean tortilla wrap', y: '1 meal · ~30 g protein', steps: ['Open a tuna pouch and a small can of beans (or use half and eat the rest in the same sitting).', 'Spoon tuna + beans onto a tortilla; add a salsa cup or hot sauce.', 'Roll it up and eat right away.'] },
    { n: 'PB-banana-oat wrap', y: '1 meal · ~15 g protein', steps: ['Squeeze a PB pack onto a tortilla.', 'Add a sliced banana and a spoonful of dry oats or raisins.', 'Roll it up. Have it with a UHT milk box or protein shake for more protein.'] },
    { n: 'Chicken pouch + rice cup bowl', y: '1 meal · ~20 g protein', steps: ['Peel open a ready rice cup (fine at room temperature).', 'Mix in a chicken pouch and half a can of corn or green beans.', 'Season with salt/pepper or hot sauce. Eat the whole thing now.'] },
    { n: 'Water-soaked jar oats + protein', y: '1 breakfast · ~30 g protein', steps: ['In a jar: 1/2 cup oats (or an instant packet) + 1 scoop protein powder + 2 Tbsp powdered milk.', 'Add water, close, shake well.', 'Wait 10-15 min and eat. Mix it fresh - don\'t leave it sitting in a warm car for hours.'] },
    { n: 'Bean & salsa crackers', y: '1 meal · ~15 g protein (+ a tuna pouch for ~30 g)', steps: ['Open a can of beans and a salsa cup.', 'Mash a few beans with a fork, top crackers with beans + salsa.', 'Add a tuna or chicken pouch on the side for more protein.'] }
  ],
  snacks: ['Banana + PB squeeze pack', 'Beef jerky', 'Peanuts or no-chocolate trail mix', 'Tuna or chicken pouch with crackers', 'Rice cakes + PB', 'Applesauce pouch or canned fruit cup', 'Raisins / dried fruit', 'Protein powder + water in a shaker'],
  allergy: 'Allergy / medical note: this plan uses fish, peanuts, wheat/gluten (tortillas, crackers), milk (powdered/UHT milk, many protein powders) and possibly soy and tree nuts (trail mix, some powders). Dried fruit can contain sulfites. Swap freely - sunflower-seed butter, plant protein, corn tortillas or rice cakes. Mix your fish: light tuna, salmon and sardines are lower-mercury choices; go easy on albacore. Pouches, canned foods and jerky are high in sodium. If you have kidney disease, high blood pressure, diabetes, food allergies, an eating-disorder history, or take medications, check with your doctor or a registered dietitian before changing your diet.',
  supplements: {
    intro: 'Food first. These are simple helpers - none of them replace sleep, training and real meals.',
    faith: { text: 'What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own? For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God\'s.', ref: '1 Corinthians 6:19-20 (KJV)', note: 'Caring for your body with whole food, rest and honest work is a way of honoring it. Supplements are simple helpers, not shortcuts - and it\'s wise to steer clear of banned or questionable products.' },
    heat: 'Heat and sunlight break supplements down. Don\'t store them in the glovebox or on the dashboard - keep them sealed, shaded, and bring only what you need for the day.',
    tiers: [
      { t: 'Strong evidence', c: 'good', items: [
        ['Creatine monohydrate', '3-5 g a day, any time. The most-researched sports supplement and cheap. Mixes in water; no loading needed. Drink enough water. Ask a doctor first if you have kidney problems.'],
        ['Protein powder (only if food falls short)', 'Shelf-stable whey or plant powder is just convenient food. Use it only if you can\'t reach your protein target from meals.'],
        ['Vitamin D (if you\'re low)', 'Useful if you get little sun or a blood test shows you\'re low. Ask your doctor about testing and a sensible dose.'],
        ['Water + electrolytes', 'Most people do best simply drinking enough water. A pinch of salt or an electrolyte packet can help on hot or sweaty days.']
      ] },
      { t: 'Reasonable', c: 'ok', items: [
        ['Magnesium glycinate', 'May help sleep and relaxation if your diet is low in magnesium. Gentle on the stomach.'],
        ['Omega-3 fish oil', 'Heat makes fish oil go rancid, so capsules are a poor fit for a hot car. Sardine or salmon pouches/cans a couple of times a week are the cheap, car-friendly food alternative.'],
        ['Caffeine / coffee (optional)', 'A cup of coffee 30-60 min before training can help effort. Skip it late in the day so it doesn\'t hurt sleep.']
      ] },
      { t: 'Skip / not needed', c: 'skip', items: [
        ['Fat burners', 'Mostly caffeine plus marketing; some have contained banned stimulants.'],
        ['"Testosterone boosters"', 'Little to no evidence for healthy people; often proprietary blends.'],
        ['BCAAs', 'Not needed if you eat enough protein.'],
        ['Proprietary blends', 'You can\'t see the doses. If a label hides amounts, skip it.']
      ] }
    ]
  },
  herbal: {
    intro: 'Herbs can be gentle helpers. Effects are usually modest, and "natural" doesn\'t always mean safe with every medication.',
    tiers: [
      { t: 'Some evidence', c: 'ok', items: [
        ['Ginger', 'Tea bags or chews. Helps nausea; may modestly ease muscle soreness.'],
        ['Turmeric / curcumin', 'May modestly help soreness and joint comfort. Absorbs better with black pepper. Can interact with blood thinners - ask first if you take them.'],
        ['Tart cherry', 'Dried cherries or juice concentrate. Modest help for soreness and possibly sleep.'],
        ['Ashwagandha', 'Some evidence for stress and sleep, and a little strength data. Rare liver injury has been reported. Avoid with thyroid conditions or pregnancy, and check your medications.'],
        ['Chamomile tea', 'Mild help for relaxing and winding down before bed.'],
        ['Peppermint', 'Tea or candies can help digestion and an upset stomach.'],
        ['Green tea', 'Gentler caffeine than coffee.']
      ] },
      { t: 'Simple habit "remedies"', c: 'good', items: [
        ['Sleep 7-9 hours', 'Still the best recovery tool there is.'],
        ['Walking & stretching', 'Easy movement on rest days helps soreness.'],
        ['Sunlight', 'Morning light helps your sleep rhythm (and vitamin D).'],
        ['Water', 'Keep a bottle with you; pale-yellow urine is a good sign.'],
        ['Epsom salt bath', 'Can feel relaxing; evidence it does more than a warm bath is weak.'],
        ['Honey', 'A spoonful (or in tea) can soothe a sore throat. Not for babies under 1.']
      ] },
      { t: 'Skip / use caution', c: 'skip', items: [
        ['Unregulated "herbal blends"', 'Unknown contents and doses.'],
        ['High-dose St. John\'s Wort', 'Interacts with many medications (including birth control and antidepressants).'],
        ['Anything promising fast results', 'Real change takes weeks of training, food and sleep.']
      ] }
    ],
    warn: 'Herbs and supplements are not regulated like drugs in the US. Look for third-party testing seals such as USP or NSF. They can interact with medications - check with your doctor or pharmacist.'
  },
  kratom: {
    title: 'If you use kratom',
    intro: 'No judgment here - this is just practical info to help you stay safe while you train.',
    sections: [
      ['What it is', ['Kratom is not FDA-approved and is unregulated. Contents and strength vary from batch to batch.', '"Trainwreck"-style blends often mix several strains and sometimes other botanicals (for example kava or blue lotus), so the exact contents are unknown.', 'If you buy it, choose vendors that publish third-party lab tests (e.g. AKA GMP-qualified vendors) screening for adulterants, heavy metals and salmonella.']],
      ['Body & dependence', ['Regular daily use (especially more than once a day) can lead to tolerance, dependence and withdrawal.', 'If you ever want to cut back, taper gradually with a doctor\'s help rather than stopping cold turkey.', 'It can interact with medications (it affects liver enzymes that process many drugs).', 'Common side effects: constipation, dehydration and lower appetite - drink water and eat fiber (oats, beans, veg). Rare liver injury has been reported: yellow skin or eyes, dark urine or severe fatigue = see a doctor promptly.']],
      ['Never combine with', ['Alcohol, opioids, benzodiazepines, sleep aids or other sedatives. Mixing raises the risk of serious harm.']],
      ['Around workouts', ['Don\'t use it to mask pain or an injury - pain is information.', 'Train well-hydrated, and avoid hard exercise in the heat right after a dose.', 'If your heart races or you feel dizzy, stop and rest.', 'Never drive impaired.']],
      ['Storage', ['Capsules degrade in a hot car. Keep them sealed and shaded, not in the glovebox or on the dash.']],
      ['Help is available', ['SAMHSA National Helpline: 1-800-662-4357 - free, confidential, 24/7, if you ever want help cutting back.', 'Tell your doctor honestly about your use. It helps them prescribe safely.']]
    ],
    faith: 'You\'re taking a good step by caring for your body. Grace, not guilt - small steps count.'
  },
  disclaimer: 'Not medical advice. This is general information. Check with your doctor or pharmacist before starting any supplement or herb - especially if you take medications, are pregnant, or have a health condition.'
};
