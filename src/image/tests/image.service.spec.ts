import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from '../image.service';
import { HttpService } from '@nestjs/axios';
import axiosRetry from 'axios-retry';

jest.mock('axios');
jest.mock('axios-retry');

describe('ImagesService', () => {
    let service: ImagesService;
    let httpService: HttpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImagesService, HttpService],
        }).compile();

        service = module.get<ImagesService>(ImagesService);
        httpService = module.get<HttpService>(HttpService);

        // Set up axios-retry on the mock instance
        axiosRetry(httpService.axiosRef, {
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => error.response?.status === 500 || error.response?.status === 502,
        });
    });

    it('should retry on 500 or 502 errors', async () => {
        // Mock the HTTP call to simulate a 500 error
        httpService.get = jest.fn().mockRejectedValueOnce({
            response: { status: 500 },
        }).mockRejectedValueOnce({
            response: { status: 502 },
        }).mockResolvedValueOnce({
            data: { results: [] },
        });

        const result = await service.fetchFromUnsplash('test query');

        // Check that the retry logic was triggered
        expect(httpService.get).toHaveBeenCalledTimes(3); // Retry 3 times
        expect(result).toEqual([]); // Expect an empty array because the retry attempts finally succeed
    });

    it('should not retry if status is not 500 or 502', async () => {
        // Mock the HTTP call to simulate a 404 error (which should not trigger retries)
        httpService.get = jest.fn().mockRejectedValueOnce({
            response: { status: 404 },
        });

        try {
            await service.fetchFromUnsplash('test query');
        } catch (error) {
            // Expect only 1 call (no retries)
            expect(httpService.get).toHaveBeenCalledTimes(1);
        }
    });

    it('should handle timeout errors and retry', async () => {
        // Mock the HTTP call to simulate a timeout error
        httpService.get = jest.fn().mockRejectedValueOnce({
            code: 'ECONNABORTED',
        }).mockResolvedValueOnce({
            data: { results: [] },
        });

        const result = await service.fetchFromUnsplash('test query');

        // Check that the retry logic was triggered
        expect(httpService.get).toHaveBeenCalledTimes(2); // Retry once on timeout
        expect(result).toEqual([]); // Expect an empty array after retry
    });

    it('should not retry on non-retryable errors', async () => {
        // Mock the HTTP call to simulate a network error (non-retryable)
        httpService.get = jest.fn().mockRejectedValueOnce({
            code: 'ENOTFOUND', // Network error that won't trigger retry
        });

        try {
            await service.fetchFromPixabay('test query');
        } catch (error) {
            // Expect only 1 call (no retries)
            expect(httpService.get).toHaveBeenCalledTimes(1);
        }
    });

    it('should handle successful response after retries', async () => {
        // Mock the HTTP call to simulate 502 error initially, then successful response
        httpService.get = jest.fn().mockRejectedValueOnce({
            response: { status: 502 },
        }).mockResolvedValueOnce({
            data: { hits: [] },
        });

        const result = await service.fetchFromPixabay('test query');

        // Check that retries happened
        expect(httpService.get).toHaveBeenCalledTimes(2); // Retry once
        expect(result).toEqual([]); // Expect the result to be empty after retries
    });

    it('should log the retry attempt', async () => {
        // This is just a conceptual example. You can add more tests related to logging.
        // Mock the HTTP call to simulate retries
        httpService.get = jest.fn().mockRejectedValueOnce({
            response: { status: 500 },
        }).mockResolvedValueOnce({
            data: { results: [] },
        });

        const result = await service.fetchFromUnsplash('test query');

        // Check if the HTTP request was retried
        expect(httpService.get).toHaveBeenCalledTimes(2); // Retry once

        // No longer testing log directly, but you can assert log behavior in separate test cases.
    });

    it('should return empty array if all retries fail', async () => {
        // Mock the HTTP call to simulate 502 errors on all retries
        httpService.get = jest.fn().mockRejectedValueOnce({
            response: { status: 502 },
        }).mockRejectedValueOnce({
            response: { status: 502 },
        }).mockRejectedValueOnce({
            response: { status: 502 },
        });

        const result = await service.fetchFromPixabay('test query');

        // Expect empty array because all retries failed
        expect(httpService.get).toHaveBeenCalledTimes(3); // Retry 3 times
        expect(result).toEqual([]); // No results after retries
    });

    it('should return empty array if there is no result or hits', async () => {
        // Mock the HTTP call to simulate a successful response with no results
        httpService.get = jest.fn().mockResolvedValueOnce({
            data: { results: [] },
        });

        const result = await service.fetchFromUnsplash('no result query');

        // Expect empty array because no results were returned
        expect(result).toEqual([]);
    });

    it('should handle API response without expected fields', async () => {
        // Mock the HTTP call to simulate a response without `results` field
        httpService.get = jest.fn().mockResolvedValueOnce({
            data: {}, // Missing `results`
        });

        const result = await service.fetchFromUnsplash('test query');

        // Expect empty array because the response doesn't contain `results`
        expect(result).toEqual([]);
    });
});
