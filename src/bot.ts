import { CustomClient } from "./helpers/CustomClient";
import { getBotConfig } from "./util/config.util";

const config = getBotConfig();

async function initializeBot() {
	const client = new CustomClient(config["TOKEN"], {
		intents: ["guilds", "guildMessages", "guildMembers"],
		allowedMentions: { users: true },
	});

	await client.connect();
}

initializeBot();
