import { Controller, Get } from '@nestjs/common';

// Lightweight check used by hosting/monitoring to see if the app is up
@Controller('health')
export class HealthController {
  // GET /api/health
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
