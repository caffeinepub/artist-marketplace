import { Button } from './ui/button';
import { Category } from '../backend';

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

const categories: Array<{ value: Category | null; label: string }> = [
  { value: null, label: 'All' },
  { value: Category.music, label: 'Music' },
  { value: Category.videography, label: 'Video' },
  { value: Category.images, label: 'Images' },
  { value: Category.prints, label: '3D Prints' },
  { value: Category.ceramics, label: 'Ceramics' },
  { value: Category.paintings, label: 'Paintings' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.label}
          variant={selectedCategory === cat.value ? 'default' : 'outline'}
          onClick={() => onCategoryChange(cat.value)}
          size="sm"
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
