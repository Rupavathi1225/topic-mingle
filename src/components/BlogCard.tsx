import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <div className="w-full">
      {/* IMAGE ONLY CARD */}
      <Link to={`/blog/${categorySlug}/${slug}`} onClick={handleClick}>
        <Card className="overflow-hidden rounded-xl border border-neutral-200 hover:shadow-lg transition-all bg-white">
          {featuredImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={featuredImage}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
        </Card>
      </Link>

      {/* CONTENT BELOW IMAGE */}
      <div className="mt-3 px-1">

        {/* SERIAL NUMBER + CATEGORY ON SAME LINE */}
        <div className="flex items-center gap-2 mb-2">

          {/* ORANGE SERIAL NUMBER */}
          <Badge
            variant="secondary"
            className="text-xs w-fit bg-orange-500 text-white"
          >
            #{serialNumber}
          </Badge>

          {/* CATEGORY ORANGE TEXT */}
          <span className="text-xs font-medium text-orange-600">
            {category}
          </span>

        </div>

        {/* Title */}
        <Link to={`/blog/${categorySlug}/${slug}`} onClick={handleClick}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-neutral-900 hover:underline">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
          {excerpt}
        </p>

        {/* Date + Author */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(publishedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>• {author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
