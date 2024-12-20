import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Configuración de variables de entorno global
    MarketplaceModule,
  ],
})
export class MainModule {}
