import { Test, TestingModule } from '@nestjs/testing';
import { ImagesResolver } from '../image.resolver';
import { ImagesService } from '../image.service';

describe('ImagesResolver', () => {
  let resolver: ImagesResolver;
  let service: ImagesService;

  const mockImages = [
    { id: '1', url: 'https://example.com/image1.jpg', description: 'Image 1' },
    { id: '2', url: 'https://example.com/image2.jpg', description: 'Image 2' },
  ];

  const mockImagesService = {
    fetchImages: jest.fn().mockResolvedValue(mockImages),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesResolver,
        {
          provide: ImagesService,
          useValue: mockImagesService,
        },
      ],
    }).compile();

    resolver = module.get<ImagesResolver>(ImagesResolver);
    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('images', () => {
    it('should return a list of images', async () => {
      const query = 'nature';
      const result = await resolver.images(query);

      expect(result).toEqual(mockImages);
      expect(service.fetchImages).toHaveBeenCalledWith(query);
    });

    it('should handle errors gracefully', async () => {
      const query = 'invalid_query';
      const errorMessage = 'Failed to fetch images';
      mockImagesService.fetchImages.mockRejectedValue(new Error(errorMessage));

      const result = await resolver.images(query);

      expect(result).toEqual({
        success: false,
        message: `Failed to fetch images with query: ${query}`,
        error: errorMessage,
      });
      expect(service.fetchImages).toHaveBeenCalledWith(query);
    });
  });
});
