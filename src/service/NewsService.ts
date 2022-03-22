import { AutocompleteInteraction } from "eris";
import axios from "axios";

export class NewsService {
	public static async checkAutocomplete(interaction: AutocompleteInteraction) {
		if (interaction.data.name !== "news") return;

		const option = interaction.data.options.find((o) => o.name === "keyword");
		if (!option) return;

		const keyword = (option as any).value.toLowerCase();

		const list = await this.getNewsList(keyword);
		const added: string[] = [];

		const choices = list
			.filter((i) => {
				if (added.includes(i.title)) {
					return false;
				} else {
					added.push(i.title);
					return true;
				}
			})
			.map((c) => {
				return {
					name: c.title.slice(0, 80) + ` (${c.sourceName})`,
					value: c.id.toString(),
				};
			});

		await interaction.acknowledge(choices.sort().slice(0, 25));
	}

	public static async getNewsPost(id: number) {
		const { data } = await axios.get(
			`https://apis.navinda.xyz/cn/api/v1.0/news/${id}`,
			{
				timeout: 5000,
			}
		);

		return data;
	}

	private static async getNewsList(keyword: string) {
		const { data } = await axios.get(
			"https://apis.navinda.xyz/cn/api/v1.0/news",
			{
				params: {
					languages: "en",
					keyword,
				},
				timeout: 5000,
			}
		);

		return data as Array<any>;
	}
}
