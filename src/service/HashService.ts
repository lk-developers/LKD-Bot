import { request } from "undici";
import { LogService } from "./LogService";
import { imageHash } from "image-hash";

const logger = LogService.getLogger();

export class HashService {
	public static async getPhash(url: string): Promise<string | false> {
		return new Promise(async (resolve) => {
			try {
				const { body } = await request(url);
				const data = Buffer.from(await body.arrayBuffer());
				imageHash({ data: data }, 16, true, (error: any, data: any) => {
					if (error) {
						logger.error(error, "something went wrong creating phash");
						resolve(false);
					}
					resolve(data);
				});
			} catch (e) {
				logger.error(e, "something went wrong in phash service");
				resolve(false);
			}
		});
	}
}
