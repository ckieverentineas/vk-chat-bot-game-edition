import { PrismaClient } from "@prisma/client";
import { HearManager } from "@vk-io/hear";
import { randomInt } from "crypto";
import { send } from "process";
import { Attachment, Context, Keyboard, KeyboardBuilder, PhotoAttachment } from "vk-io";
import { IQuestionMessageContext } from "vk-io-question";
import * as fs from 'fs';
import { answerTimeLimit, chat_id, root, timer_text, vk } from '../index';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from "path";
import prisma from "./events/module/prisma_client";

export function registerUserRoutes(hearManager: HearManager<IQuestionMessageContext>): void {
    /*hearManager.hear(/Косой переулок/, async (context) => {
    })*/
}

    