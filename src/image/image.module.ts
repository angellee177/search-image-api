import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ImagesService } from "./image.service";
import { ImagesResolver } from "./image.resolver";

@Module({
    imports: [HttpModule],
    providers: [ImagesService, ImagesResolver],
    exports: [ImagesService]
})
export class ImagesModule {}
