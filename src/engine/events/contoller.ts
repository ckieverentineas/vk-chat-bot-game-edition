import { KeyboardBuilder } from "vk-io"
import prisma from "./module/prisma_client"
import { root, vk } from "../.."
import { User } from "@prisma/client";
import { randomInt } from "crypto";


function Sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function User_Info(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    let event_logger = ''
    if (user && user.point <= 0) {
        event_logger += 'Ваши характеристики:'
        keyboard.callbackButton({ label: 'Дальше', payload: { command: 'user_nickname' }, color: 'secondary' })
    } else {
        event_logger += 'Распределите характеристики:'
        keyboard.callbackButton({ label: '+⚔-⭐', payload: { command: 'user_add_stat', stat: "atk" }, color: 'secondary' })
        .callbackButton({ label: '+❤-⭐', payload: { command: 'user_add_stat', stat: "health"  }, color: 'secondary' }).row()
        .callbackButton({ label: '+🌀-⭐', payload: { command: 'user_add_stat', stat: "mana" }, color: 'secondary' })
    }
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `\n⚔Атака: ${user?.atk}\n❤Здоровье: ${user?.health_max}\n🌀Мана: ${user?.mana}\n⭐Очки: ${user?.point}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function User_Add_Stat(context: any) {
    const stat_sel = context.eventPayload.stat
    const user: User | null | undefined = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    console.log("🚀 ~ file: contoller.ts:34 ~ User_Add_Stat ~ user:", user)
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
    const smile = user.classify == 'игрок' || user.classify == 1 ? "👤" : "🤖"
    let bar = ''
    for (let i = 0; i <= 1; i += 0.1) {
        bar += (i < bar_current) ? '🟥' : '◻'
    }
    return `\n${smile}: ${bar} [${(bar_current*100).toFixed(2)}%]\n ❤${user.health}/${user.health_max} ⚔${user.atk} 🌀${user.mana} [${user.name}]\n`
}

async function Counter_Enemy(queue_battle: any) {
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

async function Target(queue_battle: any, type: any) {
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
    console.log("🚀 ~ file: contoller.ts:174 ~ Target ~ detected:", detected)
    console.log("🚀 ~ file: contoller.ts:184 ~ Target ~ detected[`${type}`]:", detected[`${type}`])
    return detected[`${type}`]
}
    
async function Use_Skill(skill: any, target: any, current: any, queue_battle: any, effect_list: any) {
    //контроллер скиллов в конфиге название в скиллах персонажей, а значение название функции скилла
    const config: any = {
        'Атака': Skill_Attack,
        'Призыв обычных слизней': Skill_Summoning_Usually_Slime,
        'Медовое исцеление': Skill_Honey_Healing
    }
    try {
        const res = config[skill](skill, target, current, queue_battle, effect_list)
        return res
    } catch (e) {
        return e
    }
}
async function Skill_Attack(skill:any, target: any, current: any, queue_battle: any, effect_list: any) {
    queue_battle[target].health -= queue_battle[current].atk
    let res = `🔪${queue_battle[current].name}>${skill}>${queue_battle[target].name}: 💥${queue_battle[current].atk}\n`
    /*if (randomInt(1,100) < 50) {
        effect_list.push({'target': target, 'effect': 'Дезориентация', 'time': 1})
        res += `🌀${queue_battle[target].name}:Дезоринтация!\n`
    }*/
    return res
}
async function Skill_Summoning_Usually_Slime(skill:any, target: any, current: any, queue_battle: any, effect_list: any) {
    if (queue_battle[current].health <= 0 && queue_battle[current].mana > 0) { 
        let summoning_counter = 0
        for (let i=0; i<queue_battle[current].mana; i++) {
            queue_battle.push({ name: "Слизь", type: "bot", team: 'enemy', atk: 1, health: 4, health_max: 4, mana: 0, skill: ['Атака'] }) 
            summoning_counter++
        }
        queue_battle[current].mana-=summoning_counter
        let res = `🔪${queue_battle[current].name}>${skill}>Призвано обычных слизней: ${summoning_counter}\n`
        return res
    }
    return ''
}
async function Skill_Honey_Healing(skill:any, target: any, current: any, queue_battle: any, effect_list: any) {
    if (queue_battle[current].health <= queue_battle[current].health_max && queue_battle[target].health - queue_battle[current].atk > 0 && queue_battle[current].mana > 0) { 
        queue_battle[current].health+=3
        queue_battle[current].mana--

        let res = `🔪${queue_battle[current].name}>${skill}>Восстановлено здоровья: 3\n`
        return res
    }
    return ''
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
    const enemy_will: any = (region.mob_min == region.mob_max) ? region.mob_min : randomInt(region.mob_min, region.mob_max)
    for (let i=0; i < enemy_will; i++) {
        queue_battle_init.push(creature.mob[randomInt(0, creature.mob.length)])
    }
    for (let i=0; i < region.boss; i++) {
        queue_battle_init.push(creature.boss[randomInt(0, creature.mob.length)])
    }
    const queue_battle: any = []
    const limit = queue_battle_init.length
    for (let j= 0; j < limit; j++) {
        const  limiter = 50
        const ranger = queue_battle_init.length*limiter
        const selector = Math.ceil(randomInt(1, ranger)/limiter)-1
        console.log(`${ranger} > ${selector} > ${queue_battle_init[selector].name}`)
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
    .callbackButton({ label: 'В бой!', payload: { command: 'battle_engine' }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${queue_battle[0].classify == 'игрок' ? "Вам повезло, вы первым заметили врага" : "Вы не заметили врага и он атаковал вас"}\n${event_logger}`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Battle_Engine(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId }, include: { classify: true } })
    const battle_data: any = await prisma.battle.findFirst({ where: { id_user: user.id } })
    const queue_battle = JSON.parse(battle_data.queue_battle)
    const queue_dead = JSON.parse(battle_data.queue_dead)
    const effect_list = JSON.parse(battle_data.effect_list)
    let target = battle_data.target 
    let turn = battle_data.turn
    //let current = context.eventPayload.current
    
    let event_logger = '' 
    const keyboard = new KeyboardBuilder()
    for (const current in queue_battle) {
        if (current == turn) {
            const alive_counter: any = await Counter_Enemy(queue_battle)
            if (alive_counter.friend > 0 && alive_counter.enemy > 0) {
                /*for (const i in effect_list) {
                    if (effect_list[i]?.target == current) {
                        const effect_sel = await Use_Effect(i, effect_list)
                        if (effect_sel?.status == false) {
                            /*if (current+2 > (alive_counter.friend + alive_counter.enemy)) {
                                current = 0
                            }
                            else {
                                current+=1
                            }
                        }
                        event_logger += effect_sel?.message
                    }
                }*/
                console.log('effect actived')
                if (queue_battle[current].team == 'enemy' && queue_battle[current].health > 0) {
                    //если ходит компьютер
                    console.log('enemy turn')
                    const target = await Target(queue_battle, 'friend')
                    const skill_sel = JSON.parse(queue_battle[current].skill)
                    const skill_status = await Use_Skill(skill_sel[0], Number(target[0]), current, queue_battle, effect_list)
                    event_logger += skill_status
                    const alive_counter1: any = await Counter_Enemy(queue_battle)
                    if (alive_counter1.friend > 0 && alive_counter1.enemy > 0) {
                        keyboard.callbackButton({ label: 'Следующий Ход', payload: { command: 'battle_engine' }, color: 'secondary' })
                    }
                }
                if (queue_battle[current].team == 'friend' && queue_battle[current].health > 0) {
                    //если ходит игрок
                    console.log('player turn')
                    const skill_sel = JSON.parse(queue_battle[current].skill)
                    const target_sel = await Target(queue_battle, 'enemy')
                    console.log("🚀 ~ file: contoller.ts:328 ~ Battle_Engine ~ target_sel:", target_sel)
                    if (target_sel.includes(String(target))) { target = target } else { target = target_sel[randomInt(0, target_sel.length)] }
                    const skill_status = await Use_Skill(skill_sel[0], target, current, queue_battle, effect_list)
                    console.log("🚀 ~ file: contoller.ts:331 ~ Battle_Engine ~ target:", target)
                    event_logger += skill_status
                    const alive_counter2: any = await Counter_Enemy(queue_battle)
                    if (alive_counter2.friend > 0 && alive_counter2.enemy > 0) {
                        keyboard.callbackButton({ label: `${skill_sel[0]}`, payload: { command: 'battle_engine' }, color: 'secondary' })
                    }
                }
                /*if (current+1 < (alive_counter.friend + alive_counter.enemy)) {
                    current+=1
                } else {
                    current = 0
                }*/
            }
        }
        
    } 
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
    const region: any = await prisma.region.findFirst({where: { uid: user.id_region }, include: { location: true}})
    event_logger += `🌐:${region.location.name}-${region.name}\n`
    turn < queue_battle.length ? turn++ : turn=0
    const alive_counter_end: any = await Counter_Enemy(queue_battle)
    if (alive_counter_end.friend <= 0 || alive_counter_end.enemy <= 0) {
        let xp = 0
        for (const i in queue_dead) {
            if (queue_dead[i].team == 'enemy') { xp += queue_dead[i].xp }
        }
        if (alive_counter_end.friend > 0) {
            const user_xp_add = await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: xp } } })
            event_logger += `Поздравляем, собрано ${xp} опыта, теперь на вашем счету: ${user_xp_add.xp} XP`
            keyboard.callbackButton({ label: 'Дальше', payload: { command: 'controller_portal' }, color: 'secondary' }).row()
        } else {
            const user_xp_add = await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: xp } } })
            event_logger += `Поражение, собрано ${xp} опыта, теперь на вашем счету: ${user_xp_add.xp} XP`
            keyboard.callbackButton({ label: 'Возрождение', payload: { command: 'controller_portal_dead' }, color: 'secondary' })
        }
    } 
    for (let i in queue_battle) {
        if (queue_battle[i].health > 0) {
            event_logger += await User_Print(queue_battle[i])
        }
    }
    
    const battle_init = await prisma.battle.upsert({ create: { id_user: battle_data.id, queue_battle: JSON.stringify(queue_battle), effect_list: JSON.stringify(effect_list), queue_dead: JSON.stringify(queue_dead), turn: turn, target: Number(target) }, update: { queue_battle: JSON.stringify(queue_battle), effect_list: JSON.stringify(effect_list), queue_dead: JSON.stringify(queue_dead), turn: turn, target: Number(target) }, where: { id_user: battle_data?.id }})
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}

export async function User_Win(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const uid = context.eventPayload.uid
    const user_location = await prisma.user.update({ where: { id: user.id }, data: { id_region: uid }})
    let event_logger = 'Опа чирик, новая локация и мобы нафиг!' 
    
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Осмотреться', payload: { command: 'controller_portal' }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function User_Lose(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const uid = context.eventPayload.uid
    const user_location = await prisma.user.update({ where: { id: user.id }, data: { id_region: uid }})
    let event_logger = 'Вы воскресле у жертвенника при входе в порталы!' 
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'МММ', payload: { command: 'controller_portal_dead', uid: uid }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Controller_Portal_Dead(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const find_start_portal: any = await prisma.region.findFirst({ where: { uid: user.id_region } })
    const user_location = await prisma.user.update({ where: { id: user.id }, data: { id_region: find_start_portal.uid_dead }})
    let event_logger = 'Вы воскресле у жертвенника при входе в порталы!' 
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Возродиться', payload: { command: 'controller_portal' }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Controller_Portal(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
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
    const region_sel: any = await prisma.region.findFirst({where: { uid: user.id_region }, include: { location: true}})
    event_logger += `${await User_Print(user)}\n🌐:${region_sel.location.name}-${region_sel.name}\n`
    keyboard.inline().oneTime()  
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event_logger}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
}
export async function Controller_Event(context: any) {
    const user: any = await prisma.user.findFirst({ where: { idvk: context.peerId } })
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