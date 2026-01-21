import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import Image from "next/image"

interface VideoCardProps {
  title: string
  description?: string
  thumbnail: string
}

export function VideoCard({
  title,
  description,
  thumbnail,
}: VideoCardProps) {
  return (
    <Card className="w-80 p-0 overflow-hidden hover:shadow-md group">
      <CardContent className="p-0 relative cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image src={thumbnail} alt={title} fill className="object-contain" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 fill-white" />
          </div>
        </div>
      </CardContent>
      <CardHeader className="pb-3">
        <div className="min-w-0 w-full">
          <CardTitle className="truncate text-base group-hover:text-primary overflow-hidden">{title}</CardTitle>
          {description && (
            <CardDescription className="line-clamp-2 text-sm break-words">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
    </Card>
)
}