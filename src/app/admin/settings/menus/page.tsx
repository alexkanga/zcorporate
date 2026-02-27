"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Types
interface MenuItem {
  id: string;
  parentId: string | null;
  order: number;
  slug: string;
  route: string;
  labelFr: string;
  labelEn: string;
  visible: boolean;
  location: "HEADER" | "FOOTER" | "BOTH";
  icon: string | null;
  external: boolean;
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];
}

// Validation schema
const menuItemSchema = z.object({
  parentId: z.string().nullable(),
  slug: z.string().min(1, "Slug is required"),
  route: z.string().min(1, "Route is required"),
  labelFr: z.string().min(1, "French label is required"),
  labelEn: z.string().min(1, "English label is required"),
  visible: z.boolean(),
  location: z.enum(["HEADER", "FOOTER", "BOTH"]),
  icon: z.string().nullable(),
  external: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

// API functions
async function fetchMenus(): Promise<MenuItem[]> {
  const response = await fetch("/api/admin/menus");
  if (!response.ok) throw new Error("Failed to fetch menus");
  return response.json();
}

async function createMenuItem(data: MenuItemFormData): Promise<MenuItem> {
  const response = await fetch("/api/admin/menus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, order: 0 }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create menu item");
  }
  return response.json();
}

async function updateMenuItem(id: string, data: Partial<MenuItemFormData>): Promise<MenuItem> {
  const response = await fetch(`/api/admin/menus/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, order: 0 }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update menu item");
  }
  return response.json();
}

async function deleteMenuItem(id: string): Promise<void> {
  const response = await fetch(`/api/admin/menus/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete menu item");
  }
}

async function reorderMenuItems(items: Array<{ id: string; order: number; parentId: string | null }>): Promise<void> {
  const response = await fetch("/api/admin/menus", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) throw new Error("Failed to reorder menu items");
}

// Sortable Item Component
function SortableMenuItem({
  item,
  allItems,
  onEdit,
  onDelete,
  onToggleVisibility,
  depth = 0,
}: {
  item: MenuItem;
  allItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleVisibility: (item: MenuItem) => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = item.children && item.children.length > 0;
  const locationBadgeVariant = item.location === "HEADER" ? "default" : item.location === "FOOTER" ? "secondary" : "outline";

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-center gap-2 p-3 bg-card border rounded-lg mb-2",
          isDragging && "opacity-50 shadow-lg",
          depth > 0 && "ml-8 border-l-2 border-l-primary/20"
        )}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Expand/Collapse for items with children */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Menu Item Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {item.labelFr} / {item.labelEn}
            </span>
            <Badge variant={locationBadgeVariant} className="text-xs">
              {item.location}
            </Badge>
            {item.external && (
              <Badge variant="outline" className="text-xs">
                External
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {item.slug} → {item.route}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleVisibility(item)}
            title={item.visible ? "Hide" : "Show"}
          >
            {item.visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {item.children!.map((child) => (
            <SortableMenuItem
              key={child.id}
              item={child}
              allItems={allItems}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenusPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["menus"],
    queryFn: fetchMenus,
  });

  // Form setup
  const createForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      parentId: null,
      slug: "",
      route: "/",
      labelFr: "",
      labelEn: "",
      visible: true,
      location: "HEADER",
      icon: null,
      external: false,
    },
  });

  const editForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      parentId: null,
      slug: "",
      route: "/",
      labelFr: "",
      labelEn: "",
      visible: true,
      location: "HEADER",
      icon: null,
      external: false,
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsCreateOpen(false);
      createForm.reset();
      toast.success("Menu item created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemFormData> }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsEditOpen(false);
      setSelectedItem(null);
      editForm.reset();
      toast.success("Menu item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setIsDeleteOpen(false);
      setSelectedItem(null);
      toast.success("Menu item deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      updateMenuItem(id, { visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("Visibility updated");
    },
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuItems.findIndex((item) => item.id === active.id);
      const newIndex = menuItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(menuItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      // Save order to backend
      try {
        await reorderMenuItems(
          newItems.map((item) => ({
            id: item.id,
            order: item.order,
            parentId: item.parentId,
          }))
        );
        toast.success("Menu order saved");
        queryClient.invalidateQueries({ queryKey: ["menus"] });
      } catch (error) {
        toast.error("Failed to save menu order");
        console.error(error);
      }
    }
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    editForm.reset({
      parentId: item.parentId,
      slug: item.slug,
      route: item.route,
      labelFr: item.labelFr,
      labelEn: item.labelEn,
      visible: item.visible,
      location: item.location,
      icon: item.icon,
      external: item.external,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleToggleVisibility = (item: MenuItem) => {
    toggleVisibilityMutation.mutate({
      id: item.id,
      visible: !item.visible,
    });
  };

  const onCreateSubmit = (data: MenuItemFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: MenuItemFormData) => {
    if (!selectedItem) return;
    updateMutation.mutate({ id: selectedItem.id, data });
  };

  // Get all items for parent selection (excluding current item when editing)
  const getParentOptions = () => {
    const items = menuItems || [];
    const options: { id: string; label: string }[] = [{ id: "none", label: "None (Root)" }];

    const addOptions = (items: MenuItem[], depth = 0) => {
      items.forEach((item) => {
        if (isEditOpen && selectedItem?.id === item.id) return;
        options.push({
          id: item.id,
          label: `${"  ".repeat(depth)}${item.labelFr} / ${item.labelEn}`,
        });
        if (item.children) {
          addOptions(item.children, depth + 1);
        }
      });
    };

    addOptions(items);
    return options;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground">
              Create and organize navigation menus
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            Drag and drop to reorder. Click to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No menu items yet. Create your first menu item.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={menuItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      allItems={menuItems}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Menu Item</DialogTitle>
            <DialogDescription>
              Add a new navigation menu item
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="labelFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (French)</FormLabel>
                    <FormControl>
                      <Input placeholder="Accueil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="labelEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <FormControl>
                      <Input placeholder="/" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Menu</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getParentOptions().map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEADER">Header</SelectItem>
                        <SelectItem value="FOOTER">Footer</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-4">
                <FormField
                  control={createForm.control}
                  name="visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Visible</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="external"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">External Link</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update menu item settings
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="labelFr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (French)</FormLabel>
                    <FormControl>
                      <Input placeholder="Accueil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="labelEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="home" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <FormControl>
                      <Input placeholder="/" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Menu</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getParentOptions().map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEADER">Header</SelectItem>
                        <SelectItem value="FOOTER">Footer</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-4">
                <FormField
                  control={editForm.control}
                  name="visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Visible</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="external"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">External Link</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.labelFr}&quot;?
              {selectedItem?.children && selectedItem.children.length > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  This will also delete {selectedItem.children.length} child menu item(s).
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && deleteMutation.mutate(selectedItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
