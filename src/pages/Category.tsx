import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { trackPageView } from "@/lib/analytics";

interface Blog {
  id: string;
  serial_number: number;
  title: string;
  slug: string;
  author: string;
  content: string;
  featured_image: string;
  published_at: string;
  categories: {
    name: string;
    slug: string;
  };
}

const Category = () => {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndBlogs();
  }, [categorySlug]);

  const fetchCategoryAndBlogs = async () => {
    // Fetch category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      setLoading(false);
      return;
    }

    setCategory(categoryData);
    await trackPageView('category', categoryData.id);

    // Fetch blogs for this category
    const { data: blogsData, error: blogsError } = await supabase
      .from('blogs')
      .select('*, categories(name, slug)')
      .eq('category_id', categoryData.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
    } else {
      setBlogs(blogsData as Blog[]);
    }
    setLoading(false);
  };

  const getExcerpt = (content: string) => {
    return content.substring(0, 150) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Category not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{category.name}</h1>
            <p className="text-lg text-muted-foreground">Explore our latest {category.name.toLowerCase()} articles</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  id={blog.id}
                  serialNumber={blog.serial_number}
                  title={blog.title}
                  slug={blog.slug}
                  category={blog.categories.name}
                  categorySlug={blog.categories.slug}
                  author={blog.author}
                  featuredImage={blog.featured_image}
                  publishedAt={blog.published_at}
                  excerpt={getExcerpt(blog.content)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Category;
