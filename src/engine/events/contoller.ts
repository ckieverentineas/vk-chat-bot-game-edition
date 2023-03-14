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

export async function Main_Menu_Init(context: any) {
    //const attached = await Image_Random(context, "bank")
    //const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Войти в портал:`, keyboard: await Main_Menu(context)/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 Порталы, в которые можно войти"
        })
    })
}
export async function Exit(context: any) {
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `💡 Сессия успешно завершена. Чтобы начать новую, напишите в госдуму! Вас рассмотрят, как кандидата`})
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 Выход из системы успешно завершен!"
        })
    })
}
export async function Main_Menu(context: any) {
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Магазин', payload: { command: 'portal_shop', location: 'Магазин' }, color: 'secondary' })
    .callbackButton({ label: 'Метро', payload: { command: 'portal_underground', location: 'Метро' }, color: 'secondary' }).row()
    .callbackButton({ label: 'Парк', payload: { command: 'portal_park', location: 'Парк' }, color: 'secondary' }).inline().oneTime()
    return keyboard
}

export async function Portal_Shop(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    if (user) {
        const user_location = await prisma.user.update({ where: { id: user.id }, data: { location: context.eventPayload.location }})
    }
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Далее', payload: { command: 'user_info' }, color: 'secondary' })
    .callbackButton({ label: 'Назад', payload: { command: 'system_call' }, color: 'secondary' }).inline().oneTime()
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Как оказалось, данный портал ведёт в гнездо крыс`, keyboard: keyboard/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 Ужас, вот тебе и магазин..."
        })
    })
}

export async function Portal_Underground(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    if (user) {
        const user_location = await prisma.user.update({ where: { id: user.id }, data: { location: context.eventPayload.location }})
    }
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Далее', payload: { command: 'user_info' }, color: 'secondary' })
    .callbackButton({ label: 'Назад', payload: { command: 'system_call' }, color: 'secondary' }).inline().oneTime()
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Вы попали на поляну слизней`, keyboard: keyboard/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 Треш, вот тебе и метро..."
        })
    })
}

export async function Portal_Park(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    if (user) {
        const user_location = await prisma.user.update({ where: { id: user.id }, data: { location: context.eventPayload.location }})
    }
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Далее', payload: { command: 'user_info' }, color: 'secondary' })
    .callbackButton({ label: 'Назад', payload: { command: 'system_call' }, color: 'secondary' }).inline().oneTime()
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Повсюду пчёлы, вероятно это улей`, keyboard: keyboard/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 Жесть, вот тебе и парк..."
        })
    })
}

export async function User_Info(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: '+⚔-⭐', payload: { command: 'user_add_attack' }, color: 'secondary' })
    .callbackButton({ label: '+❤-⭐', payload: { command: 'user_add_health' }, color: 'secondary' }).row()
    .callbackButton({ label: '+🌀-⭐', payload: { command: 'user_add_mana' }, color: 'secondary' })
    if (user && user.point <= 0) { keyboard.callbackButton({ label: 'Дальше', payload: { command: 'user_nickname' }, color: 'secondary' })}
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Распределите характеристики:\n⚔Атака: ${user?.atk}\n❤Здоровье: ${user?.hp}\n🌀Мана: ${user?.mana}\n⭐Очки: ${user?.point}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 Жесть, вот тебе и парк..."
        })
    })
}
export async function User_Add_Attack(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null | undefined = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    if (user && user.point > 0) {
        const user_add_attack = await prisma.user.update({ where: { id: user.id }, data: { atk: { increment: 1 }, point: { decrement: 1 } } })
        if (user_add_attack) {
            const keyboard = new KeyboardBuilder()
            .callbackButton({ label: '+⚔-⭐', payload: { command: 'user_add_attack' }, color: 'secondary' })
            .callbackButton({ label: '+❤-⭐', payload: { command: 'user_add_health' }, color: 'secondary' }).row()
            .callbackButton({ label: '+🌀-⭐', payload: { command: 'user_add_mana' }, color: 'secondary' })
            if (user_add_attack.point <= 0) { keyboard.callbackButton({ label: 'Дальше', payload: { command: 'user_nickname' }, color: 'secondary' })}
            keyboard.inline().oneTime()
            await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `⚔Атака: ${user_add_attack?.atk}\n❤Здоровье: ${user_add_attack?.hp}\n🌀Мана: ${user_add_attack?.mana}\n⭐Очки: ${user_add_attack?.point}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
            await vk.api.messages.sendMessageEventAnswer({
                event_id: context.eventId,
                user_id: context.userId,
                peer_id: context.peerId,
                event_data: JSON.stringify({
                    type: "show_snackbar",
                    text: `🔔 Повышение ⚔Атаки с ${user.atk} до ${user_add_attack.atk}`
                })
            })    
            return
        }
    }
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 Повышение ⚔Атаки невозможно`
        })
    })  
}

export async function User_Add_Health(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null | undefined = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    if (user && user.point > 0) {
        const user_add_attack = await prisma.user.update({ where: { id: user.id }, data: { hp: { increment: 2 }, point: { decrement: 1 } } })
        if (user_add_attack) {
            const keyboard = new KeyboardBuilder()
            .callbackButton({ label: '+⚔-⭐', payload: { command: 'user_add_attack' }, color: 'secondary' })
            .callbackButton({ label: '+❤-⭐', payload: { command: 'user_add_health' }, color: 'secondary' }).row()
            .callbackButton({ label: '+🌀-⭐', payload: { command: 'user_add_mana' }, color: 'secondary' })
            if (user_add_attack.point <= 0) { keyboard.callbackButton({ label: 'Дальше', payload: { command: 'user_nickname' }, color: 'secondary' })}
            keyboard.inline().oneTime()
            await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `⚔Атака: ${user_add_attack?.atk}\n❤Здоровье: ${user_add_attack?.hp}\n🌀Мана: ${user_add_attack?.mana}\n⭐Очки: ${user_add_attack?.point}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
            await vk.api.messages.sendMessageEventAnswer({
                event_id: context.eventId,
                user_id: context.userId,
                peer_id: context.peerId,
                event_data: JSON.stringify({
                    type: "show_snackbar",
                    text: `🔔 Повышение ❤Здоровья с ${user.hp} до ${user_add_attack.hp}`
                })
            })    
            return
        }
    }
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 Повышение ❤Здоровья невозможно`
        })
    })  
}

export async function User_Add_Mana(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null | undefined = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 У тебя даже навыков нет, зачем тебе мана? Подумай ещё`
        })
    })  
    return
    if (user && user.point > 0) {
        const user_add_attack = await prisma.user.update({ where: { id: user.id }, data: { hp: { increment: 2 }, point: { decrement: 1 } } })
        if (user_add_attack) {
            const keyboard = new KeyboardBuilder()
            .callbackButton({ label: '+⚔-⭐', payload: { command: 'user_add_attack' }, color: 'secondary' })
            .callbackButton({ label: '+❤-⭐', payload: { command: 'user_add_health' }, color: 'secondary' })
            .callbackButton({ label: '+🌀-⭐', payload: { command: 'user_add_mana' }, color: 'secondary' })
            if (user_add_attack.point <= 0) { keyboard.callbackButton({ label: 'Дальше', payload: { command: 'user_nickname' }, color: 'secondary' })}
            keyboard.inline().oneTime()
            await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `⚔Атака: ${user_add_attack?.atk}\n❤Здоровье: ${user_add_attack?.hp}\n🌀Мана: ${user_add_attack?.mana}\n⭐Очки: ${user_add_attack?.point}\n`, keyboard: keyboard/*, attachment: attached.toString()*/ })
            await vk.api.messages.sendMessageEventAnswer({
                event_id: context.eventId,
                user_id: context.userId,
                peer_id: context.peerId,
                event_data: JSON.stringify({
                    type: "show_snackbar",
                    text: `🔔 Повышение 🌀Маны с ${user.mana} до ${user_add_attack.mana}`
                })
            })    
            return
        }
    }
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 Повышение 🌀Маны невозможно`
        })
    })  
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
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: "🔔 А как же придумать свой никнейм:?"
        })
    })
}

export async function User_Nickname_Select(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Осмотреться', payload: { command: 'battle_init' }, color: 'secondary' })
    keyboard.inline().oneTime() 
    if (user) {
        if (context.eventPayload.name) {
            const user_nickname_save = await prisma.user.update({ where: { id: user.id }, data: { name: context.eventPayload.name } })
            await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `Поздравляем с ником: ${user_nickname_save.name}. Но вы слышите какой-то шум`, keyboard: keyboard/*, attachment: attached.toString()*/ })
            await vk.api.messages.sendMessageEventAnswer({
                event_id: context.eventId,
                user_id: context.userId,
                peer_id: context.peerId,
                event_data: JSON.stringify({
                    type: "show_snackbar",
                    text: `🔔 Ваш ник теперь: ${user_nickname_save.name}`
                })
            })
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
    const bar_current = user.health/user.health_max
    const smile = user.type == "player" ? "👤" : "🤖"
    let bar = ''
    for (let i = 0; i <= 1; i += 0.1) {
        bar += (i < bar_current) ? '🟥' : '◻'
    }
    return `${smile}: ${bar} [${(bar_current*100).toFixed(2)}%]\n ❤${user.health}/${user.health_max} ⚔${user.atk} 🌀${user.mana} [${user.name}]`
}

export async function Battle_Init(context: any) {
    //const attached = await Image_Random(context, "bank")
    const user: User | null = await prisma.user.findFirst({ where: { idvk: context.peerId } })
    const mob = {
        "Парк": [{ name: "Слизь", type: "bot", atk: 1, health: 4, health_max: 4, mana: 0}], 
        "Магазин": [{ name: "Пчела", type: "bot", atk: 2, health: 2, health_max: 2, mana: 0}], 
        "Метро": [{ name: "Мышь Черная", type: "bot", atk: 2, health: 2, health_max: 2, mana: 0},{ name: "Мышь Серая", type: "bot", atk: 1, health: 4, health_max: 4, mana: 0}]
    }
    console.log("🚀 ~ file: contoller.ts:336 ~ Battle_Init ~ mob[user.location]:", mob[user.location])
    const enemy = mob[user.location][randomInt(0, mob[user.location].length)] || mob[user.location]
    const player = { name: `${user?.name}`, type: "player", atk: `${user?.atk}`, health: `${user?.hp}`, health_max: `${user?.hp}`, mana: `${user?.mana}`}
    
    const turn = randomInt(0, 100) > 50 ? true : false
    const keyboard = new KeyboardBuilder()
    .callbackButton({ label: 'Атака', payload: { command: 'user_attack', player, enemy, turn }, color: 'secondary' })
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${turn ? "Вам повезло, вы первым заметили врага" : "Вы не заметили врага и он атаковал вас"}\n${await User_Print(player)}\n${await User_Print(enemy)}`, keyboard: keyboard/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 ${turn ? "Ваш ход" : "Враг атаковал вас"}`
        })
    })
}

export async function User_Attack(context: any) {
    const player = context.eventPayload.player
    const enemy = context.eventPayload.enemy
    const turn = context.eventPayload.turn
    let event = ''
    if (turn) {
        player.health -= enemy.atk
        event += `Вы нанесли  💥${player.atk}\n`
        enemy.health -= player.atk
        event += `Враг нанес  💥${enemy.atk}\n`
    } else {
        enemy.health -= player.atk
        event += `Враг нанес  💥${enemy.atk}\n`
        player.health -= enemy.atk
        event += `Вы нанесли  💥${player.atk}\n`
    }
    const keyboard = new KeyboardBuilder()
    if (player.health <= 0 || enemy.health <= 0) {
        if (player.health <= 0 ) {
            event += `Вы умерли 💥${player.name} Попробуйте снова, владыка демонов!\n`
            keyboard.callbackButton({ label: 'Возродиться', payload: { command: 'user_revival', player, enemy, turn }, color: 'secondary' })
        }
        if (enemy.health <= 0) {
            event += `Вы одежрали победу над 💥${enemy.name}. Поздравляем!\n`
            keyboard.callbackButton({ label: 'Победа Нафиг', payload: { command: 'user_win', player, enemy, turn }, color: 'secondary' })
        }
    } else {
        keyboard.callbackButton({ label: 'Атака', payload: { command: 'user_attack', player, enemy, turn }, color: 'secondary' })
    }
    keyboard.inline().oneTime()        
    await vk.api.messages.edit({peer_id: context.peerId, conversation_message_id: context.conversationMessageId, message: `${event}\n${await User_Print(player)}\n${await User_Print(enemy)}`, keyboard: keyboard/*, attachment: attached.toString()*/ })
    await vk.api.messages.sendMessageEventAnswer({
        event_id: context.eventId,
        user_id: context.userId,
        peer_id: context.peerId,
        event_data: JSON.stringify({
            type: "show_snackbar",
            text: `🔔 ${turn ? "Ваш ход" : "Враг атаковал вас"}`
        })
    })
}
