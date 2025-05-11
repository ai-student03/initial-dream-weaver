
import React, { useState } from 'react';
import { Task, Priority, Tag } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  tags: Tag[];
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ tags, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      description,
      priority,
      dueDate,
      tags: selectedTags,
      completed: false,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setSelectedTags([]);
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prevTags) => {
      const isSelected = prevTags.some((t) => t.id === tag.id);
      if (isSelected) {
        return prevTags.filter((t) => t.id !== tag.id);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div>
        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[80px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Select 
            value={priority} 
            onValueChange={(value) => setPriority(value as Priority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : <span>Set due date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <div className="text-sm mb-2 text-muted-foreground">Tags</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={cn(
                "tag cursor-pointer",
                selectedTags.some((t) => t.id === tag.id)
                  ? "ring-2 ring-offset-1"
                  : "opacity-70 hover:opacity-100"
              )}
              style={{ 
                backgroundColor: selectedTags.some((t) => t.id === tag.id) 
                  ? `${tag.color}20` 
                  : `${tag.color}10`,
                color: tag.color 
              }}
              onClick={() => toggleTag(tag)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full">Add Task</Button>
      </div>
    </form>
  );
};

export default TaskForm;
