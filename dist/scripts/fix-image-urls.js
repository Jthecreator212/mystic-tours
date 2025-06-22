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
// Supabase Storage public URL base
const STORAGE_PUBLIC_URL = `${supabaseUrl}/storage/v1/object/public/gallery-images`;
async function fixImageUrls() {
    console.log('Fixing image URLs in gallery_images table...');
    try {
        // Get all images from the gallery_images table
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*');
        if (error) {
            throw error;
        }
        console.log(`Found ${data.length} images to update.`);
        let updatedCount = 0;
        // Update each image URL
        for (const image of data) {
            if (image.image_url) {
                // Only update if not already a Supabase storage URL
                const isSupabaseStorageUrl = image.image_url.startsWith(`${supabaseUrl}/storage/v1/object/public/gallery-images`);
                if (!isSupabaseStorageUrl) {
                    // Try to extract the filename from the current image_url
                    let filename = image.image_url;
                    // Remove any leading slashes or local path segments
                    if (filename.startsWith('/'))
                        filename = filename.substring(1);
                    if (filename.startsWith('images/gallery/'))
                        filename = filename.replace('images/gallery/', '');
                    if (filename.startsWith('gallery/'))
                        filename = filename.replace('gallery/', '');
                    const newUrl = `${STORAGE_PUBLIC_URL}/${filename}`;
                    const { error: updateError } = await supabase
                        .from('gallery_images')
                        .update({ image_url: newUrl })
                        .eq('id', image.id);
                    if (updateError) {
                        console.error(`Error updating image ${image.id}:`, updateError.message);
                    }
                    else {
                        updatedCount++;
                        console.log(`Updated image ${image.id} URL from "${image.image_url}" to "${newUrl}"`);
                    }
                }
            }
        }
        console.log(`\nSuccessfully updated ${updatedCount} out of ${data.length} image URLs.`);
        console.log('Please refresh your admin page to see the updated images.');
    }
    catch (error) {
        console.error('Error fixing image URLs:', error instanceof Error ? error.message : String(error));
    }
}
fixImageUrls().catch(console.error);
