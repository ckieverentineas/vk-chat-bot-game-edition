import { VK, Keyboard, IMessageContextSendOptions, ContextDefaultState, MessageContext, VKAppPayloadContext, KeyboardBuilder } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import {
    QuestionManager,
    IQuestionMessageContext
} from 'vk-io-question';
import { randomInt } from 'crypto';
import { timeStamp } from 'console';
import { registerUserRoutes } from './engine/player'
import { InitGameRoutes } from './engine/init';
import { send } from 'process';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { env } from 'process';
import prisma from './engine/events/module/prisma_client';
import { Battle_Init, Main_Menu_Init, Portal_Park, Portal_Shop, Portal_Underground, User_Add_Attack, User_Add_Health, User_Add_Mana, User_Attack, User_Info, User_Nickname, User_Nickname_Select } from './engine/events/contoller';
import { User } from '@prisma/client';
dotenv.config()

export const token: string = String(process.env.token)
export const root: number = Number(process.env.root) //root user
export const chat_id: number = Number(process.env.chat_id) //chat for logs
export const group_id: number = Number(process.env.group_id)//clear chat group
export const timer_text = { answerTimeLimit: 300_000 } // ожидать пять минут
export const answerTimeLimit = 300_000 // ожидать пять минут
//авторизация
export const vk = new VK({ token: token, pollingGroupId: group_id, apiLimit: 1 });
//инициализация
const questionManager = new QuestionManager();
const hearManager = new HearManager<IQuestionMessageContext>();

/*prisma.$use(async (params, next) => {
	console.log('This is middleware!')
	// Modify or interrogate params here
	console.log(params)
	return next(params)
})*/

//настройка
vk.updates.use(questionManager.middleware);
vk.updates.on('message_new', hearManager.middleware);

//регистрация роутов из других классов
InitGameRoutes(hearManager)
registerUserRoutes(hearManager)

let blocker: Array<1> = []
//миддлевар для предварительной обработки сообщений
vk.updates.on('message_new', async (context: any, next: any) => {
	if (context.peerType == 'chat') { 
		try { 
			await vk.api.messages.delete({'peer_id': context.peerId, 'delete_for_all': 1, 'cmids': context.conversationMessageId, 'group_id': group_id})
			console.log(`User ${context.senderId} sent message and deleted`)
			//await vk.api.messages.send({ peer_id: chat_id, random_id: 0, message: `✅🚫 @id${context.senderId} ${context.text}`})  
		} catch (error) { 
			console.log(`User ${context.senderId} sent message and can't deleted`)
			//await vk.api.messages.send({ peer_id: chat_id, random_id: 0, message: `⛔🚫 @id${context.senderId} ${context.text}`}) 
		}  
		return
	}
	//проверяем есть ли пользователь в базах данных
	const user_check = await prisma.user.findFirst({ where: { idvk: context.senderId } })
	//если пользователя нет, то начинаем регистрацию
	if (!user_check) {
		//согласие на обработку
		const answer = await context.question(`⌛ Открыть глаза? Открыв глаза вы автоматически даете свое согласие на обработку персональных данных`,
			{	
				keyboard: Keyboard.builder()
				.textButton({ label: 'Открыть глаза👀', payload: { command: 'Согласиться' }, color: 'positive' }).row()
				.textButton({ label: '👣', payload: { command: 'Отказаться' }, color: 'negative' }).oneTime(),
				answerTimeLimit
			}
		);
		if (answer.isTimeout) { return await context.send(`⏰ Время ожидания подтверждения согласия истекло!`) }
		if (!/Открыть глаза👀/i.test(answer.text|| '{}')) {
			await context.send('⌛ Вы отказались дать свое согласие!');
			return;
		}
		const user_creation: User = await prisma.user.create({data: {idvk: context.senderId}})
		//приветствие игрока
		const visit = await context.question(`⌛ Вы смотрели телик, как вдруг по всем каналам стали показывать, что повсюду стали открываться порталы, что они нам принесут, никто не знает, но народ уже пачками в них попер, а вы что?`,
			{ 	
				keyboard: Keyboard.builder()
				.callbackButton({ label: 'Выйти на улицу', payload: { command: 'system_call' }, color: 'positive' }).oneTime().inline(),
				answerTimeLimit
			}
		);
		if (visit.isTimeout) { return await context.send(`⏰ Время ожидания активности истекло!`) }
	} else {
		const visit = await context.send(`⌛ Погода сегодня солнечная, идти фармить?`,
			{ 	
				keyboard: Keyboard.builder()
				.callbackButton({ label: 'Выйти на улицу', payload: { command: 'system_call' }, color: 'positive' }).oneTime().inline(),
				answerTimeLimit
			}
		);
	}
	return next();
})
vk.updates.on('message_event', async (context: any, next: any) => { 
	const config: any = {
		"system_call": Main_Menu_Init,
		"portal_shop": Portal_Shop,
		"portal_underground": Portal_Underground,
		"portal_park": Portal_Park,
		"user_info": User_Info,
		"user_add_attack": User_Add_Attack,
		"user_add_health": User_Add_Health,
		"user_add_mana": User_Add_Mana,
		"user_nickname": User_Nickname,
		"user_nickname_select": User_Nickname_Select,
		"battle_init": Battle_Init,
		"user_attack": User_Attack
	}
	try {
		await config[context.eventPayload.command](context)
	} catch (e) {
		console.log(`Ошибка события ${e}`)
	}
	return await next();
})

vk.updates.start().then(() => {
	console.log('Servers game edition ready for services clients!')
}).catch(console.error);
