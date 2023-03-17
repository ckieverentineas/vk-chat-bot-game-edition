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
					{ uid: 0, road: [{ uid: 1 }, { uid: 7 }, { uid: 13 }], label: `${location[0]}`, name: "Первые открытые порталы", mob_min: 0, mob_max: 0 },
				], 
				target: location[0] 
			},
			{
				region: [
					{ uid: 1, road: [{ uid: 2 }, { uid: 3 }], label: `${location[1]}`, name: "Памятник развлечениям", mob_min: 1, mob_max: 1 },
					{ uid: 2, road: [{ uid: 4 }, { uid: 5 }], label: "Налево", name: "Турники", mob_min: 1, mob_max: 2 },
					{ uid: 3, road: [{ uid: 4 }, { uid: 5 }], label: "Направо", name: "Круг обозрения", mob_min: 2, mob_max: 2 },
					{ uid: 4, road: [{ uid: 6 }], label: "Налево", name: "Левое крыло", mob_min: 2, mob_max: 3 },
					{ uid: 5, road: [{ uid: 6 }], label: "Направо", name: "Правое крыло", mob_min: 3, mob_max: 3 },
					{ uid: 6, road: [{ uid: 0 }], label: "Войти", name: "Центральный холл", mob_min: 1, mob_max: 2 },
				], 
				target: location[1] 
			},
			{
				region: [
					{ uid: 7, road: [{ uid: 8 }, { uid: 9 }], label: `${location[2]}`, name: "Центральный отдел", mob_min: 1, mob_max: 1 },
					{ uid: 8, road: [{ uid: 10 }, { uid: 11 }], label: "Вниз", name: "Подвал", mob_min: 1, mob_max: 2 },
					{ uid: 9, road: [{ uid: 10 }, { uid: 11 }], label: "Вверх", name: "Лестница на крышу", mob_min: 2, mob_max: 2 },
					{ uid: 10, road: [{ uid: 12 }], label: "Вверх", name: "Дыра в потолке", mob_min: 2, mob_max: 3 },
					{ uid: 11, road: [{ uid: 12 }], label: "Вниз", name: "Пожарная лестница", mob_min: 3, mob_max: 3 },
					{ uid: 12, road: [{ uid: 0 }], label: "Вперед", name: "Задний двор", mob_min: 1, mob_max: 2 },
				], 
				target: location[2] 
			},
			{
				region: [
					{ uid: 13, road: [{ uid: 14 }, { uid: 15 }], label: `${location[3]}`, name: "Станция метро", mob_min: 1, mob_max: 1 },
					{ uid: 14, road: [{ uid: 16 }, { uid: 17 }], label: "Влево", name: "Проход с разбитым электропоездом", mob_min: 1, mob_max: 2 },
					{ uid: 15, road: [{ uid: 16 }, { uid: 17 }], label: "Вправо", name: "Заваленный проход", mob_min: 2, mob_max: 2 },
					{ uid: 16, road: [{ uid: 18 }], label: "Влево", name: "Провал под электропоездом", mob_min: 2, mob_max: 3 },
					{ uid: 17, road: [{ uid: 18 }], label: "Вправо", name: "Щель в полу", mob_min: 3, mob_max: 3 },
					{ uid: 18, road: [{ uid: 0 }], label: "Вперед", name: "Пространство под метро", mob_min: 1, mob_max: 2 },
				], 
				target: location[3] 
			}
		]
		for (const i in region) {
			const id_location: any = await prisma.location.findFirst({ where: { name: region[i].target }, select: { id: true } })
			for (const j in region[i].region) {
				const reg = region[i].region[j]
				const id_region: any = await prisma.region.findFirst({ where: { id_location: id_location?.id,  uid: reg.uid }, select: { id: true } })
				if (!id_region) {
					const region_create: any = await prisma.region.create({ data: { id_location: id_location.id, uid: reg.uid, road: JSON.stringify(reg.road), label: reg.label, name: reg.name, mob_min: reg.mob_min, mob_max: reg.mob_max } })
					console.log(`Открыт новый регион: ${region_create.name}`)
				}
			}
			
		}
		console.log(`Init map completed`)

		context.send('Игра инициализированна успешно.')
	})
}