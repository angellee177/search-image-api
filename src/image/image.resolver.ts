import { Resolver, Query,Args } from "@nestjs/graphql";
import { ImagesService } from "./image.service";
import { errorResponse, successResponse } from "../common/response.helper";
import { Image } from "./dto/image-response.dto";
import { setLog } from "../common/logger.helper";

@Resolver()
export class ImagesResolver {
    constructor(private readonly imagesService: ImagesService) {
        setLog({
            level: 'info',
            method: 'ImageResolver',
            message: `ImageResolver instantiated`,
        });
    }

    @Query(() => [Image])
    async images(@Args('query') query: string) {
        try {
            const images = await this.imagesService.fetchImages(query);

            return images;
        } catch (err) {
            return errorResponse(`Failed to fetch images with query: ${query}`, err.message);
        }
    }
}