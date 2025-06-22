"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env.local
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
// Import Supabase client
const supabase_js_1 = require("@supabase/supabase-js");
// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or service role key in .env.local file');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
async function testSupabaseConnection() {
    console.log('Testing Supabase connection...');
    try {
        // Test 1: Check if we can connect to Supabase
        console.log('\n=== Test 1: Connection Test ===');
        const { data: connectionTest, error: connectionError } = await supabase.from('gallery_images').select('count').limit(1).single();
        if (connectionError) {
            console.error('❌ Connection test failed:', connectionError.message);
        }
        else {
            console.log('✅ Connection test passed! Connected to Supabase.');
            console.log(`   Found ${connectionTest.count} gallery images.`);
        }
        // Test 2: Check if tours table exists and has data
        console.log('\n=== Test 2: Tours Table Test ===');
        const { data: toursTest, error: toursError } = await supabase.from('tours').select('count').limit(1).single();
        if (toursError) {
            console.error('❌ Tours table test failed:', toursError.message);
        }
        else {
            console.log('✅ Tours table test passed!');
            console.log(`   Found ${toursTest.count} tours.`);
        }
        // Test 3: Check if team_members table exists and has data
        console.log('\n=== Test 3: Team Members Table Test ===');
        const { data: teamTest, error: teamError } = await supabase.from('team_members').select('count').limit(1).single();
        if (teamError) {
            console.error('❌ Team members table test failed:', teamError.message);
        }
        else {
            console.log('✅ Team members table test passed!');
            console.log(`   Found ${teamTest.count} team members.`);
        }
        // Test 4: Check if storage buckets exist
        console.log('\n=== Test 4: Storage Buckets Test ===');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
            console.error('❌ Storage buckets test failed:', bucketsError.message);
        }
        else {
            const galleryBucket = buckets.find(b => b.name === 'gallery-images');
            const tourBucket = buckets.find(b => b.name === 'tour-images');
            if (galleryBucket && tourBucket) {
                console.log('✅ Storage buckets test passed!');
                console.log('   Found both gallery-images and tour-images buckets.');
            }
            else {
                console.log('⚠️ Storage buckets test partially passed.');
                console.log(`   gallery-images bucket: ${galleryBucket ? 'Found' : 'Missing'}`);
                console.log(`   tour-images bucket: ${tourBucket ? 'Found' : 'Missing'}`);
            }
        }
        console.log('\n=== Summary ===');
        console.log('Supabase integration tests completed.');
        console.log('If all tests passed, your Supabase integration is working correctly!');
        console.log('You can now use the admin dashboard to manage your content.');
    }
    catch (error) {
        console.error('Error testing Supabase connection:', error instanceof Error ? error.message : String(error));
    }
}
testSupabaseConnection().catch(console.error);
