import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Image {
  @Field(() => ID)
  id: string;

  @Field()
  image_ID: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  preview?: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  source: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}
