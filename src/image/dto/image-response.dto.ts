import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Image {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  imageId?: string = `fallback-${Date.now()}`;

  /**
   * Pixabay will get from pageUrl, 
   * Unsplash will get from small, format 400px
   */
  @Field({ nullable: true }) // thumbnailUrl
  thumbnail?: string;

  /**
   * should be small size range from 150px - 200px
   * 
   * Pixabay will get from previewUrl
   * Unspalsh will get from thumb
   */
  @Field({ nullable: true })
  preview?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  source?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
