export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  children?: Category[];
}
