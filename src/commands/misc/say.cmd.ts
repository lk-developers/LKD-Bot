import { ApplicationCommandStructure, Constants, Message } from "eris";
import { promisify } from "util";
import {
	CustomClient,
	CustomCommandInteraction,
} from "../../helpers/CustomClient";
import { getErrorReply, getSuccessReply } from "../../util/common.util";

const sleep = promisify(setTimeout);

async function execute(
	interaction: CustomCommandInteraction,
	client: CustomClient
) {
	await interaction.defer(64);

	if (!interaction.guildID || !interaction.member) {
		return interaction.createFollowup(
			getErrorReply("This command can only be used inside servers.")
		);
	}

	const guild = client.guilds.get(interaction.guildID);

	if (!guild) {
		return interaction.createFollowup(
			getErrorReply("Failed to locate the Discord server.")
		);
	}

	const webhooks = await client.getChannelWebhooks(interaction.channel.id);

	let webhook = webhooks.find((w) => w.token);

	if (!webhook) {
		webhook = await client.createChannelWebhook(interaction.channel.id, {
			name: "LKD-Bot",
		});
	}

	if (!webhook.token) return;

	const member = interaction.options.getMember("member", true);
	const text = interaction.options.getString("text", true);

	const message = await client.executeWebhook(webhook.id, webhook.token, {
		avatarURL: member.avatarURL,
		username: member.nick || member.username,
		content: text,
		wait: true,
	});

	await interaction.editOriginalMessage(
		getSuccessReply("Message has been posted.")
	);

	await sleep(60000);

	if (message) {
		await client.editWebhookMessage(webhook.id, webhook.token, message.id, {
			content:
				text +
				` _[${interaction.member.username}#${interaction.member.discriminator}]_`,
		});
	}
}

export = {
	execute,
	options: {
		name: "say",
		description: "Say something as a member",
		options: [
			{
				type: Constants.ApplicationCommandOptionTypes.USER,
				name: "member",
				description: "Member in the server",
				required: true,
			},
			{
				type: Constants.ApplicationCommandOptionTypes.STRING,
				name: "text",
				description: "Message to post",
				required: true,
			},
		],
		type: Constants.ApplicationCommandTypes.CHAT_INPUT,
	} as ApplicationCommandStructure,
};
