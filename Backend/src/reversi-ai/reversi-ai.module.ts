import { Global, Module } from '@nestjs/common';
import { ReversiAiService } from './reversi-ai.service';

@Global()
@Module({
  providers: [ReversiAiService],
  exports: [ReversiAiService]
})
export class ReversiAiModule {}
