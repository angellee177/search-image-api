import { Resolver, Query,Args } from "@nestjs/graphql";
import { ImagesService } from "./image.service";
import { errorResponse, successResponse } from "../common/response.helper";
import { Image } from "./dto/image-response.dto";
import { setLog } from "../common/logger.helper";
import { GqlAuthGuard } from "src/auth/guard/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
export class ImagesResolver {
    constructor(private readonly imagesService: ImagesService) {
        setLog({
            level: 'info',
            method: 'ImageResolver',
            message: `ImageResolver instantiated`,
        });
    }

    @UseGuards(GqlAuthGuard)
    @Query(() => [Image])
    async images(@Args('query') query: string) {
        try {
            setLog({
                level: 'info',
                method: 'ImageResolver.images',
                message: `Started getting all images`,
            });

            const images = await this.imagesService.fetchImages(query);

            return images;
        } catch (err) {
            return errorResponse(`Failed to fetch images with query: ${query}`, err.message);
        }
    }
}