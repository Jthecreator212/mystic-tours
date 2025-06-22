"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var fs = require("fs/promises");
var path = require("path");
require("dotenv/config");
var url_1 = require("url");
// --- Configuration ---
var BUCKET_NAME = 'site-images';
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path.dirname(__filename);
var PUBLIC_IMAGE_DIR = path.join(__dirname, '../public/images');
// --- End Configuration ---
// Get Supabase credentials from environment variables
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or service key not found in environment variables.');
}
// Initialize Supabase admin client
var supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
// --- Helper Functions ---
/**
 * Checks if a Supabase storage bucket exists and creates it if it doesn't.
 */
function ensureBucketExists() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, buckets, error, bucketExists, createError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabaseAdmin.storage.listBuckets()];
                case 1:
                    _a = _b.sent(), buckets = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error listing buckets:', error.message);
                        throw error;
                    }
                    bucketExists = buckets.some(function (bucket) { return bucket.name === BUCKET_NAME; });
                    if (!!bucketExists) return [3 /*break*/, 3];
                    console.log("Bucket \"".concat(BUCKET_NAME, "\" not found. Creating it..."));
                    return [4 /*yield*/, supabaseAdmin.storage.createBucket(BUCKET_NAME, {
                            public: true, // Make files publicly accessible
                        })];
                case 2:
                    createError = (_b.sent()).error;
                    if (createError) {
                        console.error("Error creating bucket:", createError.message);
                        throw createError;
                    }
                    console.log("Bucket \"".concat(BUCKET_NAME, "\" created successfully."));
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Bucket \"".concat(BUCKET_NAME, "\" already exists."));
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Finds a local image file, accounting for potential extension mismatches.
 * @param baseFilename - The filename without extension (e.g., 'hero-bg').
 * @returns The full path to the found file or null if not found.
 */
function findLocalImage(baseFilename) {
    return __awaiter(this, void 0, void 0, function () {
        var extensions, _i, extensions_1, ext, fullPath, _a, fullPath, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    extensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif'];
                    _i = 0, extensions_1 = extensions;
                    _c.label = 1;
                case 1:
                    if (!(_i < extensions_1.length)) return [3 /*break*/, 6];
                    ext = extensions_1[_i];
                    fullPath = path.join(PUBLIC_IMAGE_DIR, "".concat(baseFilename).concat(ext));
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.access(fullPath)];
                case 3:
                    _c.sent();
                    return [2 /*return*/, fullPath];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    if (!(baseFilename === 'hero-bg')) return [3 /*break*/, 10];
                    fullPath = path.join(PUBLIC_IMAGE_DIR, 'hero-bg.png');
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, fs.access(fullPath)];
                case 8:
                    _c.sent();
                    return [2 /*return*/, fullPath];
                case 9:
                    _b = _c.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, null];
            }
        });
    });
}
// --- Main Migration Logic ---
function migrateImages() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, records, fetchError, _i, records_1, record, urlPath, baseFilename, localImagePath, fileBuffer, uploadPath, uploadError, urlData, newPublicUrl, updateError, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    console.log('--- Starting Image Migration ---');
                    return [4 /*yield*/, ensureBucketExists()];
                case 1:
                    _b.sent();
                    console.log('\nFetching records with localhost or placeholder URLs...');
                    return [4 /*yield*/, supabaseAdmin
                            .from('content_areas')
                            .select('id, area_key, image_url')
                            .or('image_url.like.%http://localhost:3000/%,image_url.like.%https://placehold.co/%')];
                case 2:
                    _a = _b.sent(), records = _a.data, fetchError = _a.error;
                    if (fetchError) {
                        console.error('Error fetching records:', fetchError.message);
                        return [2 /*return*/];
                    }
                    if (!records || records.length === 0) {
                        console.log('✅ No records with localhost or placeholder URLs found. Nothing to migrate.');
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat(records.length, " records to process."));
                    _i = 0, records_1 = records;
                    _b.label = 3;
                case 3:
                    if (!(_i < records_1.length)) return [3 /*break*/, 9];
                    record = records_1[_i];
                    // Skip placeholders
                    if (record.image_url.includes('placehold.co')) {
                        console.log("\nSKIPPING (Placeholder): ".concat(record.area_key));
                        return [3 /*break*/, 8];
                    }
                    console.log("\nProcessing: ".concat(record.area_key));
                    urlPath = path.basename(record.image_url);
                    baseFilename = path.parse(urlPath).name;
                    return [4 /*yield*/, findLocalImage(baseFilename)];
                case 4:
                    localImagePath = _b.sent();
                    if (!localImagePath) {
                        console.error("  \u274C ERROR: Local image for \"".concat(baseFilename, "\" not found in ").concat(PUBLIC_IMAGE_DIR, "."));
                        return [3 /*break*/, 8];
                    }
                    console.log("  \uD83D\uDD0D Found local file: ".concat(path.basename(localImagePath)));
                    return [4 /*yield*/, fs.readFile(localImagePath)];
                case 5:
                    fileBuffer = _b.sent();
                    uploadPath = "".concat(baseFilename, "-").concat(Date.now()).concat(path.extname(localImagePath));
                    return [4 /*yield*/, supabaseAdmin.storage
                            .from(BUCKET_NAME)
                            .upload(uploadPath, fileBuffer, {
                            cacheControl: '3600',
                            upsert: false,
                        })];
                case 6:
                    uploadError = (_b.sent()).error;
                    if (uploadError) {
                        console.error("  \u274C ERROR uploading file:", uploadError.message);
                        return [3 /*break*/, 8];
                    }
                    console.log("  \u2B06\uFE0F Uploaded to Supabase as: ".concat(uploadPath));
                    urlData = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(uploadPath).data;
                    newPublicUrl = urlData.publicUrl;
                    return [4 /*yield*/, supabaseAdmin
                            .from('content_areas')
                            .update({ image_url: newPublicUrl, updated_at: new Date() })
                            .eq('id', record.id)];
                case 7:
                    updateError = (_b.sent()).error;
                    if (updateError) {
                        console.error("  \u274C ERROR updating database record:", updateError.message);
                        return [3 /*break*/, 8];
                    }
                    console.log("  \u2705 Successfully updated database with new URL: ".concat(newPublicUrl));
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9:
                    console.log('\n--- Image Migration Complete ---');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    if (error_1 instanceof Error) {
                        console.error('\n--- A critical error occurred ---');
                        console.error(error_1.message);
                    }
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
migrateImages();
