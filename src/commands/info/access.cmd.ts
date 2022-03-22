import {
	AnyGuildChannel,
	ApplicationCommandStructure,
	Constants,
	Member,
} from "eris";
import {
	CustomClient,
	CustomCommandInteraction,
} from "../../helpers/CustomClient";
import { Colors, getErrorReply } from "../../util/common.util";

async function execute(
	interaction: CustomCommandInteraction,
	client: CustomClient
) {
	await interaction.defer();

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

	const hasPermission = interaction.member.permissions.has("administrator");

	if (!hasPermission) {
		return interaction.createFollowup(
			getErrorReply("You don't have permission to run this command!")
		);
	}

	const channel = guild.channels.get(interaction.channel.id) as AnyGuildChannel;
	const members = await guild.fetchMembers();

	const allowedMembers: Member[] = [];

	for (const m of members) {
		if (m.user.bot) continue;

		const perms = channel.permissionsOf(m);

		if (perms.has("viewChannel") || perms.has("readMessages")) {
			allowedMembers.push(m);
		}
	}

	await interaction.createFollowup({
		embeds: [
			{
				title: "Nibbas with access to this channel",
				color: Colors.LKD_YELLOW,
				description: allowedMembers
					.map((m) => `${m.nick || m.username}`)
					.join("\n"),
			},
		],
	});
}

export = {
	execute,
	options: {
		name: "access",
		description: "Check who has access to the channel",
		type: Constants.ApplicationCommandTypes.CHAT_INPUT,
	} as ApplicationCommandStructure,
};
