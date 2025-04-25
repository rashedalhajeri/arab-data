
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/hooks/useCategories";

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onToggleActive?: (category: Category) => void;
  imageProcessor?: (url: string) => string;
  readOnly?: boolean;
}

export function CategoryCard({ 
  category, 
  onEdit, 
  onToggleActive, 
  imageProcessor,
  readOnly = false
}: CategoryCardProps) {
  // Process the image URL if a processor function is provided
  const imageUrl = imageProcessor ? imageProcessor(category.image_url) : category.image_url;
  
  return (
    <Card className="overflow-hidden h-[200px]">
      <div className="relative h-24">
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
