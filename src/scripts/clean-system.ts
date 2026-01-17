import { AppDataSource } from '../db/data-source';
import { env, connectRedis } from '../libs';
import { initServices, getServices } from '../services';
import { appRepository } from '../repositories/app';

async function cleanSystem() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();

    console.log('🔄 Connecting to Redis...');
    await connectRedis();

    console.log('🔄 Initializing services...');
    initServices();

    const { appService } = getServices();

    const appCode = env.APP_CODE || 'SYSTEM';
    const appNamespace = env.APP_ENV || 'dev';

    console.log(`🔍 Looking for existing app with code: ${appCode}`);

    // Find existing app
    const existingApp = await appService.getByCode(appCode);

    if (existingApp) {
      console.log(
        `🗑️  Deleting existing app: ${existingApp.name} (${existingApp.code}) with cascade...`
      );

      // Hard delete the app (cascade will delete all related configs and api keys)
      await appRepository.delete({ id: existingApp.id });

      console.log('✅ App deleted successfully with all related data');
    } else {
      console.log('ℹ️  No existing app found');
    }

    console.log(`🔨 Creating new app with code: ${appCode}`);

    // Create new app with base config
    const newApp = await appService.create({
      code: appCode,
      name: 'System App',
      namespace: appNamespace,
    });

    console.log(`✅ App created successfully: ${newApp.name} (${newApp.code})`);
    console.log(`📋 App ID: ${newApp.id}`);
    console.log(`🌍 Namespace: ${appNamespace}`);

    console.log('✨ Clean system completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during clean system:', error);
    process.exit(1);
  }
}

cleanSystem();
