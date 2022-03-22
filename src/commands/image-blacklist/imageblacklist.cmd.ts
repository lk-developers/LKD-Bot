import {
	ApplicationCommandStructure,
	Constants,
	EmbedOptions,
	Guild,
} from "eris";
import {
	CustomClient,
	CustomCommandInteraction,
} from "../../helpers/CustomClient";
import { DatabaseService } from "../../service/DatabaseService";
import { HashService } from "../../service/HashService";
import {
	Colors,
	getErrorReply,
	getSuccessReply,
	getUrlRegex,
} from "../../util/common.util";

const prisma = DatabaseService.getClient();

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

	const hasPermission = interaction.member.permissions.has("administrator");

	if (!hasPermission) {
		return interaction.createFollowup(
			getErrorReply("You don't have permission to run this command!")
		);
	}

	const subcommand = interaction.options.getSubCommand();

	switch (subcommand) {
		case "add-image":
			await addImage(interaction, guild);
			break;

		case "view-images":
			await viewImages(interaction, guild);
			break;

		case "remove-image":
			await removeImage(interaction, guild);
			break;
	}
}

async function addImage(interaction: CustomCommandInteraction, guild: Guild) {
	const url = interaction.options.getString("url", true);

	if (!getUrlRegex().test(url)) {
		return interaction.editOriginalMessage(
			getErrorReply("Please provide a valid URL.")
		);
	}

	const hash = await HashService.getPhash(url);

	const ext = url.split(".").pop()?.toLowerCase() || "none";

	if (!["png", "jpeg", "jpg"].includes(ext)) {
		return interaction.editOriginalMessage(
			getErrorReply("Please provide a URL of a PNG, JPG or JPEG file.")
		);
	}

	if (!hash) {
		return interaction.editOriginalMessage(
			getErrorReply("Failed to calculate the phash.")
		);
	}

	const existing = await prisma.guildImageBlacklist.findFirst({
		where: { hash, guildID: guild.id },
	});

	if (existing) {
		return interaction.editOriginalMessage(
			getErrorReply("This hash already exists in the blacklist.")
		);
	}

	await prisma.guildImageBlacklist.create({
		data: {
			hash,
			url: url,
			guildID: guild.id,
		},
	});

	await interaction.editOriginalMessage(
		getSuccessReply("Image has been blacklisted.")
	);
}

async function viewImages(interaction: CustomCommandInteraction, guild: Guild) {
	const records = await prisma.guildImageBlacklist.findMany({
		where: { guildID: guild.id },
	});

	const embed: EmbedOptions = {
		title: "Image Blacklist",
		color: Colors.LKD_YELLOW,
		description:
			records
				.map((r, i) => `${i + 1}) [Link](${r.url}) [ID: ${r.id}]`)
				.join("\n") || "None",
	};

	await interaction.editOriginalMessage({ embeds: [embed] });
}

async function removeImage(
	interaction: CustomCommandInteraction,
	_guild: Guild
) {
	const id = interaction.options.getInteger("id", true);

	const existing = await prisma.guildImageBlacklist.findFirst({
		where: { id },
	});

	if (!existing) {
		return interaction.editOriginalMessage(
			getErrorReply("Entry with the given ID doesn't exist.")
		);
	}

	await prisma.guildImageBlacklist.delete({
		where: {
			id,
		},
	});

	await interaction.editOriginalMessage(
		getSuccessReply("Image has been removed from the blacklist.")
	);
}

export = {
	execute,
	options: {
		name: "imageblacklist",
		description: "Manage image blacklist for this server",
		options: [
			{
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
				name: "add-image",
				description: "Add image to server image blacklist",
				options: [
					{
						type: Constants.ApplicationCommandOptionTypes.STRING,
						name: "url",
						description: "URL of the image you want to blacklist",
						required: true,
					},
				],
			},
			{
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
				name: "view-images",
				description: "View images in the server image blacklist",
			},
			{
				type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
				name: "remove-image",
				description: "Remove image from the server image blacklist",
				options: [
					{
						type: Constants.ApplicationCommandOptionTypes.INTEGER,
						name: "id",
						description: "ID of the entry you want to remove",
						required: true,
					},
				],
			},
		],
		type: Constants.ApplicationCommandTypes.CHAT_INPUT,
	} as ApplicationCommandStructure,
};
