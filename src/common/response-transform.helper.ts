import { Image } from "src/image/dto/image-response.dto";
import { v4 as uuidv4 } from 'uuid'; // Use this library to generate unique IDs

export const imageSources = {
    PIXABAY: 'pixabay',
    UNSPLASH: 'unsplash',
    STORYBLOCK: 'storyblock',
  } as const;


  export const transformPixabayToImageSchema = (image: any): Image => {
    if (!image.id) {
        console.warn(`Pixabay image missing ID: ${JSON.stringify(image)}`);
    }
    return {
        id: uuidv4(),
        imageId: image.id || 'default_image_id', // Fallback to a default value
        thumbnail: image.pageURL || null,
        preview: image.previewURL || null,
        title: null,
        source: imageSources.PIXABAY,
        tags: image.tags ? image.tags.split(',').map(tag => tag.trim()) : [],
    };
};

export const transformUnsplashToImageSchema = (image: any): Image => {
    if (!image.id) {
        console.warn(`Unsplash image missing ID: ${JSON.stringify(image)}`);
    }
    return {
        id: uuidv4(),
        imageId: image.id || 'default_image_id', // Fallback to a default value
        thumbnail: image.cover_photo?.urls?.small || null,
        preview: image.cover_photo?.urls?.thumb || null,
        title: image.title || null,
        source: imageSources.UNSPLASH,
        tags: image.tags
            ? image.tags
                  .filter(tag => tag.title) // Filter out objects without a `title` property
                  .map(tag => tag.title)
            : [],
    };
};

/**
 * Only get result where the promise is fulfilled
 * 
 * @param results 
 * @returns Image[]
 * 
 */
export const filterAndTransform = <T>(
    results: PromiseSettledResult<T>[]
): Image[] => {
    const images: Image[] = [];

    // Process results[0] (Pixabay)
    if (results[0]?.status === "fulfilled") {
        const pixabayImages = (results[0] as PromiseFulfilledResult<any[]>).value.map(
            transformPixabayToImageSchema
        );
        images.push(...pixabayImages);
    }

    // Process results[1] (Unsplash)
    if (results[1]?.status === "fulfilled") {
        const unsplashImages = (results[1] as PromiseFulfilledResult<any[]>).value.map(
            transformUnsplashToImageSchema
        );
        images.push(...unsplashImages);
    }

    return images;
}