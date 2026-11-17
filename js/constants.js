// ============================================
// Constants - Sound database and categories
// ============================================

export const SOUNDS = [
    // Allies Units
    { file: 'allies_1_achnoledged.wav', name: 'Acknowledged', category: 'allies', tags: ['iconic', 'voice', 'confirmation'] },
    { file: 'allies_1_affirmative.wav', name: 'Affirmative', category: 'allies', tags: ['iconic', 'voice', 'confirmation'] },
    { file: 'allies_1_reporting.wav', name: 'Reporting', category: 'allies', tags: ['voice', 'select'] },
    { file: 'allies_1_veicle_reporting.wav', name: 'Vehicle Reporting', category: 'allies', tags: ['voice', 'vehicle', 'select'] },
    { file: 'allies_1_waiting_orders.wav', name: 'Waiting Orders', category: 'allies', tags: ['voice', 'idle'] },
    { file: 'allies_1_yes_sir.wav', name: 'Yes Sir', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_achnoledged.wav', name: 'Acknowledged #2', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_affirmative.wav', name: 'Affirmative #2', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_agreed.wav', name: 'Agreed', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_as_you_wish.wav', name: 'As You Wish', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_at_once.wav', name: 'At Once', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_of_course.wav', name: 'Of Course', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_ready_and_waiting.wav', name: 'Ready & Waiting', category: 'allies', tags: ['voice', 'idle'] },
    { file: 'allies_2_reporting.wav', name: 'Reporting #2', category: 'allies', tags: ['voice', 'select'] },
    { file: 'allies_2_verry_well.wav', name: 'Very Well', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_2_waiting_orders.wav', name: 'Waiting Orders #2', category: 'allies', tags: ['voice', 'idle'] },
    { file: 'allies_2_yes_sir.wav', name: 'Yes Sir! #2', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_3_achnoledged.wav', name: 'Acknowledged #3', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_3_affirmative.wav', name: 'Affirmative #3', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_3_reporting.wav', name: 'Reporting #3', category: 'allies', tags: ['voice', 'select'] },
    { file: 'allies_3_veicle_reporting.wav', name: 'Vehicle Reporting #3', category: 'allies', tags: ['voice', 'vehicle', 'select'] },
    { file: 'allies_3_waiting_orders.wav', name: 'Waiting Orders #3', category: 'allies', tags: ['voice', 'idle'] },
    { file: 'allies_3_yes_sir.wav', name: 'Yes Sir! #3', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_achnoledged.wav', name: 'Acknowledged #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_affirmative.wav', name: 'Affirmative #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_agreed.wav', name: 'Agreed #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_as_you_wish.wav', name: 'As You Wish #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_at_once.wav', name: 'At Once #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_of_course.wav', name: 'Of Course #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_ready_and_waiting.wav', name: 'Ready & Waiting #4', category: 'allies', tags: ['voice', 'idle'] },
    { file: 'allies_4_reporting.wav', name: 'Reporting #4', category: 'allies', tags: ['voice', 'select'] },
    { file: 'allies_4_very_well.wav', name: 'Very Well #4', category: 'allies', tags: ['voice', 'confirmation'] },
    { file: 'allies_4_waiting_orders.wav', name: 'Waiting Orders #4', category: 'allies', tags: ['voice', 'idle'] },
    { file: 'allies_4_yes_sir.wav', name: 'Yes Sir! #4', category: 'allies', tags: ['voice', 'confirmation'] },

    // Soviet Units
    { file: 'soviet_1_achnoledged.wav', name: 'Acknowledged', category: 'soviets', tags: ['iconic', 'voice', 'confirmation', 'russian'] },
    { file: 'soviet_1_affirmative.wav', name: 'Affirmative', category: 'soviets', tags: ['iconic', 'voice', 'confirmation', 'russian'] },
    { file: 'soviet_1_reporting.wav', name: 'Reporting', category: 'soviets', tags: ['voice', 'select', 'russian'] },
    { file: 'soviet_1_veicle_reporting.wav', name: 'Vehicle Reporting', category: 'soviets', tags: ['voice', 'vehicle', 'select', 'russian'] },
    { file: 'soviet_1_waiting_orders.wav', name: 'Waiting Orders', category: 'soviets', tags: ['voice', 'idle', 'russian'] },
    { file: 'soviet_1_yes_sir.wav', name: 'Yes Sir', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_achnoledged.wav', name: 'Acknowledged #2', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_affirmative.wav', name: 'Affirmative #2', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_agreed.wav', name: 'Agreed', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_as_you_wish.wav', name: 'As You Wish', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_at_once.wav', name: 'At Once', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_of_course.wav', name: 'Of Course', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_ready_and_waiting.wav', name: 'Ready & Waiting', category: 'soviets', tags: ['voice', 'idle', 'russian'] },
    { file: 'soviet_2_reporting.wav', name: 'Reporting #2', category: 'soviets', tags: ['voice', 'select', 'russian'] },
    { file: 'soviet_2_very_well.wav', name: 'Very Well', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_2_waiting_orders.wav', name: 'Waiting Orders #2', category: 'soviets', tags: ['voice', 'idle', 'russian'] },
    { file: 'soviet_2_yes_sir.wav', name: 'Yes Sir #2', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_3_achnoledged.wav', name: 'Acknowledged #3', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_3_affirmative.wav', name: 'Affirmative #3', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_3_comrad.wav', name: 'Reporting #3', category: 'soviets', tags: ['voice', 'select', 'russian'] },
    { file: 'soviet_3_reporting.wav', name: 'Comrade', category: 'soviets', tags: ['voice', 'select', 'russian'] },
    { file: 'soviet_3_waiting_orders.wav', name: 'Waiting Orders #3', category: 'soviets', tags: ['voice', 'idle', 'russian'] },
    { file: 'soviet_3_yes_sir.wav', name: 'Yes Sir #3', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_4_affirmative.wav', name: 'Affirmative #4', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_4_at_once.wav', name: 'At Once #4', category: 'soviets', tags: ['voice', 'confirmation', 'russian'] },
    { file: 'soviet_4_ready_and_waiting.wav', name: 'Ready & Waiting #4', category: 'soviets', tags: ['voice', 'idle', 'russian'] },

    // Tanya
    { file: 'tanya_yeah.wav', name: 'Yeah', category: 'tanya', tags: ['voice', 'confirmation'] },
    { file: 'tanya_yes_sir.wav', name: 'Yes Sir', category: 'tanya', tags: ['voice', 'confirmation'] },
    { file: 'tanya_chew_on_this.wav', name: 'Chew On This', category: 'tanya', tags: ['iconic', 'voice', 'action', 'attack'] },
    { file: 'tanya_give_it_to_me.wav', name: 'Give It To Me', category: 'tanya', tags: ['voice', 'action'] },
    { file: 'tanya_im_there.wav', name: "I'm There", category: 'tanya', tags: ['voice', 'movement'] },
    { file: 'tanya_kiss_it_bye_bye.wav', name: 'Kiss It Bye Bye', category: 'tanya', tags: ['iconic', 'voice', 'attack'] },
    { file: 'tanya_laugh.wav', name: 'Laugh', category: 'tanya', tags: ['iconic', 'voice', 'funny', 'meme'] },
    { file: 'tanya_lets_rock.wav', name: "Let's Rock", category: 'tanya', tags: ['iconic', 'voice', 'action'] },
    { file: 'tanya_shake_it_baby.wav', name: 'Shake It Baby', category: 'tanya', tags: ['iconic', 'voice', 'funny', 'meme'] },
    { file: 'tanya_thats_all_you_got.wav', name: "That's All You Got", category: 'tanya', tags: ['voice', 'taunt'] },
    { file: 'tanya_whats_up.wav', name: "What's Up", category: 'tanya', tags: ['voice', 'greeting'] },
    { file: 'tanya_chaching.wav', name: 'Cha-Ching', category: 'tanya', tags: ['voice', 'funny'] },
    { file: 'tanya_dart.wav', name: 'Dart Shot', category: 'tanya', tags: ['sfx', 'weapon'] },
    { file: 'tanya_death.wav', name: 'Death', category: 'tanya', tags: ['sfx', 'death', 'scream'] },
    { file: 'tanya_silenced_shoot.wav', name: 'Silenced Shot', category: 'tanya', tags: ['sfx', 'weapon'] },

    // Engineer
    { file: 'engineer_affermative.wav', name: 'Affirmative', category: 'special', tags: ['voice', 'confirmation', 'infantry'] },
    { file: 'engineer_engineering.wav', name: 'Engineering', category: 'special', tags: ['voice', 'action', 'repair', 'capture', 'infantry'] },
    { file: 'engineer_movin_out.wav', name: "Movin' Out", category: 'special', tags: ['voice', 'movement', 'infantry'] },
    { file: 'engineer_yes_sir.wav', name: 'Yes Sir', category: 'special', tags: ['voice', 'confirmation', 'infantry'] },

    // Medic
    { file: 'medic_affermative.wav', name: 'Medic Affirmative', category: 'special', tags: ['voice', 'confirmation', 'doctor', 'infantry'] },
    { file: 'medic_movin_out.wav', name: "Medic Movin' Out", category: 'special', tags: ['voice', 'movement', 'doctor', 'infantry'] },
    { file: 'medic_reporting.wav', name: 'Medic Reporting', category: 'special', tags: ['voice', 'select', 'doctor', 'infantry'] },
    { file: 'medic_yes_sir.wav', name: 'Medic Yes Sir', category: 'special', tags: ['voice', 'confirmation', 'doctor', 'infantry'] },
    { file: 'medic_heal_sound.wav', name: 'Medic Heal', category: 'special', tags: ['sfx', 'healing', 'health', 'doctor'] },

    // Spy
    { file: 'spy_commander.wav', name: 'Spy Commander', category: 'special', tags: ['voice', 'select', 'agent', 'british', 'infantry'] },
    { file: 'spy_for_king_and_country.wav', name: 'For King & Country', category: 'special', tags: ['voice', 'confirmation', 'agent', 'british', 'infantry'] },
    { file: 'spy_indeed.wav', name: 'Spy Indeed', category: 'special', tags: ['voice', 'confirmation', 'agent', 'british', 'infantry'] },
    { file: 'spy_on_my_way.wav', name: 'Spy On My Way', category: 'special', tags: ['voice', 'movement', 'agent', 'british', 'infantry'] },
    { file: 'spy_yes_sir.wav', name: 'Spy Yes Sir', category: 'special', tags: ['voice', 'confirmation', 'agent', 'british', 'infantry'] },

    // Thief
    { file: 'thief_what.wav', name: 'Thief What', category: 'special', tags: ['voice', 'select', 'steal', 'robber', 'infantry'] },
    { file: 'thief_affermative.wav', name: 'Thief Affirmative', category: 'special', tags: ['voice', 'confirmation', 'steal', 'robber', 'infantry'] },
    { file: 'thief_movin_out.wav', name: "Thief Movin' Out", category: 'special', tags: ['voice', 'movement', 'steal', 'robber', 'infantry'] },
    { file: 'thief_yeah.wav', name: 'Thief Yeah', category: 'special', tags: ['voice', 'confirmation', 'steal', 'robber', 'infantry'] },
    { file: 'thief_ok.wav', name: 'Thief OK', category: 'special', tags: ['voice', 'confirmation', 'steal', 'robber', 'infantry'] },

    // Einstein
    { file: 'einstein_ah.wav', name: 'Einstein Ah', category: 'special', tags: ['voice', 'scientist', 'professor'] },
    { file: 'einstein_yes.wav', name: 'Einstein Yes', category: 'special', tags: ['voice', 'confirmation', 'scientist', 'professor'] },
    { file: 'einstein_incredible.wav', name: 'Einstein Incredible', category: 'special', tags: ['voice', 'amazed', 'scientist', 'professor'] },

    // Civilians
    { file: 'civilian_ok.wav', name: 'Civilian OK', category: 'civilians', tags: ['voice', 'confirmation', 'villager'] },
    { file: 'civilian_yeah.wav', name: 'Civilian Yeah', category: 'civilians', tags: ['voice', 'confirmation', 'villager'] },
    { file: 'girl_ok.wav', name: 'Girl OK', category: 'civilians', tags: ['voice', 'confirmation', 'villager', 'woman', 'female'] },
    { file: 'girl_yeah.wav', name: 'Girl Yeah', category: 'civilians', tags: ['voice', 'confirmation', 'villager', 'woman', 'female'] },

    // Dogs
    { file: 'dog_angry.wav', name: 'Dog Angry', category: 'dogs', tags: ['sfx', 'animal', 'bark', 'growl', 'attack'] },
    { file: 'dog_angry_2.wav', name: 'Dog Angry #2', category: 'dogs', tags: ['sfx', 'animal', 'bark', 'growl', 'attack'] },
    { file: 'dog_die.wav', name: 'Dog Die', category: 'dogs', tags: ['sfx', 'animal', 'death', 'yelp', 'whimper'] },
    { file: 'dog_suffering.wav', name: 'Dog Suffering', category: 'dogs', tags: ['sfx', 'animal', 'pain', 'yelp', 'whimper'] },
    { file: 'dog_wouf.wav', name: 'Dog Woof', category: 'dogs', tags: ['sfx', 'animal', 'bark'] },
    { file: 'dog_wouf_2.wav', name: 'Dog Woof #2', category: 'dogs', tags: ['sfx', 'animal', 'bark'] },

    // Combat - Infantry Weapons
    { file: 'minigunner_shot.wav', name: 'Minigunner', category: 'combat', tags: ['sfx', 'weapon', 'gunfire', 'rifle', 'infantry'] },
    { file: 'pistol_1.wav', name: 'Pistol 1', category: 'combat', tags: ['sfx', 'weapon', 'gunfire', 'handgun'] },
    { file: 'pistol_2.wav', name: 'Pistol 2', category: 'combat', tags: ['sfx', 'weapon', 'gunfire', 'handgun'] },
    { file: 'rapid_shoot.wav', name: 'Rapid Fire', category: 'combat', tags: ['sfx', 'weapon', 'gunfire', 'machine gun', 'automatic'] },
    { file: 'ranger_firing_sound.wav', name: 'Ranger Fire', category: 'combat', tags: ['sfx', 'weapon', 'gunfire', 'machine gun', 'jeep'] },
    { file: 'flame_sound_1.wav', name: 'Flame #1', category: 'combat', tags: ['sfx', 'weapon', 'fire', 'flamethrower', 'burn'] },
    { file: 'flame_sound_2.wav', name: 'Flame #2', category: 'combat', tags: ['sfx', 'weapon', 'fire', 'flamethrower', 'burn'] },

    // Combat - Explosives
    { file: 'explosion.wav', name: 'Explosion', category: 'combat', tags: ['iconic', 'sfx', 'destruction', 'boom', 'blast', 'bomb', 'nuke'] },
    { file: 'explosion2.wav', name: 'Explosion #2', category: 'combat', tags: ['sfx', 'destruction', 'boom', 'blast', 'bomb', 'nuke'] },
    { file: 'water_explosion.wav', name: 'Water Explosion', category: 'combat', tags: ['sfx', 'destruction', 'naval', 'boom', 'splash', 'depth charge'] },
    { file: 'antiman_mine.wav', name: 'Anti-Personnel Mine', category: 'combat', tags: ['sfx', 'explosion', 'explosive', 'landmine', 'boom', 'blast'] },
    { file: 'antitank_mine.wav', name: 'Anti-Tank Mine', category: 'combat', tags: ['sfx', 'explosion', 'explosive', 'landmine', 'boom', 'blast'] },
    { file: 'mine_placed.wav', name: 'Mine Placed', category: 'combat', tags: ['sfx', 'explosive', 'landmine', 'minelayer'] },

    // Combat - Missiles
    { file: 'air_to_air_missile.wav', name: 'Air-to-Air Missile', category: 'combat', tags: ['sfx', 'weapon', 'rocket', 'launch', 'aircraft'] },
    { file: 'ground_to_air_missile_shot.wav', name: 'Ground-to-Air Missile', category: 'combat', tags: ['sfx', 'weapon', 'rocket', 'launch', 'anti-air'] },
    { file: 'missile_in_water.wav', name: 'Missile in Water', category: 'combat', tags: ['sfx', 'weapon', 'rocket', 'naval', 'splash'] },
    { file: 'cruiser_missile.wav', name: 'Cruiser Missile', category: 'combat', tags: ['sfx', 'weapon', 'rocket', 'naval', 'ship'] },
    { file: 'torpedoes.wav', name: 'Torpedoes', category: 'combat', tags: ['sfx', 'weapon', 'naval', 'submarine', 'underwater'] },

    // Vehicles
    { file: 'light_tank_gun.wav', name: 'Light Tank', category: 'vehicles', tags: ['sfx', 'weapon', 'vehicle', 'cannon', 'shot'] },
    { file: 'mammoth_tank_gun.wav', name: 'Mammoth Tank', category: 'vehicles', tags: ['sfx', 'weapon', 'vehicle', 'cannon', 'heavy', 'soviet'] },
    { file: 'artillery.wav', name: 'Artillery', category: 'vehicles', tags: ['sfx', 'weapon', 'vehicle', 'cannon', 'shell'] },
    { file: 'cruiser_8_inch_cannon.wav', name: 'Cruiser Cannon', category: 'vehicles', tags: ['sfx', 'weapon', 'naval', 'ship', 'artillery'] },
    { file: 'destroyer_shot.wav', name: 'Destroyer', category: 'vehicles', tags: ['sfx', 'weapon', 'naval', 'ship', 'cannon'] },
    { file: 'sub_uncloaking.wav', name: 'Sub Uncloaking', category: 'vehicles', tags: ['sfx', 'naval', 'submarine', 'stealth', 'surface'] },
    { file: 'paratroops.wav', name: 'Paratroops', category: 'vehicles', tags: ['sfx', 'aircraft', 'plane', 'parachute', 'airdrop', 'reinforcements'] },

    // Buildings & Structures
    { file: 'building_being_placed.wav', name: 'Building Placed', category: 'buildings', tags: ['iconic', 'sfx', 'construction'] },
    { file: 'building_placement_sound.wav', name: 'Placement Sound', category: 'buildings', tags: ['sfx', 'construction', 'build'] },
    { file: 'building_destroyed.wav', name: 'Building Destroyed', category: 'buildings', tags: ['sfx', 'destruction', 'explosion', 'collapse'] },
    { file: 'building_half_destroyed.wav', name: 'Building Damaged', category: 'buildings', tags: ['sfx', 'destruction', 'hit', 'crumble'] },
    { file: 'power_up.wav', name: 'Power Up', category: 'buildings', tags: ['sfx', 'electric', 'energy', 'online'] },
    { file: 'power_down.wav', name: 'Power Down', category: 'buildings', tags: ['sfx', 'electric', 'energy', 'offline', 'low power'] },
    { file: 'selling.wav', name: 'Selling', category: 'buildings', tags: ['sfx', 'money', 'cash', 'credits', 'sell'] },

    // Turrets & Defenses
    { file: 'solid_turret.wav', name: 'Turret', category: 'buildings', tags: ['sfx', 'weapon', 'defense', 'cannon', 'gun'] },
    { file: 'pillbox_shot.wav', name: 'Pillbox', category: 'buildings', tags: ['sfx', 'weapon', 'defense', 'gunfire', 'bunker'] },
    { file: 'flame_turret_up.wav', name: 'Flame Turret Up', category: 'buildings', tags: ['sfx', 'defense', 'fire', 'flamethrower'] },
    { file: 'flame_turret_down.wav', name: 'Flame Turret Down', category: 'buildings', tags: ['sfx', 'defense', 'fire', 'flamethrower'] },
    { file: 'tesla_charge.wav', name: 'Tesla Charge', category: 'buildings', tags: ['iconic', 'sfx', 'electric', 'defense'] },
    { file: 'tesla_shot.wav', name: 'Tesla Shot', category: 'buildings', tags: ['iconic', 'sfx', 'electric', 'defense'] },

    // Walls & Barriers
    { file: 'wall_hit.wav', name: 'Wall Hit', category: 'buildings', tags: ['sfx', 'destruction', 'damage', 'impact'] },
    { file: 'wall_down.wav', name: 'Wall Down', category: 'buildings', tags: ['sfx', 'destruction', 'collapse'] },
    { file: 'wall_crumbling.wav', name: 'Wall Crumbling', category: 'buildings', tags: ['sfx', 'destruction', 'collapse', 'rubble'] },
    { file: 'fence_over.wav', name: 'Fence Over', category: 'buildings', tags: ['sfx', 'destruction', 'crush', 'barrier'] },
    { file: 'barrier_over.wav', name: 'Barrier Over', category: 'buildings', tags: ['sfx', 'destruction', 'crush', 'fence'] },

    // Deaths
    { file: 'man_die_1.wav', name: 'Death #1', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_2.wav', name: 'Death #2', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_3.wav', name: 'Death #3', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_4.wav', name: 'Death #4', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_5.wav', name: 'Death #5', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_6.wav', name: 'Death #6', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_7.wav', name: 'Death #7', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_8.wav', name: 'Death #8', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_die_9.wav', name: 'Death #9', category: 'deaths', tags: ['sfx', 'scream', 'pain', 'dying', 'casualty', 'infantry'] },
    { file: 'man_being_squashed.wav', name: 'Squashed', category: 'deaths', tags: ['sfx', 'death', 'scream', 'crush', 'casualty', 'infantry'] },

    // UI & Map Sounds
    { file: 'alarm.wav', name: 'Alarm', category: 'ui', tags: ['sfx', 'alert', 'warning', 'siren', 'klaxon'] },
    { file: 'radar_map_alert.wav', name: 'Radar Alert', category: 'ui', tags: ['sfx', 'warning', 'beep'] },
    { file: 'radar_map_power_on.wav', name: 'Radar Power On', category: 'ui', tags: ['sfx', 'startup', 'online', 'beep'] },
    { file: 'sonar_pulse.wav', name: 'Sonar Pulse', category: 'ui', tags: ['sfx', 'naval', 'submarine', 'ping', 'detect'] },
    { file: 'credit_in.wav', name: 'Credit In', category: 'ui', tags: ['sfx', 'money', 'cash', 'credits', 'income'] },
    { file: 'credit_out.wav', name: 'Credit Out', category: 'ui', tags: ['sfx', 'money', 'cash', 'credits', 'spend'] },
    { file: 'map_sound_2.wav', name: 'Map Sound #2', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'map_sound_4.wav', name: 'Map Sound #4', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'map_sound_5.wav', name: 'Map Sound #5', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'map_sound_7.wav', name: 'Map Sound #7', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'map_sound_8.wav', name: 'Map Sound #8', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'map_sound_9.wav', name: 'Map Sound #9', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'map_wipe_2.wav', name: 'Map Wipe 2', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign', 'transition'] },
    { file: 'map_wipe_5.wav', name: 'Map Wipe 5', category: 'ui', tags: ['sfx', 'menu', 'interface', 'campaign', 'transition'] },
    { file: 'briefing.wav', name: 'Briefing', category: 'ui', tags: ['sfx', 'menu', 'interface', 'mission'] },
    { file: 'keystroke.wav', name: 'Keystroke', category: 'ui', tags: ['sfx', 'menu', 'interface', 'typing', 'keyboard', 'click'] },

    // Misc / Special Effects
    { file: 'chronosphere_sound.wav', name: 'Chronosphere', category: 'misc', tags: ['iconic', 'superweapon', 'sfx', 'allies'] },
    { file: 'iron_curtain_sound.wav', name: 'Iron Curtain', category: 'misc', tags: ['iconic', 'superweapon', 'sfx', 'soviet'] },
    { file: 'appear_1.wav', name: 'Appear', category: 'misc', tags: ['sfx', 'interface', 'transition'] },
    { file: 'clock_1.wav', name: 'Clock', category: 'misc', tags: ['sfx', 'interface', 'tick', 'timer', 'countdown'] },
    { file: 'country_1.wav', name: 'Country 1', category: 'misc', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'country_4.wav', name: 'Country 4', category: 'misc', tags: ['sfx', 'menu', 'interface', 'campaign'] },
    { file: 'scold1.wav', name: 'Scold', category: 'misc', tags: ['sfx', 'interface', 'error', 'buzz'] },
    { file: 'sfx_4.wav', name: 'SFX 4', category: 'misc', tags: ['sfx', 'interface'] },
    { file: 'beepy6.wav', name: 'Beep', category: 'misc', tags: ['sfx', 'interface', 'blip', 'click'] },
    { file: 'bleep11.wav', name: 'Bleep 11', category: 'misc', tags: ['sfx', 'interface', 'beep', 'blip'] },
    { file: 'bleep17.wav', name: 'Bleep 17', category: 'misc', tags: ['sfx', 'interface', 'beep', 'blip'] },
    { file: 'toney4.wav', name: 'Tone 4', category: 'misc', tags: ['sfx', 'interface', 'beep', 'chime'] },
    { file: 'toney7.wav', name: 'Tone 7', category: 'misc', tags: ['sfx', 'interface', 'beep', 'chime'] },
    { file: 'toney10.wav', name: 'Tone 10', category: 'misc', tags: ['sfx', 'interface', 'beep', 'chime'] },
];

// Category configuration
export const CATEGORIES = {
    allies: { name: 'ALLIED FORCES', order: 1 },
    soviets: { name: 'SOVIET FORCES', order: 2 },
    tanya: { name: 'TANYA', order: 3 },
    special: { name: 'SPECIAL UNITS', order: 4 },
    civilians: { name: 'CIVILIANS', order: 5 },
    combat: { name: 'COMBAT', order: 6 },
    vehicles: { name: 'VEHICLES', order: 7 },
    buildings: { name: 'BUILDINGS & DEFENSES', order: 8 },
    dogs: { name: 'ATTACK DOGS', order: 9 },
    deaths: { name: 'CASUALTIES', order: 10 },
    ui: { name: 'UI & MAP', order: 11 },
    misc: { name: 'MISCELLANEOUS', order: 12 },
};

// Popular/Iconic sounds that new users might want to find quickly
export const POPULAR_SOUNDS = [
    'tanya_laugh.wav',
    'tanya_shake_it_baby.wav',
    'tanya_lets_rock.wav',
    'tanya_chew_on_this.wav',
    'allies_1_affirmative.wav',
    'allies_1_achnoledged.wav',
    'soviet_1_affirmative.wav',
    'chronosphere_sound.wav',
    'iron_curtain_sound.wav',
    'tesla_shot.wav',
    'explosion.wav',
    'building_being_placed.wav',
];

// Constants
export const MAX_RECENTLY_PLAYED = 10;
