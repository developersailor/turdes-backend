import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
