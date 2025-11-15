import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  featuredImage?: string;
}

interface SidebarProps {
  author?: string;
  recentPosts?: RecentPost[];
}

const Sidebar = ({ author = "Raja", recentPosts = [] }: SidebarProps) => {
  return (
    <aside className="space-y-6">
      {/* Author Card */}
      <Card>
        <CardContent className="pt-6 text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {author.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg mb-2">{author}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Content creator and researcher focused on delivering valuable insights across various topics.
            Passionate about making complex information accessible and actionable.
          </p>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.categorySlug}/${post.slug}`}
                className="flex gap-3 group"
              >
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </aside>
  );
};

export default Sidebar;
