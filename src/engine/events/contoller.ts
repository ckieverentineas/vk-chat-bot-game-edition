import { KeyboardBuilder } from "vk-io"
import prisma from "./module/prisma_client"
import { root, vk } from "../.."
import { User } from "@prisma/client";
import { randomInt } from "crypto";


export function Sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function User_Info(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    let event_logger = ''
    if (user && user.point <= 0) {
        event_logger += 'Ваши характеристики:'
        if (user.name == "zero") {
            keyboard.callbackButton({ label: 'Выбор ника', payload: { command: 'user_nickname' }, color: 'secondary' })
        } else {
            keyboard.callbackButton({ label: 'Назад', payload: { command: 'controller_portal' }, color: 'secondary' })
        }
    } else {
        event_logger += 'Распределите характеристики:'
        keyboard.callbackButton({ label: '+⚔-⭐', payload: { command: 'user_add_stat', stat: "atk" }, color: 'secondary' })
        .callbackButton({ label: '+❤-⭐', payload: { command: 'user_add_stat', stat: "health"  }, color: 'secondary' }).row()
        .callbackButton({ label: '+🌀-⭐', payload: { command: 'user_add_stat', stat: "mana" }, color: 'secondary' })
    }
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `\n⚔Атака: ${user?.atk}\n❤Здоровье: ${user?.health_max}\n🌀Мана: ${user?.mana}\n⭐Очки: ${user?.point}\n📗Опыт: ${user.xp}/${Math.ceil(5.4321*user.lvl**1.6663)}\n📝Уровень: ${user.lvl}`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function User_Add_Stat(context: any) {
    const stat_sel = context.eventPayload.stat
    const user: User | null | undefined = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    let event_logger = ''
    if (user && user.point > 0) {
        if (stat_sel == 'atk') {
            const user_add_attack = await prisma.user.update({ where: { id: user.id }, data: { atk: { increment: 1 }, point: { decrement: 1 } } })
            event_logger += `🔔 Повышена ⚔Атака с ${user.atk} до ${user_add_attack.atk}`
        }
        if (stat_sel == 'health') {
            const user_add_health = await prisma.user.update({ where: { id: user.id }, data: { health: { increment: 2 }, health_max: { increment: 2 }, point: { decrement: 1 } } })
            event_logger += `🔔 Повышено ❤Здоровье с ${user.health_max} до ${user_add_health.health_max}`
        }
        if (stat_sel == 'mana') {
            const user_skill = JSON.parse(user.skill)
            if (user_skill.length <= 0) {
                const user_add_mana = await prisma.user.update({ where: { id: user.id }, data: { mana: { increment: 1 }, point: { decrement: 1 } } })
                event_logger += `🔔 Повышена 🌀Мана с ${user.mana} до ${user_add_mana.mana}`
            }
            event_logger += `🔔 У тебя даже навыков нет, зачем тебе мана? Подумай ещё`
        }
        keyboard.callbackButton({ label: 'Дальше', payload: { command: 'user_info' }, color: 'secondary' }).inline().oneTime()
        await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
        return
    }
    await vk.api.messages.sendMessageEventAnswer({ event_id: context.eventId, user_id: context.userId, peer_id: context.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: `🔔 Повышение cтатов невозможно` }) })  
}

async function User_Generate_Nickname(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export async function User_Nickname(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    for (let i=0; i < 4; i++) {
        const name_new = await User_Generate_Nickname(8)
        keyboard.callbackButton({ label: `${name_new}`, payload: { command: 'user_nickname_select', name: `${name_new}` }, color: 'secondary' }).row()
    }
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Выберите желаемый ник:`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}

export async function User_Nickname_Select(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Осмотреться', payload: { command: 'controller_portal' }, color: 'secondary' })
    keyboard.inline().oneTime() 
    if (user) {
        if (context.eventPayload.name) {
            const user_nickname_save = await prisma.user.update({ where: { id: user.id }, data: { name: context.eventPayload.name } })
            await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Поздравляем с ником: ${user_nickname_save.name}. Но вы слышите какой-то шум`, keyboard: keyboard/*, attachment: attached.toString()*/ })
            return
        }
    }
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 Технические шоколадки`
        })
    })
}

async function User_Print(user: any) {
    const bar_current = user?.health/user?.health_max
    const smile = user.classify == 'игрок' || user.classify == 1 || user.classify.name == 'игрок' ? "👤" : "🤖"
    let bar = ''
    for (let i = 0; i <= 1; i += 0.1) {
        bar += (i < bar_current) ? '🟥' : '◻'
    }
    return `\n${smile}: ${bar} [${(bar_current*100).toFixed(2)}%]\n ❤${user.health}/${user.health_max} ⚔${user.atk} 🌀${user.mana} [${user.name}]\n`
}

async function Counter_Enemy(context: any, queue_battle: any) {
    console.log(`Counted enemy in battle for user ${context.peerId}`)
    //функция подсчета количества врагов и союзников
    const counter: any = { enemy: 0, friend: 0}
    const helper = ['enemy', 'friend']
    for (let i in helper) {
        for (let j in queue_battle) {
            if (queue_battle[j].team == helper[i] && queue_battle[j].health > 0) {
                counter[helper[i]] = counter[helper[i]]+1
            }
        }
    }
    return counter
}
    
async function Use_Effect(id: any, effect_list: any) {
    //контроллер эффектов в конфиге название из скиллов накладывающих эффекты, а значение название функции эффекта
    const config: any = {
        'Дезориентация': Effect_Disorientation
    }
    try {
        const res = config[effect_list[id].effect](id)
        return res
    } catch (e) {
        return e 
    }
}
async function Effect_Disorientation(id: any, effect_list: any, queue_battle: any) {
    //id это номер эффекта в очереди по которому можно узнать цель эффект и длительность, верните в status значение False чтобы вызвать пропуск хода, в значение message гененрируем тексты эффектов
    let res = ''
    let status = true
    if (effect_list[id]?.time > 0) {
        res = `🌀${queue_battle[effect_list[id].target.name]}: ${effect_list[id].effect}\n`
        //благодаря формуле обратного процента возвращаем в исходное значение паараметры персонажей по окончанию длительности, главное чтобы их длительность была не больше 1 хода) иначе придется усложнять адллгоритм
        queue_battle[effect_list[id].target.atk]*=0.9
        res += `🌀${queue_battle[effect_list[id].target.name]}: ⚔${queue_battle[effect_list[id].target.atk]}(-10%)\n`
        if (randomInt(1,100) < 50) {
            status = false
            res += ' Оглушение! Пропуск хода\n'
            effect_list[id].time-=1
        }
    } else {
        queue_battle[effect_list[id].target.atk] = queue_battle[effect_list[id].target.atk] * 100/90
        res += `🌀${queue_battle[effect_list[id].target.name]}: ⚔${queue_battle[effect_list[id].target.atk]}\n`
        effect_list.pop(id)
    }
    const answer = {
        'message': res,
        'status': status
    }
    return answer       
}

async function Target(context: any, queue_battle: any, type: any) {
    console.log(`Reseach target by ${type} in battle for user ${context.peerId}`)
    //функция подсчета количества врагов и союзников
    const detected: any = { enemy: [], friend: []}
    const helper = ['enemy', 'friend']
    
    for (const i in helper) {
        for (const j in queue_battle) {
            if (queue_battle[j].team == helper[i] && queue_battle[j].health > 0) {
                detected[helper[i]].push(j)
            }
        }
    } 
    return detected[`${type}`]
}
    
async function Use_Skill(context: any, skill: any, target: any, current: any, queue_battle: any, effect_list: any) {
    console.log(`Skill selected by ${queue_battle[current].team} in battle for user ${context.peerId}`)
    //контроллер скиллов в конфиге название в скиллах персонажей, а значение название функции скилла
    const config: any = {
        'Атака': Skill_Attack,
        'Медовое исцеление': Skill_Honey_Healing
    }
    try {
        const res = config[skill](context, skill, target, current, queue_battle, effect_list)
        return res
    } catch (e) {
        return e
    }
}
async function Skill_Analyzer(context: any, skill: any, target: any, current: any, queue_battle: any, effect_list: any) {
    console.log(`Skill selected by ${queue_battle[current].team} in battle for user ${context.peerId}`)
    //контроллер скиллов в конфиге название в скиллах персонажей, а значение название функции скилла
    const config: any = {
        'Атака': { mana: 0, health_lost: 'n'},
        'Медовое исцеление': { mana: 1, health_lost: 3}
    }
    const skill_available = []
    for (const i in skill) {
        if (config[skill[i]].mana <= queue_battle[current].mana && (config[skill[i]].health_lost <= queue_battle[current].health_max-queue_battle[current].health || config[skill[i]].health_lost == "n") ) {
            skill_available.push(skill[i])
        }
    }
    if (skill_available.length > 1) {
        skill_available.splice(0, 1);
    }
    return skill_available
}
async function Skill_Attack(context: any, skill:any, target: number, current: number, queue_battle: any, effect_list: any) {
    console.log(`Skill attack by ${queue_battle[current].team} in battle for user ${context.peerId}`)
    queue_battle[target].health -= queue_battle[current].atk
    let res = `🔪${queue_battle[current].name} > ${skill} > ${queue_battle[target].name}: 💥${queue_battle[current].atk}\n`
    /*if (randomInt(1,100) < 50) {
        effect_list.push({'target': target, 'effect': 'Дезориентация', 'time': 1})
        res += `🌀${queue_battle[target].name}:Дезоринтация!\n`
    }*/
    return res
}

async function Skill_Honey_Healing(context: any, skill:any, target: any, current: any, queue_battle: any, effect_list: any) {
    let event_logger = ''
    if (queue_battle[current].mana > 0) { 
        queue_battle[current].health+=3
        queue_battle[current].mana--
        event_logger = `🔪${queue_battle[current].name}>${skill}>Восстановлено здоровья: 3\n`
    } else {
        event_logger = `🔪${queue_battle[current].name}>${skill}>Недостаточно маны!\n`
    }
    return event_logger
}

async function Use_Skill_Death(context: any, skill: any, target: any, current: any, queue_battle: any, effect_list: any, queue_dead: any) {
    console.log(`Skill Death selected by ${queue_dead[current].team} in battle for user ${context.peerId}`)
    //контроллер скиллов в конфиге название в скиллах персонажей, а значение название функции скилла
    const config: any = {
        'Разложение на обычных слизней': Skill_Death_Decomposition_Into_Usually_Slime,
    }
    try {
        const res = config[skill](context, skill, target, current, queue_battle, effect_list, queue_dead)
        return res
    } catch (e) {
        return e
    }
}
async function Skill_Death_Decomposition_Into_Usually_Slime(context: any, skill:any, target: any, current: any, queue_battle: any, effect_list: any, queue_dead: any) {
    console.log(`Skill Death Decomposition Into Usually Slime used by ${queue_dead[current].team} in battle for user ${context.peerId}`)
    let event_logger = ''
    if (queue_dead[current].mana > 0) { 
        let summoning_counter = 0
        const mob_sel: any = await prisma.mob.findFirst({ where: { name: "Слизь" }, include: { classify: true }})
        for (let i=0; i<queue_dead[current].mana; i++) {
            queue_battle.push({ classify: mob_sel.classify.name, team: 'enemy', xp: mob_sel.xp, name: mob_sel.name, atk: mob_sel.atk, health: mob_sel.health, health_max: mob_sel.health_max, mana: mob_sel.mana, skill: mob_sel.skill })
            queue_battle.push({ name: "Слизь", type: "bot", team: 'enemy', atk: 1, health: 4, health_max: 4, mana: 0, skill: ['Атака'] }) 
            summoning_counter++
        }
        queue_dead[current].mana-=summoning_counter
        event_logger  = `🔪${queue_dead[current].name}>${skill}>Призвано обычных слизней: ${summoning_counter}\n`
    } else {
        event_logger  = `🔪${queue_dead[current].name}>${skill}>Не хватило маны\n`
    }
    return event_logger
}
        
export async function Battle_Event(context: any) {
    //Стадия подготовки данных к битве
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId }, include: { classify: true } })
    const region: any = await prisma.region.findFirst({ where: { uid: user.id_region }, include: { location: true, }})
    const effect_list: any = []
    //Стадия инициализации мобов и игрока
    const mob_sel: any = await prisma.mob.findMany({ where: { id_location: region.location.id }, include: { classify: true }})
    const creature: any = { mob: [], boss: [] }
    for (const i in mob_sel) {
        if (mob_sel[i].classify.name == 'моб') {
            creature.mob.push({ classify: mob_sel[i].classify.name, team: 'enemy', xp: mob_sel[i].xp, name: mob_sel[i].name, atk: mob_sel[i].atk, health: mob_sel[i].health, health_max: mob_sel[i].health_max, mana: mob_sel[i].mana, skill: mob_sel[i].skill })
        }
        if (mob_sel[i].classify.name == 'босс') {
            creature.boss.push({ classify: mob_sel[i].classify.name, team: 'enemy', xp: mob_sel[i].xp, name: mob_sel[i].name, atk: mob_sel[i].atk, health: mob_sel[i].health, health_max: mob_sel[i].health_max, mana: mob_sel[i].mana, skill: mob_sel[i].skill })
        }
    }
    const queue_battle_init: any = []
    queue_battle_init.push({ classify: user.classify.name, team: 'friend', xp: user.xp, name: user.name, atk: user.atk, health: user.health, health_max: user.health_max, mana: user.mana, skill: user.skill })
    const enemy_will: any = (region.mob_min == region.mob_max) ? region.mob_min : randomInt(region.mob_min, region.mob_max+1)
    for (let i=0; i < enemy_will; i++) {
        queue_battle_init.push(creature.mob[randomInt(0, creature.mob.length)])
    }
    for (let i=0; i < region.boss; i++) {
        if (creature.boss.length > 0) {
            queue_battle_init.push(creature.boss[randomInt(0, creature.mob.length)])
        }
    }
    const queue_battle: any = []
    const limit = queue_battle_init.length
    for (let j= 0; j < limit; j++) {
        const  limiter = 50
        const ranger = queue_battle_init.length*limiter
        const selector = Math.ceil(randomInt(1, ranger)/limiter)-1
        //console.log(`${ranger} > ${selector} > ${queue_battle_init[selector].name}`)
        queue_battle.push(queue_battle_init[selector])
        queue_battle_init.splice(selector, 1);
    }
    //cтатус бары
    let event_logger = '' 
    for (let i in queue_battle) {
        event_logger += await User_Print(queue_battle[i])
    }
    event_logger += `🌐:${region.location.name}-${region.name}\n`
    const battle_init = await prisma.battle.upsert({ create: { id_user: user.id, queue_battle: JSON.stringify(queue_battle), effect_list: JSON.stringify(effect_list), queue_dead: JSON.stringify([]), turn: 0, target: 0 }, update: { id_user: user.id, queue_battle: JSON.stringify(queue_battle), effect_list: JSON.stringify(effect_list), queue_dead: JSON.stringify([]), turn: 0, target: 0 }, where: { id_user: user?.id }})
    
    const keyboard = new KeyboardBuilder()
    queue_battle[0].classify == 'игрок' ? keyboard.callbackButton({ label: 'В бой!', payload: { command: 'battle_turn_player_ready' }, color: 'secondary' }) : keyboard.callbackButton({ label: 'В бой!', payload: { command: 'battle_turn_enemy' }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${queue_battle[0].classify == 'игрок' ? "Вам повезло, вы первым заметили врага" : "Вы не заметили врага и он атаковал вас"}\n${event_logger}`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Battle_Turn_Player_Ready(context: any) { 
    console.log(`Turn player init in battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    let event_logger = `Ваш ход, что предпримете?\n`
    //если ходит игрок
    console.log("🚀 ~ file: contoller.ts:295 ~ Battle_Turn_Player_Ready ~ queue_battle[turn].skill:", queue_battle[turn].skill)
    
    const target_sel = await Target(context, queue_battle, 'enemy')
    if (target_sel.includes(String(target))) { target = target } else { target = target_sel[randomInt(0, target_sel.length)] }
    const skill_sel = await Skill_Analyzer(context, JSON.parse(queue_battle[turn].skill).active, target, turn, queue_battle, effect_list)
    await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
    const keyboard = new KeyboardBuilder()
    for (const i in skill_sel) {
        keyboard.callbackButton({ label: skill_sel[i], payload: { command: 'battle_turn_player', skill_name: skill_sel[i] }, color: 'secondary' }).row()
    }
    const alive_counter: any = await Counter_Enemy(context, queue_battle)
    if (alive_counter.enemy > 1) { keyboard.callbackButton({ label: `Смена цели`, payload: { command: 'battle_turn_player_change_target' }, color: 'secondary' }) }
    event_logger += await Battle_Printer(context)
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard.inline().oneTime() /*, attachment: attached.toString()*/ })
}
    
export async function Battle_Turn_Player(context: any) {
    console.log(`Turn player in battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    const skill_selected = context.eventPayload.skill_name
    let event_logger = ''
    //если ходит игрок
    const skill_status = await Use_Skill(context, skill_selected, target, turn, queue_battle, effect_list)
    event_logger += skill_status
    await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
    await Battle_Clear(context)
    event_logger += await Battle_Detector_Skill_Death(context)
    const [event_logger_fin, keyboard]: any = await Battle_Detector(context)
    event_logger += event_logger_fin
    event_logger += await Battle_Printer(context)
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard.inline().oneTime() /*, attachment: attached.toString()*/ })
}
export async function Battle_Turn_Player_Change_Target(context: any) {
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    const id_target = context.eventPayload?.id_target || false
    let event_logger = ``
    const keyboard = new KeyboardBuilder()
    if (!id_target) {
        event_logger = `Выберите цель:\n`
        const target_sel = await Target(context, queue_battle, 'enemy')
        for (const i in target_sel) {
            keyboard.callbackButton({ label: `${Number(target_sel[i])+1}-${queue_battle[target_sel[i]].name}`, payload: { command: 'battle_turn_player_change_target', id_target: target_sel[i] }, color: 'secondary' }).row()
        }
    } else {
        target = id_target
        event_logger = `Установлена новая цель ${1+Number(target)}`
        await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
        keyboard.callbackButton({ label: `Дальше`, payload: { command: 'battle_turn_player_ready' }, color: 'secondary' })
    }
    event_logger += await Battle_Printer(context)
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard.inline().oneTime() /*, attachment: attached.toString()*/ })
}

export async function Battle_Turn_Enemy(context: any) {
    console.log(`Turn enemy in battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    let event_logger = ''
    const alive_counter: any = await Counter_Enemy(context, queue_battle)
    const targets = await Target(context, queue_battle, 'friend')
    const skill_sel = await Skill_Analyzer(context, JSON.parse(queue_battle[turn].skill).active, Number(targets[0]), turn, queue_battle, effect_list)
    const skill_status = await Use_Skill(context, skill_sel[randomInt(0, skill_sel.length)], Number(targets[0]), turn, queue_battle, effect_list)
    event_logger += skill_status
    await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
    await Battle_Clear(context)
    event_logger += await Battle_Detector_Skill_Death(context)
    const [event_logger_fin, keyboard]: any = await Battle_Detector(context)
    event_logger += event_logger_fin
    event_logger += await Battle_Printer(context)
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard.inline().oneTime() /*, attachment: attached.toString()*/ })
}
async function Battle_Load(context: any) {
    console.log(`Load battle for user ${context.peerId}`)
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId }, include: { classify: true } })
    const battle_data: any = await prisma.battle.findFirst({ where: { id_user: user.id } })
    const queue_battle = JSON.parse(battle_data.queue_battle)
    const queue_dead = JSON.parse(battle_data.queue_dead)
    const effect_list = JSON.parse(battle_data.effect_list)
    let target = battle_data.target 
    let turn = battle_data.turn
    const id_battle = battle_data.id
    return [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]
}
async function Battle_Save(context: any, user: any, id_battle: any, queue_battle: any, queue_dead: any, effect_list: any, turn: number, target: any) {
    console.log(`Save battle for user ${context.peerId}`)
    const battle_init = await prisma.battle.update({ where: { id: Number(id_battle) }, data: { queue_battle: JSON.stringify(queue_battle), effect_list: JSON.stringify(effect_list), queue_dead: JSON.stringify(queue_dead), turn: turn, target: Number(target) }})
    const player = await Target(context, queue_battle, 'friend')
    const user_save = await prisma.user.update({ where: { id: Number(user.id) }, data: { health: queue_battle[player[0]]?.health || 0 } })
}
async function Battle_Printer(context: any) {
    console.log(`Print status battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    const region: any = await prisma.region.findFirst({where: { uid: user.id_region }, include: { location: true}})
    let event_logger = ''
    event_logger += `🌐:${region.location.name}-${region.name}\n`
    for (let i in queue_battle) {
        if (queue_battle[i].health > 0) {
            event_logger += await User_Print(queue_battle[i])
        }
        if (turn == i) {
            event_logger += `🎲`
        }
        if (target == i) {
            event_logger += `🎯`
        }
    }
    return event_logger
}
async function Battle_Clear(context: any) {
    console.log(`Clear dead creature in battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    //чистка трупов
    const limit = queue_battle.length
    for (let j= 0; j < limit; j++) {
        let detected = false
        for (const i in queue_battle) {
            if (queue_battle[i].health <= 0 && !detected) {
                queue_dead.push(queue_battle[i])
                queue_battle.splice(i, 1);
                turn >= i ? turn-- : turn=turn
                detected = true
            }
        }
    }
    await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
}
async function Battle_Detector_Skill_Death(context: any) {
    console.log(`Finder dead skills from creature in battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    //детектор скиллов смерти
    let event_logger = ''
    for (const i in queue_dead) {
        if (queue_dead[i].skill.death?.length > 0) {
            const skill_death = queue_dead[i].skill.death[0]
            const skill_death_activation = await Use_Skill_Death(context, skill_death, target, turn, queue_battle, effect_list, queue_dead)
            event_logger += skill_death_activation
            queue_dead[i].skill.death.splice(i, 1);
        }
    }
    
    await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
    return event_logger
}
async function Battle_Detector(context: any) {
    console.log(`Analyse situation battle for user ${context.peerId}`)
    let [id_battle, user, queue_battle, queue_dead, effect_list, target, turn]: any = await Battle_Load(context)
    turn < queue_battle.length-1 ? turn++ : turn=0
    const keyboard = new KeyboardBuilder()
    let event_logger = ''
    const alive_counter_end: any = await Counter_Enemy(context, queue_battle)
    if (alive_counter_end.friend <= 0 || alive_counter_end.enemy <= 0) {
        let xp = 0
        for (const i in queue_dead) {
            if (queue_dead[i].team == 'enemy') { xp += queue_dead[i].xp }
        }
        const user_xp_add = await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: xp } } })
        const xp_logger = `собрано ${xp} опыта, теперь на вашем счету: ${user_xp_add.xp} XP`
        if (alive_counter_end.friend > 0) {
            event_logger += `Поздравляем, ${xp_logger}\n`
            keyboard.callbackButton({ label: 'Дальше', payload: { command: 'controller_portal' }, color: 'secondary' }).row()
        } else {
            event_logger += `Поражение, ${xp_logger}\n`
            keyboard.callbackButton({ label: 'Возрождение', payload: { command: 'controller_portal_dead' }, color: 'secondary' })
        }
        const xp_for_next_lvl = Math.ceil(5.4321*user.lvl**1.6663)
        if (user_xp_add.xp >= xp_for_next_lvl) {
            const user_lvl_add = await prisma.user.update({ where: { id: user.id }, data: { xp: { decrement: xp_for_next_lvl }, lvl: { increment: 1 }, point: { increment: 1 } } })
            event_logger += `Повышен уровень с ${user.lvl} до ${user_lvl_add.lvl}.\nПоинты увеличены с ${user.point} до ${user_lvl_add.point}.\n`
            console.log(`Level up for ${context.peerId} with ${user.lvl} to ${user_lvl_add.lvl}`)
        }
    } else {
        if (queue_battle[turn].team == 'friend') {
            keyboard.callbackButton({ label: 'Ваш ход', payload: { command: 'battle_turn_player_ready' }, color: 'secondary' })
        } else {
            keyboard.callbackButton({ label: 'Следующий ход', payload: { command: 'battle_turn_enemy' }, color: 'secondary' })
        }
    }
    await Battle_Save(context, user, id_battle,queue_battle, queue_dead, effect_list, turn, target)
    return [ event_logger, keyboard ]
}

export async function Controller_Portal_Dead(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const find_start_portal: any = await prisma.region.findFirst({ where: { uid: user.id_region } })
    const user_location = await prisma.user.update({ where: { id: user.id }, data: { id_region: find_start_portal.uid_dead }})
    const user_save = await prisma.user.update({ where: { id: Number(user.id) }, data: { health: user.health_max } })
    let event_logger = 'Вы воскресле у жертвенника при входе в порталы.\nЗдоровье восстановлено полностью!' 
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Возродиться', payload: { command: 'controller_portal' }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Controller_Portal(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId }, include: { classify: true } })
    const region: any = await prisma.region.findFirst({where: { uid: user.id_region }})
    const region_next: any = []
    const region_current = JSON.parse(region.road)
    let event_logger = ''
    const keyboard = new KeyboardBuilder()
    for (const i in region_current) {
        const region_temp = await prisma.region.findFirst({ where: { uid: region_current[i].uid } })
        region_next.push(region_temp)
    }
    event_logger += `Куда пойдем?\n`
    for (const i in region_next) {
        //event_logger += `${region_next[i].label} - ${region_next[i].name}\n`
        keyboard.callbackButton({ label: region_next[i].label, payload: { command: 'controller_event', uid: region_next[i].uid }, color: 'secondary' }).row()
    }
    if (region.id_location == 1) {
        keyboard.callbackButton({ label: `Персонаж`, payload: { command: 'user_info' }, color: 'secondary' })
    }
    const region_sel: any = await prisma.region.findFirst({where: { uid: user.id_region }, include: { location: true}})
    event_logger += `${await User_Print(user)}\n🌐:${region_sel.location.name}-${region_sel.name}\n`
    keyboard.inline().oneTime()  
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Controller_Event(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId }, include: { classify: true } })
    const uid = context?.eventPayload?.uid ? context.eventPayload.uid : user.uid
    const user_location = await prisma.user.update({ where: { id: user.id }, data: { id_region: uid }})
    let event_logger = '' 
    const region: any = await prisma.region.findFirst({where: { uid: user_location.id_region }, include: { location: true}})
    event_logger += `${await User_Print(user)}\n🌐:${region.location.name}-${region.name}\n`
    const keyboard = new KeyboardBuilder()
    if (region.mob_min > 0 || region.boss > 0) {
        keyboard.callbackButton({ label: 'Осмотреться', payload: { command: 'battle_event' }, color: 'secondary' })
    } else {
        keyboard.callbackButton({ label: 'Вперед', payload: { command: 'controller_portal' }, color: 'secondary' })
    }
    
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}