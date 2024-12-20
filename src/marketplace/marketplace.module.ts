import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService], // Exportar el servicio si otros módulos lo necesitan
})
export class MarketplaceModule {}
