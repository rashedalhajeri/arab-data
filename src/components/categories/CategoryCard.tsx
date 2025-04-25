
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/hooks/useCategories";
import { getStorageUrl } from "@/lib/storage-utils";

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onToggleActive?: (category: Category) => void;
  readOnly?: boolean;
  imageProcessor?: (path: string | null) => string;
}

export function CategoryCard({ 
  category, 
  onEdit, 
  onToggleActive,
  readOnly = false,
  imageProcessor = getStorageUrl
}: CategoryCardProps) {
  const imageUrl = imageProcessor(category.image_url);
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-32">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">{category.name}</h3>
          {!readOnly && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!readOnly && onToggleActive && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">الحالة</span>
            <Switch
              checked={category.is_active}
              onCheckedChange={() => onToggleActive(category)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
