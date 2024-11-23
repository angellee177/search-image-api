import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { setLog } from "../common/logger.helper";
import axiosRetry from 'axios-retry';
import { filterAndTransform } from "../common/response-transform.helper";
import * as crypto from 'crypto'; 

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
            this.fetchFromStoryBlock(query),
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
    async fetchFromUnsplash(query: string) {
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
    async fetchFromPixabay(query: string) {
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

    async fetchFromStoryBlock(query: string) {
        const baseUrl = process.env.STORYBLOCK_BASE_URL
        const searchUrl = process.env.STORYBLOCK_SEARCH_URL
        const threeHoursInSeconds = 3 * 60 * 60; // Convert 3 hours to seconds
        const expirationTime = Math.floor(Date.now() / 1000) + threeHoursInSeconds;

        // Create an HMAC using SHA-256 algorithm with the secret key stored in environment variables.
        const hmacBuilder = crypto.createHmac('sha256', process.env.STORYBLOCK_API_KEY)
        // Adding the message (searchUrl) that needs to be authenticated (usually a URL or data) to the HMAC.
        const hmac = hmacBuilder.update(searchUrl).digest('hex'); // Generating the HMAC in hexadecimal format
        const storyBlockUrl = `${process.env.STORYBLOCK_BASE_URL}/${process.env.STORYBLOCK_SEARCH_URL}
            ?keywords= ${query}
            &page=1
            &num_results=3
            &APIKKEY=${process.env.STORYBLOCK_API_KEY}
            &EXPIRES=${expirationTime}
            &HMAC=${hmac}
            `


        setLog({
            level: 'info',
            method: 'ImageService.fetchFromStoryBlock',
            message: `Fetching image with query: ${query}`,
        });

        try {
            // Make the API call
            const apiResponse = await lastValueFrom(
                this.httpService.get(
                    `${process.env.STORYBLOCK_BASE_URL}/${process.env.STORYBLOCK_SEARCH_URL}
                    ?keywords= ${query}
                    &page=1
                    &num_results=3
                    %content_type=photos
                    &APIKKEY=${process.env.STORYBLOCK_API_KEY}
                    &EXPIRES=${expirationTime}
                    &HMAC=${hmac}
                    `
                )
            );

            // Check if apiResponse or data.hits is undefined
            if (!apiResponse?.data) {
                setLog({
                    level: 'warn',
                    method: 'ImageService.fetchFromStoryblock',
                    message: `No hits found for query: ${query}`,
                });
                return []; // Return empty array if no hits
            }

            const result = apiResponse.data.info;

            setLog({
                level: 'info',
                method: 'ImageService.fetchFromStoryBlocks',
                message: `success fetch image from StoryBlocks, result: ${JSON.stringify(apiResponse.data)}`,
            });

            return [];
        } catch (err) {
            setLog({
                level: 'error',
                method: 'ImageService.fetchFromStoryBlocks',
                message: `Failed to fetch images from StoryBlocks for query: ${query}`,
                error: err.message,
            });

            return []; // Return empty array if error occurs
        }
    }
}
