-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_gallery_images table
CREATE TABLE IF NOT EXISTS blog_gallery_images (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_gallery_images_blog_post_id_idx ON blog_gallery_images(blog_post_id);
CREATE INDEX IF NOT EXISTS blog_gallery_images_position_idx ON blog_gallery_images(position);

-- Create storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow public access to blog images
CREATE POLICY "Blog images are publicly accessible" 
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Set up storage policy to allow authenticated users to upload blog images
CREATE POLICY "Users can upload blog images" 
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Set up storage policy to allow authenticated users to update their blog images
CREATE POLICY "Users can update their blog images" 
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Set up storage policy to allow authenticated users to delete their blog images
CREATE POLICY "Users can delete their blog images" 
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');