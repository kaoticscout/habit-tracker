#!/usr/bin/env node

/**
 * Supabase Setup Helper Script
 * Run with: node scripts/setup-supabase.js
 * 
 * This script helps validate your Supabase connection and set up the database schema.
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Supabase Setup Helper for Routinely\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please set up your .env file with your Supabase connection string');
    console.error('Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1');
    process.exit(1);
  }

  // Validate it's a Supabase URL
  if (!process.env.DATABASE_URL.includes('supabase.co')) {
    console.log('⚠️  DATABASE_URL doesn\'t appear to be a Supabase connection string');
    console.log('This script is optimized for Supabase, but will continue anyway...');
  }

  console.log('✅ DATABASE_URL is configured');

  // Generate Prisma client
  const generateResult = runCommand('npx prisma generate', 'Generating Prisma client');
  if (!generateResult) {
    console.error('Failed to generate Prisma client. Please check your schema.');
    process.exit(1);
  }

  // Test database connection
  console.log('\n🔄 Testing database connection...');
  try {
    const testResult = runCommand('npx prisma db pull --print', 'Testing database connection');
    if (testResult) {
      console.log('✅ Database connection successful');
    }
  } catch (error) {
    console.error('❌ Database connection failed');
    console.error('Please check your DATABASE_URL and ensure your Supabase project is running');
    console.error('Common issues:');
    console.error('- Incorrect password in connection string');
    console.error('- Wrong project reference ID');
    console.error('- Supabase project not fully initialized (wait 2-3 minutes after creation)');
    process.exit(1);
  }

  // Deploy schema
  console.log('\n🔄 Deploying database schema...');
  const deployResult = runCommand('npx prisma migrate deploy', 'Deploying database schema');
  
  if (deployResult) {
    console.log('✅ Database schema deployed successfully');
  } else {
    console.log('⚠️  Schema deployment had issues. Trying alternative approach...');
    
    // Try db push as alternative
    const pushResult = runCommand('npx prisma db push', 'Pushing schema to database');
    if (pushResult) {
      console.log('✅ Database schema pushed successfully');
    } else {
      console.error('❌ Failed to deploy schema. Please check your Supabase dashboard');
      console.error('You may need to manually run the SQL schema from SUPABASE_SETUP.md');
      process.exit(1);
    }
  }

  // Verify schema
  console.log('\n🔄 Verifying database schema...');
  try {
    const introspectResult = runCommand('npx prisma db pull --print', 'Verifying schema');
    if (introspectResult && introspectResult.includes('model User')) {
      console.log('✅ Database schema verification successful');
    } else {
      console.log('⚠️  Schema verification inconclusive - please check manually');
    }
  } catch (error) {
    console.log('⚠️  Could not verify schema automatically');
  }

  // Success message
  console.log('\n🎉 Supabase setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test the application at http://localhost:3000');
  console.log('3. Check your Supabase dashboard to see the created tables');
  console.log('4. When ready, deploy to Vercel with the same DATABASE_URL');
  
  console.log('\n📚 Documentation:');
  console.log('- Detailed setup: SUPABASE_SETUP.md');
  console.log('- Deployment guide: DEPLOYMENT.md');
  console.log('- Deployment checklist: DEPLOYMENT_CHECKLIST.md');
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}); 