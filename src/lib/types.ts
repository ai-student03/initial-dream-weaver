
export type Priority = 'low' | 'medium' | 'high';

export type Tag = {
  id: string;
  name: string;
  color?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  tags: Tag[];
};
