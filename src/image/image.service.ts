import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { setLog } from "../common/logger.helper";
import { Image } from "./dto/image-response.dto";
import axiosRetry from 'axios-retry';
import { filterAndTransform } from "../common/response-transform.helper";

@Injectable()
export class ImagesService {
    constructor(private readonly httpService: HttpService) {
        // Applying retry logic to Axios HTTP requests.
        axiosRetry(this.httpService.axiosRef, {
            retries: 3, // Number of retries
            retryDelay: axiosRetry.exponentialDelay, // delay duration before we retry again
            retryCondition: (error) => {
                // Retry on specific error conditions, e.g., status codes 500 and 502
                return error.response?.status === 500 || error.response?.status === 502;
            }
        });
    }

    /**
     * Getting images from 3 thirdparty Image search services
     * 
     * @param query image keywords
     * @returns 
     */
    async fetchImages(query: string) {
        const imageRequest = [
            this.fetchFromPixabay(query),
            this.fetchFromUnsplash(query),
        ];

        try {
            setLog({
                level: 'info',
                method: 'ImageService.fetchImages',
                message: `Fetching image with query: ${query}`,
            });

            const results = await Promise.allSettled(imageRequest);

            setLog({
                level: 'info',
                method: 'ImageService.fetchImages',
                message: `success`,
            });

            // Handle fulfilled and rejected results separately
            return filterAndTransform(results);
        } catch (err) {
            setLog({
                level: 'error',
                method: 'ImageService.fetchImages',
                message: `Fetching image with query: ${query}`,
                error: err.message,
            });
            throw new Error(`Failed to fetch image from APIs, with query: ${query}`);
        }
    }

    /**
     * Get image from Unsplash
     * 
     * @param query image keywords
     * @returns 
     */
    async fetchFromUnsplash(query: string): Promise<Image[]> {
        setLog({
            level: 'info',
            method: 'ImageService.fetchFromUnsplash',
            message: `Fetching image with query: ${query}`,
        });

        try {
            // Make the API call
            const apiResponse = await lastValueFrom(
                this.httpService.get(
                    `${process.env.UNSPLASH_URL}?page=1&per_page=3&query=${query}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
                )
            );

            // Check if apiResponse or data.results is undefined
            if (!apiResponse.data.results) {
                setLog({
                    level: 'warn',
                    method: 'ImageService.fetchFromUnsplash',
                    message: `No results found for query: ${query}`,
                });
                return []; // Return an empty array if no results
            }

            const result = apiResponse.data.results;

            setLog({
                level: 'info',
                method: 'ImageService.fetchFromUnsplash',
                message: `success fetch image from Unsplash`,
            });

            return result;
        } catch (err) {
            setLog({
                level: 'error',
                method: 'ImageService.fetchFromUnsplash',
                message: `Failed to fetch images from Unsplash for query: ${query}`,
                error: err.message,
            });

            return []; // Return empty array on error
        }
    }

    /**
     * Get image from Pixabay
     * 
     * @param query image keywords
     * @returns 
     */
    async fetchFromPixabay(query: string): Promise<Image[]> {
        setLog({
            level: 'info',
            method: 'ImageService.fetchFromPixabay',
            message: `Fetching image with query: ${query}`,
        });

        try {
            // Make the API call
            const apiResponse = await lastValueFrom(
                this.httpService.get(
                    `${process.env.PIXABAY_URL}?key=${process.env.PIXABAY_API_KEY}&page=1&per_page=3&q=${query}`
                )
            );

            // Check if apiResponse or data.hits is undefined
            if (!apiResponse?.data?.hits) {
                setLog({
                    level: 'warn',
                    method: 'ImageService.fetchFromPixabay',
                    message: `No hits found for query: ${query}`,
                });
                return []; // Return empty array if no hits
            }

            const result = apiResponse.data.hits;

            setLog({
                level: 'info',
                method: 'ImageService.fetchFromPixabay',
                message: `success fetch image from Pixabay`,
            });

            return result;
        } catch (err) {
            setLog({
                level: 'error',
                method: 'ImageService.fetchFromPixabay',
                message: `Failed to fetch images from Pixabay for query: ${query}`,
                error: err.message,
            });

            return []; // Return empty array if error occurs
        }
    }
}
