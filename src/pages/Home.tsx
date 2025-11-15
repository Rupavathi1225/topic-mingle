import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { initAnalyticsSession, trackPageView } from "@/lib/analytics";

interface Blog {
  id: string;
  serial_number: number;
  title: string;
  slug: string;
  category_id: number;
  author: string;
  content: string;
  featured_image: string;
  published_at: string;
  categories: {
    name: string;
    slug: string;
  };
}

const Home = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAnalytics = async () => {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source') || 'direct';
      await initAnalyticsSession(source);
      await trackPageView('home');
    };

    initAnalytics();
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*, categories(name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
    } else {
      setBlogs(data as Blog[]);
    }
    setLoading(false);
  };

  const getExcerpt = (content: string) => {
    return content.substring(0, 150) + '...';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Welcome to Topicmingle
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Thank you for visiting Topicmingle, your digital hub for embracing a vibrant and wholesome lifestyle. 
              At Topicmingle, we're dedicated to inspiring and guiding you on your path to holistic well-being, 
              offering a treasure trove of content that covers a spectrum of healthy lifestyle topics.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blogs available yet.</p>
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

export default Home;
