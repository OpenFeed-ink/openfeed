'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

interface RichTextEditorProps {
  initialContent?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string,
  disable?:boolean,
}

export function RichTextEditor({
  initialContent = '',
  onChange,
  placeholder = 'Write something...',
  className = '',
  disable = false
}: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({ placeholder }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({
        inline: true,
        allowBase64: true, // allows base64 images (client-side)
      }),
    ],
    content: initialContent,
    editable: !disable,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    immediatelyRender: false,
  })


  if (!editor) return null

  return (
    <div className={`border rounded-lg overflow-hidden bg-background ${className}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

interface ToolbarProps {
  editor: Editor
}

function Toolbar({ editor }: ToolbarProps) {
  const setLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }
  const onImageClick = () => {
    const url = window.prompt("Image URL")

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const buttonClass = (isActive: boolean) =>
    `h-8 w-8 p-0 ${isActive ? 'bg-accent text-accent-foreground' : ''}`

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      <ButtonGroup>
        {/* Headings */}
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('heading', { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('heading', { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </ButtonGroup>

      <div className="w-px h-6 bg-border mx-1" />

      <ButtonGroup>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </ButtonGroup>

      <div className="w-px h-6 bg-border mx-1" />

      <ButtonGroup>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('blockquote'))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('codeBlock'))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
      </ButtonGroup>

      <div className="w-px h-6 bg-border mx-1" />

      <ButtonGroup>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive({ textAlign: 'left' }))}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive({ textAlign: 'center' }))}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive({ textAlign: 'right' }))}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </ButtonGroup>

      <div className="w-px h-6 bg-border mx-1" />

      <ButtonGroup>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('link'))}
          onClick={setLink}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={buttonClass(editor.isActive('highlight'))}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onImageClick}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </ButtonGroup>
    </div>
  )
}
