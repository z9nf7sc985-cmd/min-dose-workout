/* MinDose v3 - cheap meals, supplements, natural & herbal. All prices are ROUGH estimates; protein grams are approximate (check your labels). */
window.FUEL = {
  goals: {
    lose: { label: 'Lose fat', carbs: '1 cupped hand (about 1/2 cup cooked) of rice/potato/oats per meal; skip the extra snack on rest days', fats: '1 thumb of peanut butter/oil per meal', extra: 'Fill half your container with frozen veg. Keep protein high so you hold on to muscle.' },
    maintain: { label: 'Maintain', carbs: '1-2 cupped hands (about 3/4-1 cup cooked) of rice/potato/oats per meal', fats: '1-2 thumbs of peanut butter/oil per meal', extra: 'Eat the plan as written; adjust if your weight drifts over 2-3 weeks.' },
    build: { label: 'Build muscle', carbs: '2 cupped hands (about 1-1.5 cups cooked) of rice/potato/oats per meal', fats: '2 thumbs of peanut butter/oil per meal', extra: 'Add the "builder snack" every day: tortilla + 2 tbsp peanut butter + banana + a glass of milk.' }
  },
  proteinFoods: [
    ['3 eggs', 18], ['1 can tuna or chicken (drained)', 20], ['1 cup Greek yogurt', 17], ['4 oz cooked chicken thigh', 25],
    ['1 cup cooked lentils/beans', 16], ['1 cup milk', 8], ['2 tbsp peanut butter', 7], ['1/2 cup dry oats', 5]
  ],
  plan: [
    { d: 'Sun', type: 'prep', meals: [['Breakfast', 'Eggs + tortilla + banana'], ['Lunch', 'Leftovers / rice & beans'], ['Batch prep (60-90 min)', 'Sheet-pan chicken & potatoes, rice & lentils pot, 5 overnight-oats jars, a dozen boiled eggs'], ['Dinner', 'Sheet-pan chicken + potatoes + veg']] },
    { d: 'Mon', type: 'workout', w: 'A', meals: [['Breakfast (grab & go)', 'Overnight oats: oats + milk + PB + banana'], ['Lunch (car OK, no reheat)', 'Chicken, rice & bean burrito (good cold)'], ['Before/after workout', 'Banana + 2 boiled eggs'], ['Dinner', 'Sheet-pan chicken + potatoes + frozen veg']] },
    { d: 'Tue', type: 'rest', meals: [['Breakfast', 'Overnight oats (smaller scoop of oats)'], ['Lunch (car OK)', 'Tuna-yogurt wrap + baby carrots or a bag of frozen-then-thawed veg'], ['Snack', 'Greek yogurt + a spoon of PB'], ['Dinner', 'Lentil & rice bowl + 2 eggs + extra veg']] },
    { d: 'Wed', type: 'workout', w: 'B', meals: [['Breakfast (grab & go)', 'Overnight oats + banana'], ['Lunch (car OK)', 'Rice, lentil & chicken bowl (eat cold or room temp)'], ['Before/after workout', 'Tortilla + PB + banana'], ['Dinner', 'Chicken thighs + potatoes + veg']] },
    { d: 'Thu', type: 'rest', meals: [['Breakfast', '3 boiled eggs + tortilla'], ['Lunch (car OK)', 'Chicken-yogurt wrap + an apple or banana'], ['Snack', 'Glass of milk or Greek yogurt'], ['Dinner', 'Bean & rice burrito bowl + veg']] },
    { d: 'Fri', type: 'workout', w: 'C', meals: [['Breakfast (grab & go)', 'Overnight oats + banana'], ['Lunch (car OK)', 'Tuna & rice bowl with hot sauce'], ['Before/after workout', 'Greek yogurt + banana + oats sprinkle'], ['Dinner', 'Potato-egg hash (potatoes, eggs, veg)']] },
    { d: 'Sat', type: 'rest', meals: [['Breakfast', 'Egg scramble + tortilla'], ['Lunch', 'Use up leftovers'], ['Snack', 'PB on a tortilla'], ['Dinner', 'Lentil soup / chili with rice']] }
  ],
  dayNotes: { workout: 'Workout day: slightly more carbs - keep the banana/oats/potato around your workout.', rest: 'Rest day: same protein, a little less rice/potato, more veg. Walk.', prep: 'Prep day: cook once, eat all week.' },
  grocery: [
    { s: 'Protein', cost: '$14-20', items: ['Eggs - 2 dozen', 'Chicken thighs - about 3 lb (bone-in is cheapest)', 'Canned tuna - 4 cans', 'Canned chicken - 1-2 cans (optional)'] },
    { s: 'Dairy', cost: '$6-9', items: ['Milk - 1 gallon (or shelf-stable)', 'Plain Greek yogurt - 32 oz tub'] },
    { s: 'Pantry', cost: '$9-13', items: ['Rolled oats - large canister (lasts 2+ weeks)', 'Rice - 2-5 lb bag (lasts weeks)', 'Dry lentils or beans - 1-2 lb (or 4 cans)', 'Peanut butter - 1 jar', 'Tortillas - 10-pack', 'Salt, pepper, chili powder, hot sauce (one-time)'] },
    { s: 'Produce', cost: '$6-8', items: ['Bananas - 7-10', 'Potatoes - 5 lb bag', 'Onions - 2-3', 'Baby carrots or apples (optional)'] },
    { s: 'Frozen', cost: '$4-6', items: ['Mixed vegetables - 2 bags', 'Spinach or broccoli - 1 bag'] }
  ],
  groceryTotal: 'About $40-55 per week (roughly $6-8/day). Rough estimate only - prices vary a lot by store, region and season. Rice, oats, PB and spices last more than a week, so later weeks are often cheaper.',
  recipes: [
    { n: 'Sheet-pan chicken & potatoes', y: '4-5 meals', steps: ['Oven 425°F. Cube 2 lb potatoes; toss with oil, salt, pepper, chili powder.', 'Add about 3 lb chicken thighs to the pan, season the same.', 'Bake 35-45 min until chicken reaches 165°F inside.', 'Add a bag of frozen veg for the last 15 min. Portion into containers.'] },
    { n: 'Big pot rice & lentils', y: '6-8 servings', steps: ['Rinse 2 cups rice and 1 cup lentils.', 'Simmer with 6 cups water, salt, chopped onion and chili powder ~25 min, lid on.', 'Cool fast (spread on a tray), refrigerate within 2 hours.', 'Use for burritos and bowls all week.'] },
    { n: 'Overnight oats (5 jars)', y: '5 breakfasts', steps: ['Per jar: 1/2 cup oats + 3/4 cup milk + 1/4 cup Greek yogurt + 1 tbsp PB.', 'Stir, lid on, fridge overnight.', 'Add a banana in the morning. Eat cold - no reheating.'] },
    { n: 'Boiled eggs (dozen)', y: '12 eggs', steps: ['Cover eggs with water, bring to a boil.', 'Lid on, heat off, wait 10-12 min.', 'Move to cold water, then fridge. Good about a week in the shell.'] },
    { n: 'Tuna or chicken-yogurt wraps', y: '4 wraps', steps: ['Mix 2 cans drained tuna/chicken with 1/2 cup Greek yogurt, salt, pepper, hot sauce.', 'Spread on tortillas, add spinach or chopped onion.', 'Roll tightly in foil. Eat cold within 1-2 days.'] }
  ],
  snacks: ['Banana + peanut butter tortilla roll', 'Boiled eggs (pre-peeled, in a container)', 'Greek yogurt cup with oats', 'Single-serve tuna pouch', 'A handful of peanuts or trail mix', 'Shelf-stable milk box', 'Apple or carrots'],
  carSafety: 'Car food safety: keep perishables (chicken, eggs, yogurt, milk, tuna once opened) in an insulated bag with an ice pack. Don\'t leave them out of the cold more than 2 hours - or 1 hour if it\'s above 90°F (car cabins get much hotter). When in doubt, throw it out.',
  allergy: 'Allergy / medical note: this plan uses eggs, milk, peanuts, wheat (tortillas) and fish. Swap freely (e.g. sunflower butter, lactose-free milk, corn tortillas). If you have kidney disease, diabetes, food allergies, an eating disorder history, or take medications, check with your doctor or a registered dietitian before changing your diet.',
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
        ['Omega-3 fish oil', 'Heat can make fish oil go rancid - keep it cool. Canned sardines or salmon a couple of times a week is a cheap food alternative.'],
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
