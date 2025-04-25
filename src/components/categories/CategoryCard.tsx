
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/hooks/useCategories";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onToggleActive }: CategoryCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{category.name}</h3>
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">الحالة</span>
          <Switch
            checked={category.is_active}
            onCheckedChange={() => onToggleActive(category)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
