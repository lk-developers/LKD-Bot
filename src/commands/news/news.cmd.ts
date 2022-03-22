import {
	ApplicationCommandStructure,
	Constants,
	InteractionDataOptionsString,
} from "eris";
import {
	CustomClient,
	CustomCommandInteraction,
} from "../../helpers/CustomClient";
import { NewsService } from "../../service/NewsService";
import { getErrorReply } from "../../util/common.util";

async function execute(
	interaction: CustomCommandInteraction,
	client: CustomClient
) {
	await interaction.defer();

	const newsId = (
		interaction.data.options?.find(
			(o) => o.name === "keyword"
		) as InteractionDataOptionsString
	).value;

	try {
		const news = await NewsService.getNewsPost(parseInt(newsId));
		await interaction.createFollowup(news.url);
	} catch (e) {
		client.logger.error(e);
		await interaction.createFollowup(
			getErrorReply("Sorry. Something went wrong.")
		);
	}
}

export = {
	execute,
	options: {
		name: "news",
		description: "Search Sri Lankan News",
		options: [
			{
				name: "keyword",
				description: "Type a keyword to search",
				type: Constants.ApplicationCommandOptionTypes.STRING,
				required: true,
				autocomplete: true,
			},
		],
		type: Constants.ApplicationCommandTypes.CHAT_INPUT,
	} as ApplicationCommandStructure,
};
