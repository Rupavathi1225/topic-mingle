import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { trackPageView, trackRelatedSearchClick } from "@/lib/analytics";

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

interface RelatedSearch {
  id: string;
  search_text: string;
  target_url: string;
}

const BlogPost = () => {
  const { categorySlug, slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedSearches, setRelatedSearches] = useState<RelatedSearch[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    const { data: blogData, error: blogError } = await supabase
      .from('blogs')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (blogError || !blogData) {
      console.error('Error fetching blog:', blogError);
      setLoading(false);
      return;
    }

    setBlog(blogData as Blog);
    await trackPageView('blog', blogData.id);

    // Fetch related searches
    const { data: searchesData } = await supabase
      .from('related_searches')
      .select('*')
      .eq('blog_id', blogData.id)
      .order('order_number');

    if (searchesData) {
      setRelatedSearches(searchesData);
    }

    // Fetch recent posts from same category
    const { data: recentData } = await supabase
      .from('blogs')
      .select('id, title, slug, featured_image, categories(slug)')
      .eq('category_id', blogData.category_id)
      .eq('status', 'published')
      .neq('id', blogData.id)
      .order('published_at', { ascending: false })
      .limit(3);

    if (recentData) {
      setRecentPosts(recentData.map(post => ({
        ...post,
        categorySlug: post.categories.slug
      })));
    }

    setLoading(false);
  };

  const handleRelatedSearchClick = async (search: RelatedSearch) => {
    await trackRelatedSearchClick(search.id);
    navigate(`/visit/${search.id}`);
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

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Blog post not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-sm text-muted-foreground mb-4">
            {blog.categories.name} &gt; {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar on the left */}
            <div className="lg:col-span-1">
              <Sidebar author={blog.author} recentPosts={recentPosts} />
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3 space-y-6">
              <h1 className="text-4xl font-bold text-foreground">{blog.title}</h1>

              <div className="flex items-center gap-1">
                <Badge variant="secondary">{blog.serial_number}</Badge>
              </div>

              {blog.featured_image && (
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full rounded-lg"
                />
              )}

              <div className="prose prose-slate max-w-none">
                {blog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Related Searches */}
              {relatedSearches.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Related searches</h3>
                  <div className="flex flex-wrap gap-3">
                    {relatedSearches.map((search) => (
                      <Button
                        key={search.id}
                        variant="outline"
                        onClick={() => handleRelatedSearchClick(search)}
                        className="text-sm"
                      >
                        {search.search_text}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Posts Section */}
              {recentPosts.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-2xl font-bold mb-6">Recent posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentPosts.map((post) => (
                      <a
                        key={post.id}
                        href={`/blog/${post.categorySlug}/${post.slug}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          {post.featured_image && (
                            <div className="overflow-hidden">
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                              <Badge variant="secondary">{blog.categories.name}</Badge>
                              <span>•</span>
                              <span>{new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">By {blog.author}</p>
                          </div>
                        </Card>
                      </a>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
