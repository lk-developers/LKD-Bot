import { Message } from "eris";
import { CustomClient } from "../helpers/CustomClient";
import { MessageScanService } from "../service/MessageScanService";

async function execute(message: Message, client: CustomClient) {
	if (message.author.bot) return;

	try {
		await MessageScanService.checkMessage(message, client);
	} catch (e) {
		client.logger.error(e);
	}
}

export = {
	name: "messageCreate",
	once: false,
	execute,
};
