
import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import TaskForm from './TaskForm';
import { Task, Tag } from '@/lib/types';

interface HeaderProps {
  tags: Tag[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const Header: React.FC<HeaderProps> = ({ tags, onAddTask }) => {
  return (
    <header className="flex justify-between items-center py-6">
      <div className="flex items-center">
        <CheckSquare className="h-6 w-6 text-taskflow-purple mr-2" />
        <h1 className="text-2xl font-bold">TaskFlow</h1>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Task</SheetTitle>
            <SheetDescription>
              Create a new task with details, due date and tags.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TaskForm tags={tags} onSubmit={onAddTask} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
