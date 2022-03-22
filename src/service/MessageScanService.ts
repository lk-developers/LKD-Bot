import { Guild, Message } from "eris";
import { CustomClient } from "../helpers/CustomClient";
import { getUrlRegex } from "../util/common.util";
import { DatabaseService } from "./DatabaseService";
import { HashService } from "./HashService";

const prisma = DatabaseService.getClient();

export class MessageScanService {
	public static async checkMessage(msg: Message, client: CustomClient) {
		const guild = msg.guildID && client.guilds.get(msg.guildID);

		if (!guild || !msg.member) return;

		await this.checkImageBlacklist(guild, msg);
	}

	private static async checkImageBlacklist(guild: Guild, msg: Message) {
		const msgUrls = getUrlRegex().exec(msg.content);

		if (msgUrls?.length === 0 && msg.attachments.length === 0) return;

		const imageUrls: Set<string> = new Set();

		const allowedExts = ["png", "jpeg", "jpg", "webp"];

		if (msgUrls && msgUrls.length > 0) {
			for (const i of msgUrls) {
				if (!i) continue;

				const ext = i.split(".").pop() || "none";

				if (!allowedExts.includes(ext)) continue;

				imageUrls.add(i);
			}
		}

		for (const attachment of msg.attachments) {
			const ext = attachment.url.split(".").pop() || "none";

			if (!allowedExts.includes(ext)) continue;

			imageUrls.add(attachment.url);
		}

		for (const url of Array.from(imageUrls.values())) {
			const hash = await HashService.getPhash(url);
			if (!hash) continue;

			const blacklisted = await prisma.guildImageBlacklist.findFirst({
				where: { guildID: guild.id, hash },
			});

			if (!blacklisted) continue;

			await msg.channel.createMessage({
				content: `<@${msg.author.id}>, Stop posting weird shit 🤡!`,
				messageReference: { messageID: msg.id, failIfNotExists: false },
			});
		}
	}
}
