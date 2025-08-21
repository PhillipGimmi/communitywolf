// Simple test runner for schema validation
import { runSchemaTests } from './src/lib/validation/schema.test.ts';

console.log('🚀 Starting Safety News App Schema Tests...\n');

try {
  runSchemaTests();
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
}
