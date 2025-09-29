import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'XO Baby Backend API',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      message: 'XO Baby Backend is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test')
  getTest() {
    console.log('🧪 Test endpoint accessed at:', new Date().toISOString());
    return {
      status: 'working',
      message: 'Test endpoint is accessible',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
} 