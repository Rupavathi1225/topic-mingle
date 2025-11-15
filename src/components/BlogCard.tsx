import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trackBlogClick } from "@/lib/analytics";

interface BlogCardProps {
  id: string;
  serialNumber: number;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  author: string;
  featuredImage?: string;
  publishedAt: string;
  excerpt: string;
}

const BlogCard = ({
  id,
  serialNumber,
  title,
  slug,
  category,
  categorySlug,
  author,
  featuredImage,
  publishedAt,
  excerpt,
}: BlogCardProps) => {
  const handleClick = () => {
    trackBlogClick(id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/blog/${categorySlug}/${slug}`} onClick={handleClick}>
        {featuredImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {serialNumber}
            </Badge>
            <Badge className="text-xs">{category}</Badge>
          </div>
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>by {author}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BlogCard;
