'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Heading1,
  Heading2,
  Heading3,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Code,
  Subscript,
  Superscript,
  Highlighter,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

// Color palette for text and highlight
const TEXT_COLORS = [
  { name: 'Default', color: 'inherit' },
  { name: 'Black', color: '#000000' },
  { name: 'Gray', color: '#6b7280' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Pink', color: '#ec4899' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: 'inherit' },
  { name: 'Yellow', color: '#fef08a' },
  { name: 'Green', color: '#bbf7d0' },
  { name: 'Blue', color: '#bfdbfe' },
  { name: 'Purple', color: '#e9d5ff' },
  { name: 'Pink', color: '#fbcfe8' },
  { name: 'Orange', color: '#fed7aa' },
  { name: 'Red', color: '#fecaca' },
];

// Main Editor Component
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Écrivez...',
  className,
  disabled = false,
  minHeight = '150px',
}: RichTextEditorProps) {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightColorOpen, setHighlightColorOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'text-2xl font-bold mt-4 mb-2',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4 mb-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4 mb-2',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic my-4',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto my-4',
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'border-t border-gray-300 my-4',
          },
        },
        subscript: true,
        superscript: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none p-3',
          disabled && 'pointer-events-none opacity-50'
        ),
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  // Don't render until editor is ready
  if (!editor) {
    return (
      <div className={cn('border rounded-lg overflow-hidden bg-background p-8', className)}>
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Chargement de l&apos;éditeur...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir"
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-muted')}
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
          title="Souligné"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-muted')}
          title="Barré"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('subscript') && 'bg-muted')}
          title="Indice"
        >
          <Subscript className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('superscript') && 'bg-muted')}
          title="Exposant"
        >
          <Superscript className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Color */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Couleur du texte"
            >
              <Type className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={cn(
                    'w-7 h-7 rounded border transition-transform hover:scale-110',
                    color.color === 'inherit' && 'border-gray-300 bg-white'
                  )}
                  style={{ backgroundColor: color.color === 'inherit' ? 'white' : color.color }}
                  onClick={() => {
                    if (color.color === 'inherit') {
                      editor.chain().focus().unsetColor().run();
                    } else {
                      editor.chain().focus().setColor(color.color).run();
                    }
                    setTextColorOpen(false);
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover open={highlightColorOpen} onOpenChange={setHighlightColorOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Surlignage"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded border transition-transform hover:scale-110',
                    color.color === 'inherit' && 'border-gray-300 bg-white'
                  )}
                  style={{ backgroundColor: color.color === 'inherit' ? 'white' : color.color }}
                  onClick={() => {
                    if (color.color === 'inherit') {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor.chain().focus().toggleHighlight({ color: color.color }).run();
                    }
                    setHighlightColorOpen(false);
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
          title="Aligner à gauche"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
          title="Centrer"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
          title="Aligner à droite"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'justify' }) && 'bg-muted')}
          title="Justifier"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted')}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted')}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Quote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-muted')}
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Code */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-muted')}
          title="Code inline"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('codeBlock') && 'bg-muted')}
          title="Bloc de code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Horizontal Rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Ligne horizontale"
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }
          }}
          className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-muted')}
          title="Lien"
        >
          {editor.isActive('link') ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Editor Area */}
      <div style={{ minHeight }} className="overflow-y-auto">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}

// Compact version for inline use
export function RichTextEditorCompact({
  value,
  onChange,
  placeholder = 'Écrivez...',
  className,
  disabled = false,
}: Omit<RichTextEditorProps, 'minHeight'>) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        subscript: true,
        superscript: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none p-2 min-h-[80px]',
          disabled && 'pointer-events-none opacity-50'
        ),
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  // Don't render until editor is ready
  if (!editor) {
    return (
      <div className={cn('border rounded-lg overflow-hidden bg-background p-4', className)}>
        <div className="flex items-center justify-center text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-muted/30">
        {/* Headings dropdown */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn('h-7 w-7 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
          disabled={disabled}
          title="Titre"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('bold') && 'bg-muted')}
          disabled={disabled}
          title="Gras"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('italic') && 'bg-muted')}
          disabled={disabled}
          title="Italique"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('underline') && 'bg-muted')}
          disabled={disabled}
          title="Souligné"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('strike') && 'bg-muted')}
          disabled={disabled}
          title="Barré"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
          disabled={disabled}
          title="Gauche"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
          disabled={disabled}
          title="Centrer"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
          disabled={disabled}
          title="Droite"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('bulletList') && 'bg-muted')}
          disabled={disabled}
          title="Liste"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('orderedList') && 'bg-muted')}
          disabled={disabled}
          title="Liste numérotée"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('blockquote') && 'bg-muted')}
          disabled={disabled}
          title="Citation"
        >
          <Quote className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn('h-7 w-7 p-0', editor.isActive('code') && 'bg-muted')}
          disabled={disabled}
          title="Code"
        >
          <Code className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-4 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }
          }}
          className={cn('h-7 w-7 p-0', editor.isActive('link') && 'bg-muted')}
          disabled={disabled}
          title="Lien"
        >
          {editor.isActive('link') ? <Unlink className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
        </Button>

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || disabled}
          title="Annuler"
          className="h-7 w-7 p-0"
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || disabled}
          title="Rétablir"
          className="h-7 w-7 p-0"
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
