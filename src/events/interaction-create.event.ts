import { Interaction, AutocompleteInteraction } from "eris";
import { CustomClient } from "../helpers/CustomClient";
import { NewsService } from "../service/NewsService";

async function execute(interaction: Interaction, client: CustomClient) {
	try {
		if (interaction instanceof AutocompleteInteraction) {
			await NewsService.checkAutocomplete(interaction);
		}
	} catch (e) {
		client.logger.error(e);
	}
}

export = {
	name: "interactionCreate",
	once: false,
	execute,
};
