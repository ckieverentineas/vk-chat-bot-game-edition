import { PrismaClient } from "@prisma/client";
import { HearManager } from "@vk-io/hear";
import { randomInt } from "crypto";
import { Keyboard, KeyboardBuilder } from "vk-io";
import { IQuestionMessageContext } from "vk-io-question";

const prisma = new PrismaClient()

export function InitGameRoutes(hearManager: HearManager<IQuestionMessageContext>): void {
	hearManager.hear(/init/, async (context: any) => {
		const location = ["Портал", "Парк", "Магазин", "Метро"]
		for (const i in location) {
			const location_create = await prisma.location.upsert({ create: { name: location[i] }, update: { name: location[i] }, where: { name: location[i] } })
			console.log(`Открыта новая локация: ${location_create.name}`)
		}	
		const region: any = [
			{
				region: [
					{ uid: 0, uid_dead: 0, road: [{ uid: 1 }, { uid: 7 }, { uid: 13 }], label: `${location[0]}`, name: "Первые открытые порталы", mob_min: 0, mob_max: 0, boss: 0 },
				], 
				target: location[0] 
			},
			{
				region: [
					{ uid: 1, uid_dead: 0, road: [{ uid: 2 }, { uid: 3 }], label: `${location[1]}`, name: "Памятник развлечениям", mob_min: 1, mob_max: 1, boss: 0 },
					{ uid: 2, uid_dead: 0, road: [{ uid: 4 }, { uid: 5 }], label: "Налево", name: "Турники", mob_min: 1, mob_max: 2, boss: 0 },
					{ uid: 3, uid_dead: 0, road: [{ uid: 4 }, { uid: 5 }], label: "Направо", name: "Круг обозрения", mob_min: 2, mob_max: 2, boss: 0 },
					{ uid: 4, uid_dead: 0, road: [{ uid: 6 }], label: "Налево", name: "Левое крыло", mob_min: 2, mob_max: 3, boss: 0 },
					{ uid: 5, uid_dead: 0, road: [{ uid: 6 }], label: "Направо", name: "Правое крыло", mob_min: 3, mob_max: 3, boss: 0 },
					{ uid: 6, uid_dead: 0, road: [{ uid: 0 }], label: "Войти", name: "Центральный холл", mob_min: 1, mob_max: 2, boss: 1 },
				], 
				target: location[1] 
			},
			{
				region: [
					{ uid: 7, uid_dead: 0, road: [{ uid: 8 }, { uid: 9 }], label: `${location[2]}`, name: "Центральный отдел", mob_min: 1, mob_max: 1, boss: 0 },
					{ uid: 8, uid_dead: 0, road: [{ uid: 10 }, { uid: 11 }], label: "Вниз", name: "Подвал", mob_min: 1, mob_max: 2, boss: 0 },
					{ uid: 9, uid_dead: 0, road: [{ uid: 10 }, { uid: 11 }], label: "Вверх", name: "Лестница на крышу", mob_min: 2, mob_max: 2, boss: 0 },
					{ uid: 10, uid_dead: 0, road: [{ uid: 12 }], label: "Вверх", name: "Дыра в потолке", mob_min: 2, mob_max: 3, boss: 0 },
					{ uid: 11, uid_dead: 0, road: [{ uid: 12 }], label: "Вниз", name: "Пожарная лестница", mob_min: 3, mob_max: 3, boss: 0 },
					{ uid: 12, uid_dead: 0, road: [{ uid: 0 }], label: "Вперед", name: "Задний двор", mob_min: 1, mob_max: 2, boss: 1 },
				], 
				target: location[2] 
			},
			{
				region: [
					{ uid: 13, uid_dead: 0, road: [{ uid: 14 }, { uid: 15 }], label: `${location[3]}`, name: "Станция метро", mob_min: 1, mob_max: 1, boss: 0 },
					{ uid: 14, uid_dead: 0, road: [{ uid: 16 }, { uid: 17 }], label: "Влево", name: "Проход с разбитым электропоездом", mob_min: 1, mob_max: 2, boss: 0 },
					{ uid: 15, uid_dead: 0, road: [{ uid: 16 }, { uid: 17 }], label: "Вправо", name: "Заваленный проход", mob_min: 2, mob_max: 2, boss: 0 },
					{ uid: 16, uid_dead: 0, road: [{ uid: 18 }], label: "Влево", name: "Провал под электропоездом", mob_min: 2, mob_max: 3, boss: 0 },
					{ uid: 17, uid_dead: 0, road: [{ uid: 18 }], label: "Вправо", name: "Щель в полу", mob_min: 3, mob_max: 3, boss: 0 },
					{ uid: 18, uid_dead: 0, road: [{ uid: 0 }], label: "Вперед", name: "Пространство под метро", mob_min: 1, mob_max: 2, boss: 1 },
				], 
				target: location[3] 
			}
		]
		for (const i in region) {
			const id_location: any = await prisma.location.findFirst({ where: { name: region[i].target }, select: { id: true } })
			console.log("🚀 ~ file: init.ts:59 ~ hearManager.hear ~ id_location:", id_location)
			for (const j in region[i].region) {
				const reg = region[i].region[j]
				const id_region: any = await prisma.region.findFirst({ where: { id_location: id_location.id,  uid: reg.uid }, select: { id: true } })
				if (!id_region) {
					const region_create: any = await prisma.region.create({ data: { id_location: id_location.id, uid_dead: reg.uid_dead, uid: reg.uid, road: JSON.stringify(reg.road), label: reg.label, name: reg.name, mob_min: reg.mob_min, mob_max: reg.mob_max, boss: reg.boss } })
					console.log(`Открыт новый регион: ${region_create.name}`)
				}
			}
		}
		const classify = ["игрок", "моб", "босс"]
		for (const i in classify) {
			const classify_create = await prisma.classify.upsert({ create: { name: classify[i] }, update: { name: classify[i] }, where: { name: classify[i] } })
			console.log(`Добавлен новый тип моба: ${classify_create.name}`)
		}	
		const creature: any = [
			{
				mob: [
					{ name: "Слизь", team: 'enemy', xp: 1, atk: 1, health: 4, health_max: 4, mana: 0, skill: { active: ['Атака'], passive: [], death: [] }, target_classify: classify[1] },
					{ name: "Слизень Босс", team: 'enemy', xp: 3, atk: 2, health: 8, health_max: 8, mana: 2, skill: { active: ['Атака'], passive: [], death: ['Разложение на обычных слизней'] }, target_classify: classify[2] }
				],
				target: location[1] 
			}, 
			{
				mob: [
					{ name: "Пчела", team: 'enemy', xp: 1, atk: 2, health: 2, health_max: 2, mana: 0, skill: { active: ['Атака'], passive: [], death: [] }, target_classify: classify[1] },
					{ name: "Пчела Босс", team: 'enemy', xp: 3, atk: 3, health: 6, health_max: 6, mana: 2, skill: { active: ['Атака', 'Медовое исцеление'], passive: [], death: [] }, target_classify: classify[2] },
				],
				target: location[2]
			}, 
			{
				mob: [
					{ name: "Мышь Черная", team: 'enemy', xp: 1, atk: 2, health: 2, health_max: 2, mana: 0, skill: { active: ['Атака'], passive: [], death: [] }, target_classify: classify[1] },
					{ name: "Мышь Серая", team: 'enemy', xp: 3, atk: 1, health: 4, health_max: 4, mana: 0, skill: { active: ['Атака'], passive: [], death: [] }, target_classify: classify[1] }
				],
				target: location[3]
			}
		]
		for (const i in creature) {
			const id_location: any = await prisma.location.findFirst({ where: { name: creature[i].target }, select: { id: true } })
			for (const j in creature[i].mob) {
				const reg: any = creature[i].mob[j]
				const id_classify: any = await prisma.classify.findFirst({ where: { name: reg.target_classify }, select: { id: true } })
				const id_region: any = await prisma.mob.findFirst({ where: { id_location: id_location?.id,  name: reg.name }, select: { id: true } })
				if (!id_region) {
					const creature_create: any = await prisma.mob.create({ data: { id_location: id_location.id, id_classify: id_classify.id, xp: reg.xp, name: reg.name, atk: reg.atk, health: reg.health, health_max: reg.health_max, mana: reg.mana, skill: JSON.stringify(reg.skill) } })
					console.log(`Добавлен новый моб: ${creature_create.name}`)
				} else {
					const creature_create: any = await prisma.mob.update({ where: { name: reg.name }, data: { id_location: id_location.id, id_classify: id_classify.id, xp: reg.xp, name: reg.name, atk: reg.atk, health: reg.health, health_max: reg.health_max, mana: reg.mana, skill: JSON.stringify(reg.skill) } })
					console.log(`Обновлен моб: ${creature_create.name}`)
				}
			}
		}
		console.log(`Init map completed`)

		context.send('Игра инициализированна успешно.')
	})
}