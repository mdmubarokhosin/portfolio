'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Doughnut, Bar, PolarArea, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LayoutDashboard,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
  Trash2,
  Check,
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Shield,
  User,
  AlertCircle,
  UserCircle,
  Briefcase,
  GraduationCap,
  MessageSquareQuote,
  Award,
  HelpCircle,
  Link2,
  Phone,
  Wrench,
  BarChart3,
  Plus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  PenLine,
  Copy,
  DatabaseBackup,
  Download,
  Upload,
  HardDrive,
  AlertTriangle,
  RefreshCw,
  Globe,
  Layers,
  FolderOpen,
  Search,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { BiIcon } from '@/components/BiIcon'

// ============================================================
// Types
// ============================================================

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  budget: string | null
  message: string
  read: boolean
  createdAt: string
}

interface SiteSetting {
  id: string
  key: string
  value: string
  updatedAt: string
}

interface PortfolioSection {
  section: string
  dataJson: string
}

type ActivePanel =
  | 'dashboard'
  | 'messages'
  | 'settings'
  | 'personal'
  | 'services'
  | 'skills'
  | 'projects'
  | 'experiences'
  | 'education'
  | 'testimonials'
  | 'certificates'
  | 'faq'
  | 'socialLinks'
  | 'contactInfo'
  | 'additionalTools'
  | 'stats'
  | 'pages'
  | 'projectCategories'
  | 'skillCategories'
  | 'backup'

// ============================================================
// Auth Helpers
// ============================================================

function getAuthUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('admin_token')
  if (!token) return null
  try {
    const decoded = JSON.parse(atob(token))
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch {
    localStorage.removeItem('admin_token')
    return null
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

// ============================================================
// Global State for Admin Page
// ============================================================

let _globalHasChanges = false
export function getGlobalHasChanges() { return _globalHasChanges }
export function setGlobalHasChanges(v: boolean) { _globalHasChanges = v }

// ============================================================
// Shared Portfolio Section Loader Hook
// ============================================================

function usePortfolioSection(sectionName: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalData, setOriginalData] = useState<any>(null)

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData)

  useEffect(() => {
    setGlobalHasChanges(hasChanges)
  }, [hasChanges])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/admin/portfolio?section=${sectionName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        let parsed: any
        try {
          parsed = JSON.parse(result.dataJson || (Array.isArray(result.dataJson) ? '[]' : '{}'))
        } catch {
          parsed = Array.isArray(result.dataJson) ? [] : {}
        }
        setData(parsed)
        setOriginalData(JSON.parse(JSON.stringify(parsed)))
      }
    } catch {
      toast.error(`Failed to load ${sectionName}`)
    } finally {
      setLoading(false)
    }
  }, [sectionName])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveData = useCallback(async () => {
    setSaving(true)
    try {
      const token = getToken()
      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section: sectionName, data: JSON.stringify(data) }),
      })
      if (res.ok) {
        toast.success('Saved successfully')
        setOriginalData(JSON.parse(JSON.stringify(data)))
      } else {
        toast.error('Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }, [sectionName, data])

  const resetData = useCallback(() => {
    if (originalData) {
      setData(JSON.parse(JSON.stringify(originalData)))
    }
  }, [originalData])

  // Listen for admin:save keyboard shortcut
  useEffect(() => {
    const handleSaveEvent = () => {
      if (hasChanges && !saving) {
        saveData()
      }
    }
    window.addEventListener('admin:save', handleSaveEvent)
    return () => window.removeEventListener('admin:save', handleSaveEvent)
  }, [hasChanges, saving, saveData])

  return { data, setData, loading, saving, hasChanges, saveData, resetData, loadData }
}

// ============================================================
// Reusable Form Components
// ============================================================

function BilingualField({
  label,
  valueEn,
  valueBn,
  onChangeEn,
  onChangeBn,
  multiline = false,
}: {
  label: string
  valueEn: string
  valueBn: string
  onChangeEn: (v: string) => void
  onChangeBn: (v: string) => void
  multiline?: boolean
}) {
  const InputComponent = multiline ? Textarea : Input
  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-semibold tracking-tight">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />English
          </Label>
          <InputComponent
            value={valueEn || ''}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder="English..."
            className={multiline ? 'min-h-[80px] resize-y' : ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />বাংলা (Bengali)
          </Label>
          <InputComponent
            value={valueBn || ''}
            onChange={(e) => onChangeBn(e.target.value)}
            placeholder="বাংলায় লিখুন..."
            className={multiline ? 'min-h-[80px] resize-y' : ''}
          />
        </div>
      </div>
    </div>
  )
}

function SingleField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  multiline?: boolean
}) {
  const InputComponent = multiline ? Textarea : Input
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold tracking-tight">{label}</Label>
      <InputComponent
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className={multiline ? 'min-h-[80px] resize-y' : ''}
      />
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold tracking-tight">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border-2 border-border shadow-sm group-hover:border-primary/40 transition-colors"
          />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  )
}

function LevelField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const getLevelColor = (v: number) => {
    if (v >= 80) return 'text-emerald-500'
    if (v >= 50) return 'text-amber-500'
    return 'text-red-500'
  }
  const getLevelBg = (v: number) => {
    if (v >= 80) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    if (v >= 50) return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    return 'bg-red-500/10 text-red-600 border-red-500/20'
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold tracking-tight">{label}</Label>
        <span className={`text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-full border ${getLevelBg(value || 0)}`}>
          {value}%
        </span>
      </div>
      <div className="relative pt-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300"
            style={{ width: `${value || 0}%` }}
          />
        </div>
        <Slider
          value={[value || 0]}
          onValueChange={([v]) => onChange(v)}
          min={0}
          max={100}
          step={1}
          className="absolute inset-0 w-full [&_[role=slider]]:h-5 [&_[role=slider]]:opacity-0"
        />
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  hasChanges,
  saving,
  onSave,
  onReset,
  onAdd,
  itemCount,
  exportData,
  onImportData,
}: {
  title: string
  description: string
  hasChanges: boolean
  saving: boolean
  onSave: () => void
  onReset: () => void
  onAdd?: () => void
  itemCount?: number
  exportData?: any
  onImportData?: (data: any) => void
}) {
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    if (exportData === undefined || exportData === null) return
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported successfully')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (onImportData) {
          onImportData(parsed)
          toast.success('Data imported successfully')
        }
      } catch {
        toast.error('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    if (importInputRef.current) importInputRef.current.value = ''
  }

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-primary/[0.07] via-primary/[0.03] to-transparent border border-primary/15 p-5 sm:p-6 mb-2 shadow-sm">
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
            {itemCount !== undefined && (
              <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-primary/15 text-primary text-xs font-bold tabular-nums">
                {itemCount}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {exportData !== undefined && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleExport} title="Export as JSON">
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onImportData && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => importInputRef.current?.click()} title="Import JSON">
              <Upload className="h-4 w-4" />
            </Button>
          )}
          {onAdd && (
            <Button variant="outline" size="sm" onClick={onAdd} className="hover:bg-primary/5 hover:border-primary/30 hover:text-primary gap-1.5">
              <Plus className="h-4 w-4" /> Add
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onReset} disabled={!hasChanges}>
            Reset
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving || !hasChanges} className="shadow-sm">
            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save
          </Button>
          {hasChanges && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 animate-pulse">
              Unsaved changes
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

function ArrayItemCard({
  children,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: {
  children: React.ReactNode
  index: number
  total: number
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDuplicate?: () => void
}) {
  return (
    <Card className="relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/10" />
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
            <div className="flex flex-col gap-0.5">
              {onMoveUp && index > 0 && (
                <button
                  type="button"
                  onClick={onMoveUp}
                  className="p-1.5 rounded-lg hover:bg-accent hover:text-primary transition-all duration-200"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              )}
              {onMoveDown && index < total - 1 && (
                <button
                  type="button"
                  onClick={onMoveDown}
                  className="p-1.5 rounded-lg hover:bg-accent hover:text-primary transition-all duration-200"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-4">{children}</div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={onDuplicate}
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove this item? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemove}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TagsEditor({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tags</Label>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="relative rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 p-5">
        <Skeleton className="h-7 w-48 mb-1" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function IconPreviewField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm font-semibold tracking-tight'>{label}</Label>
      <div className='flex items-center gap-3'>
        <div className='h-14 w-14 rounded-2xl border-2 border-dashed border-primary/25 flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent text-2xl shrink-0 transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 hover:scale-105'>
          <BiIcon icon={value} className='text-primary/80' />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'bi-globe2'}
          className='flex-1 font-mono text-sm'
        />
      </div>
    </div>
  )
}

function ImagePreviewField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm font-semibold tracking-tight'>{label}</Label>
      <div className='flex items-start gap-3'>
        <div className='h-14 w-14 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center bg-gradient-to-br from-muted/50 via-muted/30 to-transparent shrink-0 overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:scale-105'>
          {value ? (
            <img src={value} alt='' className='h-full w-full object-contain p-1' onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }} />
          ) : null}
          <BiIcon icon='bi-image' className={`text-muted-foreground/30 text-2xl ${value ? 'hidden' : ''}`} />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'https://...'}
          className='flex-1 font-mono text-sm'
        />
      </div>
    </div>
  )
}

// ============================================================
// Login Screen
// ============================================================

function LoginScreen({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First: ensure at least one admin user exists in Firebase (smart seed)
      await fetch('/api/admin/seed', { method: 'POST' })

      // Then: authenticate against Firebase users data
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      localStorage.setItem('admin_token', data.token)
      onLogin(data.user)
      toast.success('Welcome back!')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <Card className="w-full max-w-md shadow-xl border-border/50 relative" style={{ animation: 'adminFadeInUp 0.5s ease-out' }}>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes adminFadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }` }} />
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Panel</CardTitle>
          <CardDescription className="text-sm">Sign in to manage your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mubarok.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Dashboard Panel
// ============================================================

function DashboardPanel({ onNavigate }: { onNavigate: (panel: ActivePanel) => void }) {
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 })
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([])
  const [portfolioStats, setPortfolioStats] = useState<Record<string, any>>({})
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = getToken()

        // Fetch contact stats
        const contactRes = await fetch('/api/admin/contact?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (contactRes.ok) {
          const data = await contactRes.json()
          setStats({
            total: data.total,
            unread: data.unreadCount,
            read: data.total - data.unreadCount,
          })
          setRecentMessages(data.messages)
        }

        // Fetch portfolio data for charts
        const portfolioRes = await fetch('/api/admin/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (portfolioRes.ok) {
          const data = await portfolioRes.json()
          setPortfolioStats(data)
        }

        // Fetch settings
        const settingsRes = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (settingsRes.ok) {
          const settingsData: SiteSetting[] = await settingsRes.json()
          const map: Record<string, string> = {}
          for (const s of settingsData) map[s.key] = s.value
          setSiteSettings(map)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Count items per section
  const getSectionCounts = () => {
    const counts: Record<string, number> = {}
    for (const [section, data] of Object.entries(portfolioStats)) {
      if (Array.isArray(data)) {
        counts[section] = data.length
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // For object sections (personal, contactInfo, etc.), show 1 if populated
        counts[section] = 1
      }
    }
    return counts
  }

  const sectionCounts = getSectionCounts()

  // Skills data
  const skills = Array.isArray(portfolioStats.skills) ? portfolioStats.skills : []
  const skillsByCategory: Record<string, number> = {}
  for (const s of skills) {
    const cat = s.category || 'other'
    skillsByCategory[cat] = (skillsByCategory[cat] || 0) + 1
  }

  // Projects data
  const projects = Array.isArray(portfolioStats.projects) ? portfolioStats.projects : []
  const projectsByCategory: Record<string, number> = {}
  let featuredCount = 0
  for (const p of projects) {
    const cat = p.category || 'other'
    projectsByCategory[cat] = (projectsByCategory[cat] || 0) + 1
    if (p.featured) featuredCount++
  }

  // Experiences data
  const experiences = Array.isArray(portfolioStats.experiences) ? portfolioStats.experiences : []
  const expByType: Record<string, number> = {}
  for (const e of experiences) {
    const t = e.type || 'other'
    expByType[t] = (expByType[t] || 0) + 1
  }

  const SECTION_LABELS: Record<string, string> = {
    personal: 'Personal',
    stats: 'Stats',
    pages: 'Pages',
    socialLinks: 'Social',
    services: 'Services',
    skills: 'Skills',
    skillCategories: 'Skill Cats',
    additionalTools: 'Add. Tools',
    projects: 'Projects',
    projectCategories: 'Proj. Cats',
    experiences: 'Experience',
    education: 'Education',
    testimonials: 'Testimonials',
    certificates: 'Certificates',
    faq: 'FAQ',
    contactInfo: 'Contact Info',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Complete overview of your portfolio website</p>
      </div>

      {/* ── Top Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group" onClick={() => onNavigate('messages')}>
          <CardContent className="p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group" onClick={() => onNavigate('messages')}>
          <CardContent className="p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-amber-500/20 transition-all duration-300">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600">{stats.unread}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group" onClick={() => onNavigate('projects')}>
          <CardContent className="p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-emerald-500/20 transition-all duration-300">
                  <Briefcase className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600">{projects.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group" onClick={() => onNavigate('skills')}>
          <CardContent className="p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/15 to-violet-600/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-violet-500/20 transition-all duration-300">
                  <Wrench className="h-6 w-6 text-violet-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-violet-600">{skills.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group" onClick={() => onNavigate('services')}>
          <CardContent className="p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-600/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-rose-500/20 transition-all duration-300">
                  <Award className="h-6 w-6 text-rose-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">{sectionCounts.services || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Services</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group" onClick={() => onNavigate('testimonials')}>
          <CardContent className="p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-cyan-500/20 transition-all duration-300">
                  <MessageSquareQuote className="h-6 w-6 text-cyan-500" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-cyan-600">{sectionCounts.testimonials || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Testimonials</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills by Category (Doughnut) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Skills Distribution</CardTitle>
            <CardDescription>Skills grouped by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center" style={{ height: 'clamp(200px, 40vw, 300px)' }}>
              <DashboardDoughnutChart
                labels={Object.keys(skillsByCategory).map(k => k.charAt(0).toUpperCase() + k.slice(1))}
                data={Object.values(skillsByCategory)}
                colors={['#006a4e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']}
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects by Category (Bar) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projects by Category</CardTitle>
            <CardDescription>{featuredCount} featured out of {projects.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 'clamp(200px, 40vw, 300px)' }}>
              <DashboardBarChart
                labels={Object.keys(projectsByCategory).map(k => k.charAt(0).toUpperCase() + k.slice(1))}
                data={Object.values(projectsByCategory)}
                color="#006a4e"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Second Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Content Sections (Horizontal Bar) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content Sections</CardTitle>
            <CardDescription>Items per portfolio section</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 'clamp(200px, 40vw, 300px)' }}>
              <DashboardHorizontalBarChart
                labels={Object.entries(sectionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([k]) => SECTION_LABELS[k] || k)}
                data={Object.entries(sectionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([, v]) => v)}
                color="#f42a41"
              />
            </div>
          </CardContent>
        </Card>

        {/* Experience & Education (Polar Area) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Career Overview</CardTitle>
            <CardDescription>Experience types & education</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center" style={{ height: 'clamp(200px, 40vw, 300px)' }}>
              <DashboardPolarChart
                labels={[
                  ...Object.keys(expByType).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
                  ...(sectionCounts.education ? ['Education'] : []),
                  ...(sectionCounts.certificates ? ['Certificates'] : []),
                ]}
                data={[
                  ...Object.values(expByType),
                  ...(sectionCounts.education ? [sectionCounts.education] : []),
                  ...(sectionCounts.certificates ? [sectionCounts.certificates] : []),
                ]}
                colors={['#006a4e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Message Activity Timeline ── */}
      {recentMessages.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Message Activity</CardTitle>
            <CardDescription>Messages received over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: 'clamp(150px, 30vw, 220px)' }}>
              <DashboardLineChart messages={recentMessages} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Site Settings Quick View ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Settings</CardTitle>
          <CardDescription>Current configuration overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">AI Chatbot</p>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${siteSettings.chatbot_enabled !== 'false' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">{siteSettings.chatbot_enabled !== 'false' ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Provider</p>
              <p className="text-sm font-medium capitalize">{siteSettings.chatbot_provider || 'openrouter'}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="text-sm font-medium truncate">{siteSettings.chatbot_model || 'Not set'}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">API Key</p>
              <p className="text-sm font-medium">{siteSettings.chatbot_api_key ? '••••••••' : 'Not set'}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Primary Color</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: siteSettings.theme_primary_color || '#006a4e' }} />
                <span className="text-sm font-mono">{siteSettings.theme_primary_color || '#006a4e'}</span>
              </div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Accent Color</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: siteSettings.theme_accent_color || '#f42a41' }} />
                <span className="text-sm font-mono">{siteSettings.theme_accent_color || '#f42a41'}</span>
              </div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Telegram Bot</p>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${siteSettings.telegram_bot_token ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium">{siteSettings.telegram_bot_token ? 'Configured' : 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Site Name</p>
              <p className="text-sm font-medium truncate">{siteSettings.site_name || 'MD MUBAROK HOSIN'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Messages ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Messages</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onNavigate('messages')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="mt-0.5">
                    {msg.read ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm break-words">{msg.name}</span>
                      <Badge variant={msg.read ? 'secondary' : 'default'} className="text-xs">
                        {msg.read ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-words mt-0.5">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{msg.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Dashboard Chart Components (Chart.js)
// ============================================================

function DashboardLineChart({ messages }: { messages: ContactMessage[] }) {
  const { chartData, chartOptions } = useMemo(() => {
    const now = new Date()
    const days: string[] = []
    const counts: number[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      days.push(label)
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const dayEnd = dayStart + 86400000
      const count = messages.filter(m => {
        const t = new Date(m.createdAt).getTime()
        return t >= dayStart && t < dayEnd
      }).length
      counts.push(count)
    }

    const maxCount = Math.max(...counts, 1)
    return {
      chartData: {
        labels: days,
        datasets: [
          {
            label: 'Messages',
            data: counts,
            borderColor: '#006a4e',
            backgroundColor: 'rgba(0, 106, 78, 0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: '#006a4e',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            borderWidth: 3,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.9)',
            titleFont: { size: 13, weight: 'bold' as const },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items: any) => items[0]?.label || '',
              label: (ctx: any) => ` ${ctx.parsed.y} message${ctx.parsed.y !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, maxRotation: 45 },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { stepSize: 1, font: { size: 11 } },
            suggestedMax: maxCount + 1,
          },
        },
        animation: { duration: 1200, easing: 'easeOutQuart' as const },
      },
    }
  }, [messages])

  return <Line data={chartData} options={chartOptions} />
}

function DashboardDoughnutChart({ labels, data, colors }: { labels: string[]; data: number[]; colors: string[] }) {
  const total = data.reduce((a, b) => a + b, 0)
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderWidth: 0,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff',
      hoverOffset: 8,
    }],
  }), [labels, data, colors])
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} (${((ctx.parsed / total) * 100).toFixed(1)}%)`,
        },
      },
    },
    animation: { animateRotate: true, duration: 1200, easing: 'easeOutQuart' as const },
  }), [total])
  return (
    <div className="flex flex-col items-center gap-4 h-full justify-center">
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-2xl font-bold">{total}</span>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i] || colors[0] }} />
            <span>{label} ({data[i]})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardBarChart({ labels, data, color }: { labels: string[]; data: number[]; color: string }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Count',
      data,
      backgroundColor: color + 'CC',
      hoverBackgroundColor: color,
      borderRadius: 6,
      borderSkipped: false,
      barThickness: labels.length > 6 ? 20 : 32,
    }],
  }), [labels, data, color])
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1, font: { size: 11 } },
      },
    },
    animation: { duration: 1000, easing: 'easeOutQuart' as const },
  }), [])
  return <Bar data={chartData} options={chartOptions} />
}

function DashboardHorizontalBarChart({ labels, data, color }: { labels: string[]; data: number[]; color: string }) {
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Items',
      data,
      backgroundColor: labels.map((_, i) => {
        const alpha = 1 - (i * 0.08)
        return color + Math.round(alpha * 255).toString(16).padStart(2, '0')
      }),
      hoverBackgroundColor: color,
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 18,
    }],
  }), [labels, data, color])
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1, font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
    animation: { duration: 1000, easing: 'easeOutQuart' as const },
  }), [])
  return <Bar data={chartData} options={chartOptions} />
}

function DashboardPolarChart({ labels, data, colors }: { labels: string[]; data: number[]; colors: string[] }) {
  const total = data.reduce((a, b) => a + b, 0)
  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map((c) => c + 'BB'),
      hoverBackgroundColor: colors,
      borderWidth: 0,
    }],
  }), [labels, data, colors])
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed.r} (${((ctx.parsed.r / total) * 100).toFixed(1)}%)`,
        },
      },
    },
    scales: {
      r: {
        ticks: { display: false },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
    animation: { animateRotate: true, duration: 1200, easing: 'easeOutQuart' as const },
  }), [total])
  return (
    <div className="flex flex-col items-center gap-4 h-full justify-center">
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52">
        <PolarArea data={chartData} options={chartOptions} />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] || colors[0] }} />
            <span>{label} ({data[i]})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Messages Panel
// ============================================================

function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const fetchMessages = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/admin/contact?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        setTotalPages(data.totalPages)
        setUnreadCount(data.unreadCount)
      }
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages(page)
  }, [page, fetchMessages])

  const markAsRead = async (id: string) => {
    const token = getToken()
    const res = await fetch('/api/admin/contact', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, read: true }),
    })
    if (res.ok) {
      toast.success('Marked as read')
      fetchMessages(page)
    }
  }

  const markAsUnread = async (id: string) => {
    const token = getToken()
    const res = await fetch('/api/admin/contact', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, read: false }),
    })
    if (res.ok) {
      toast.success('Marked as unread')
      fetchMessages(page)
    }
  }

  const deleteMessage = async (id: string) => {
    const token = getToken()
    const res = await fetch(`/api/admin/contact?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      toast.success('Message deleted')
      setSelectedMessage(null)
      fetchMessages(page)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Contact Messages</h2>
          <p className="text-muted-foreground">
            {unreadCount} unread of {messages.length + (page - 1) * 10} shown
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Subject</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.filter((msg) => !searchQuery || msg.name.toLowerCase().includes(searchQuery.toLowerCase()) || msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) || msg.email.toLowerCase().includes(searchQuery.toLowerCase())).map((msg) => (
                        <TableRow
                          key={msg.id}
                          className={`cursor-pointer ${!msg.read ? 'bg-primary/5' : ''} ${selectedMessage?.id === msg.id ? 'bg-accent' : ''}`}
                          onClick={() => setSelectedMessage(msg)}
                        >
                          <TableCell>
                            <Badge variant={msg.read ? 'secondary' : 'default'} className="text-xs">
                              {msg.read ? 'Read' : 'New'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium break-words max-w-[150px] truncate">
                            {msg.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell break-words max-w-[200px] truncate">
                            {msg.subject}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {msg.read ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); markAsUnread(msg.id) }}
                                  title="Mark as unread"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); markAsRead(msg.id) }}
                                  title="Mark as read"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this message from {msg.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMessage(msg.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setPage(page - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= totalPages}
                          onClick={() => setPage(page + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message Detail</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessage ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">From</Label>
                    <p className="font-medium break-words">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground break-words">{selectedMessage.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground text-xs">Subject</Label>
                    <p className="font-medium break-words">{selectedMessage.subject}</p>
                  </div>
                  {selectedMessage.budget && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Budget</Label>
                      <p className="break-words">{selectedMessage.budget}</p>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground text-xs">Message</Label>
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap mt-1">{selectedMessage.message}</p>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    {selectedMessage.read ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => markAsUnread(selectedMessage.id)}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Mark Unread
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => markAsRead(selectedMessage.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark Read
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Message</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this message?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMessage(selectedMessage.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a message to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Settings Panel – Full Featured
// ============================================================

interface SettingsState {
  // AI Chatbot
  chatbot_enabled: string
  chatbot_provider: string
  chatbot_base_url: string
  chatbot_api_key: string
  chatbot_model: string
  chatbot_system_prompt: string
  chatbot_name: string
  // Theme Colors
  theme_primary_color: string
  theme_accent_color: string
  // Custom Font
  custom_font_url: string
  custom_font_family: string
  // Site Info
  site_name: string
  site_description: string
  // Telegram Bot
  telegram_bot_token: string
  telegram_chat_id: string
}

const DEFAULT_SETTINGS: SettingsState = {
  chatbot_enabled: 'true',
  chatbot_provider: 'openrouter',
  chatbot_base_url: '',
  chatbot_api_key: '',
  chatbot_model: '',
  chatbot_system_prompt: '',
  chatbot_name: "Mubarok's Assistant",
  theme_primary_color: '#006a4e',
  theme_accent_color: '#f42a41',
  custom_font_url: '',
  custom_font_family: '',
  site_name: 'MD MUBAROK HOSIN',
  site_description: 'Professional Portfolio',
  telegram_bot_token: '',
  telegram_chat_id: '',
}

const AI_PROVIDERS = [
  {
    id: 'openrouter',
    label: 'OpenRouter',
    sublabel: 'Works from all countries including Bangladesh',
    recommended: true,
  },
  {
    id: 'gemini',
    label: 'Google Gemini Direct',
    sublabel: 'Not available in Bangladesh',
    recommended: false,
  },
  {
    id: 'groq',
    label: 'Groq (Fast)',
    sublabel: 'Free tier available, works globally',
    recommended: false,
  },
  {
    id: 'openai',
    label: 'OpenAI',
    sublabel: 'GPT models, paid only',
    recommended: false,
  },
  {
    id: 'custom',
    label: 'Custom Provider',
    sublabel: 'Use your own OpenAI-compatible API endpoint',
    recommended: false,
  },
]

function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [changingEmail, setChangingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data: SiteSetting[] = await res.json()
        const loaded: SettingsState = { ...DEFAULT_SETTINGS }
        for (const s of data) {
          if (s.key in loaded) {
            (loaded as any)[s.key] = s.value
          }
        }
        setSettings(loaded)
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const update = (key: keyof SettingsState, value: string) => {
    // Auto-strip surrounding quotes from font family name to prevent invalid CSS
    let cleanValue = value
    if (key === 'custom_font_family') {
      cleanValue = value.trim().replace(/^["'`]+|["'`]+$/g, '')
    }
    setSettings((prev) => ({ ...prev, [key]: cleanValue }))
  }

  const buildSettingsArray = (): Array<{ key: string; value: string }> => {
    return Object.entries(settings).map(([key, value]) => ({ key, value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const token = getToken()
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: buildSettingsArray() }),
      })
      if (res.ok) {
        toast.success('✅ All settings saved successfully! Changes are live on the website.')
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async () => {
    setEmailError('')
    setEmailSuccess('')
    if (!emailPassword || !newEmail) {
      setEmailError('Password and new email are required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Invalid email format')
      return
    }
    setChangingEmail(true)
    try {
      const token = getToken()
      const res = await fetch('/api/admin/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: emailPassword, newEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        // Update token in localStorage with new email (so session stays valid)
        if (data.token) {
          localStorage.setItem('admin_token', data.token)
        }
        setEmailSuccess(`✅ Email updated to: ${data.newEmail}`)
        setNewEmail('')
        setEmailPassword('')
      } else {
        setEmailError(data.error || 'Failed to change email')
      }
    } catch {
      setEmailError('Network error')
    } finally {
      setChangingEmail(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    try {
      const token = getToken()
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('✅ Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch {
      setPasswordError('Network error')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground text-sm">Configure your portfolio site — AI Chatbot, Theme, Site Info, Telegram & Security</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          Save All Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════ */}
        {/*  AI CHATBOT CONTROL                            */}
        {/* ═══════════════════════════════════════════════ */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Chatbot Control</CardTitle>
            </div>
            <CardDescription>Enable/disable and configure the AI chatbot widget on your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable / Disable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">Enable AI Chatbot</p>
                <p className="text-xs text-muted-foreground">Show the chatbot widget on your website</p>
              </div>
              <Switch
                checked={settings.chatbot_enabled === 'true'}
                onCheckedChange={(checked) => update('chatbot_enabled', String(checked))}
              />
            </div>

            {/* Bot Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Chatbot Name</Label>
              <Input
                value={settings.chatbot_name || "Mubarok's Assistant"}
                onChange={(e) => update('chatbot_name', e.target.value)}
                placeholder="e.g. Mubarok's Assistant"
              />
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Setup (Select Provider)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => update('chatbot_provider', provider.id)}
                    className={`relative text-left p-4 rounded-lg border-2 transition-all ${
                      settings.chatbot_provider === provider.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {provider.recommended && (
                      <Badge className="absolute -top-2.5 right-2 text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
                        Recommended
                      </Badge>
                    )}
                    <p className="font-semibold text-sm">{provider.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{provider.sublabel}</p>
                    {settings.chatbot_provider === provider.id && (
                      <div className="absolute top-3 right-3">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Base URL, API Key, Model Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">Base URL</Label>
                <Input
                  value={settings.chatbot_base_url}
                  onChange={(e) => update('chatbot_base_url', e.target.value)}
                  placeholder={
                    settings.chatbot_provider === 'openrouter'
                      ? 'https://openrouter.ai/api/v1/chat/completions'
                      : settings.chatbot_provider === 'gemini'
                        ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
                        : settings.chatbot_provider === 'groq'
                          ? 'https://api.groq.com/openai/v1/chat/completions'
                          : settings.chatbot_provider === 'openai'
                            ? 'https://api.openai.com/v1/chat/completions'
                            : 'https://your-api-endpoint/v1/chat/completions'
                  }
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.chatbot_api_key}
                    onChange={(e) => update('chatbot_api_key', e.target.value)}
                    placeholder="sk-... or your API key"
                    className="font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Model Name</Label>
                <Input
                  value={settings.chatbot_model}
                  onChange={(e) => update('chatbot_model', e.target.value)}
                  placeholder={
                    settings.chatbot_provider === 'openrouter'
                      ? 'google/gemini-2.5-flash-preview-05-20'
                      : settings.chatbot_provider === 'gemini'
                        ? 'gemini-2.5-flash'
                        : settings.chatbot_provider === 'groq'
                          ? 'llama-3.3-70b-versatile'
                          : settings.chatbot_provider === 'openai'
                            ? 'gpt-4o-mini'
                            : 'model-name'
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Important Notes */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Important Notes</p>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                <li>Google Gemini direct API does NOT work from Bangladesh. Use OpenRouter instead.</li>
                <li>For OpenRouter, model names must include provider prefix (e.g., google/gemini-2.5-flash-preview-05-20)</li>
                <li>Get free OpenRouter API key from openrouter.ai/keys</li>
                <li>For Google Gemini direct (outside BD only): model name is just gemini-2.5-flash</li>
              </ul>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">System Prompt</Label>
              <Textarea
                value={settings.chatbot_system_prompt}
                onChange={(e) => update('chatbot_system_prompt', e.target.value)}
                placeholder="Your Name Is Ai Helper. You are a helpful assistant for MD MUBAROK HOSIN's portfolio website..."
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use the default system prompt with full portfolio knowledge.</p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/*  THEME COLORS                                  */}
        {/* ═══════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Theme Colors</CardTitle>
            </div>
            <CardDescription>Customize the primary and accent colors of your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ColorField
              label="Primary Color"
              value={settings.theme_primary_color}
              onChange={(v) => update('theme_primary_color', v)}
            />
            <ColorField
              label="Accent Color"
              value={settings.theme_accent_color}
              onChange={(v) => update('theme_accent_color', v)}
            />
            {/* Live Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="flex gap-3">
                <div className="h-12 flex-1 rounded-lg shadow-sm" style={{ backgroundColor: settings.theme_primary_color }} />
                <div className="h-12 flex-1 rounded-lg shadow-sm" style={{ backgroundColor: settings.theme_accent_color }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/*  CUSTOM FONT                                    */}
        {/* ═══════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Custom Font</CardTitle>
            </div>
            <CardDescription>Override the default SolaimanLipi font with any Google Fonts or custom web font</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Font CSS URL</Label>
              <Input
                value={settings.custom_font_url || ''}
                onChange={(e) => update('custom_font_url', e.target.value)}
                placeholder="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Paste the full CSS stylesheet link for any font (Google Fonts, cdnfonts, etc.)</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Font Family Name</Label>
              <Input
                value={settings.custom_font_family || ''}
                onChange={(e) => update('custom_font_family', e.target.value)}
                placeholder="Noto Sans Bengali"
              />
              <p className="text-xs text-muted-foreground">The CSS font-family name (e.g., &quot;Noto Sans Bengali&quot;, &quot;Hind Siliguri&quot;)</p>
            </div>
            {settings.custom_font_url && settings.custom_font_family && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-xs text-muted-foreground mb-1">Preview</p>
                <p className="text-lg font-semibold" style={{ fontFamily: `'${settings.custom_font_family}', SolaimanLipi, sans-serif` }}>
                  বাংলা ফন্ট প্রিভিউ — Hello World
                </p>
              </div>
            )}
            {(settings.custom_font_url || settings.custom_font_family) && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30"
                onClick={() => {
                  update('custom_font_url', '')
                  update('custom_font_family', '')
                }}
              >
                Reset to Default (SolaimanLipi)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/*  SITE INFO                                     */}
        {/* ═══════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Site Info</CardTitle>
            </div>
            <CardDescription>Basic information about your portfolio site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SingleField
              label="Site Name"
              value={settings.site_name}
              onChange={(v) => update('site_name', v)}
              placeholder="MD MUBAROK HOSIN"
            />
            <SingleField
              label="Site Description"
              value={settings.site_description}
              onChange={(v) => update('site_description', v)}
              placeholder="Professional Portfolio"
            />
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/*  TELEGRAM BOT                                  */}
        {/* ═══════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Telegram Bot</CardTitle>
            </div>
            <CardDescription>Configure your Telegram bot for contact notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Bot Token</Label>
              <Input
                type="password"
                value={settings.telegram_bot_token}
                onChange={(e) => update('telegram_bot_token', e.target.value)}
                placeholder="123456789:ABCDefGHIjklMNOpqrsTUVwxyz"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Chat ID</Label>
              <Input
                type="text"
                value={settings.telegram_chat_id}
                onChange={(e) => update('telegram_chat_id', e.target.value)}
                placeholder="1779607726"
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/*  ADMIN EMAIL                                   */}
        {/* ═══════════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Admin Email</CardTitle>
            </div>
            <CardDescription>Change the admin login email address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-lg space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Current Password</Label>
                <Input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">New Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                />
              </div>
              {emailError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{emailError}</p>
                </div>
              )}
              {emailSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4 shrink-0" />
                  <p>{emailSuccess}</p>
                </div>
              )}
              <Button onClick={handleChangeEmail} disabled={changingEmail} variant="outline">
                {changingEmail ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Mail className="h-4 w-4 mr-1.5" />}
                Change Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/*  ADMIN PASSWORD                                */}
        {/* ═══════════════════════════════════════════════ */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Admin Password</CardTitle>
            </div>
            <CardDescription>Change the admin panel login password. Make sure to remember it!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-lg space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">New Password</Label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Confirm New Password</Label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {passwordError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{passwordError}</p>
                </div>
              )}
              <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline">
                {changingPassword ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Shield className="h-4 w-4 mr-1.5" />}
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================
// Personal Info Section Editor
// ============================================================

function PersonalPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('personal')

  const update = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }))
  }

  const updateBio = (key: string, value: string | string[]) => {
    setData((prev: any) => ({
      ...prev,
      bio: { ...prev?.bio, [key]: value },
    }))
  }

  if (loading || !data) return <LoadingSkeleton />

  const bioFull = Array.isArray(data.bio?.full) ? data.bio.full : []
  const bioFullBn = Array.isArray(data.bio?.fullBn) ? data.bio.fullBn : []

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Personal Information"
        description="Edit your personal details and bio"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BilingualField
            label="Full Name"
            valueEn={data.name || ''}
            valueBn={data.nameBn || ''}
            onChangeEn={(v) => update('name', v)}
            onChangeBn={(v) => update('nameBn', v)}
          />
          <BilingualField
            label="First Name"
            valueEn={data.firstName || ''}
            valueBn={data.firstNameBn || ''}
            onChangeEn={(v) => update('firstName', v)}
            onChangeBn={(v) => update('firstNameBn', v)}
          />
          <BilingualField
            label="Title"
            valueEn={data.title || ''}
            valueBn={data.titleBn || ''}
            onChangeEn={(v) => update('title', v)}
            onChangeBn={(v) => update('titleBn', v)}
          />
          <BilingualField
            label="Tagline"
            valueEn={data.tagline || ''}
            valueBn={data.taglineBn || ''}
            onChangeEn={(v) => update('tagline', v)}
            onChangeBn={(v) => update('taglineBn', v)}
          />
          <Separator />
          <SingleField label="Email" value={data.email || ''} onChange={(v) => update('email', v)} type="email" />
          <SingleField label="Phone" value={data.phone || ''} onChange={(v) => update('phone', v)} />
          <BilingualField
            label="Location"
            valueEn={data.locationEn || ''}
            valueBn={data.location || ''}
            onChangeEn={(v) => update('locationEn', v)}
            onChangeBn={(v) => update('location', v)}
          />
          <BilingualField
            label="Availability"
            valueEn={data.availability || ''}
            valueBn={data.availabilityBn || ''}
            onChangeEn={(v) => update('availability', v)}
            onChangeBn={(v) => update('availabilityBn', v)}
          />
          <Separator />
          <SingleField label="Profile Image URL" value={data.profileImage || ''} onChange={(v) => update('profileImage', v)} />
          <SingleField label="Site Logo URL" value={data.siteLogo || ''} onChange={(v) => update('siteLogo', v)} />
          <SingleField label="Resume URL" value={data.resumeUrl || ''} onChange={(v) => update('resumeUrl', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bio</CardTitle>
          <CardDescription>Your short and full bio in both languages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BilingualField
            label="Short Bio"
            valueEn={data.bio?.short || ''}
            valueBn={data.bio?.shortBn || ''}
            onChangeEn={(v) => updateBio('short', v)}
            onChangeBn={(v) => updateBio('shortBn', v)}
            multiline
          />
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Full Bio (English)</Label>
            {bioFull.map((para: string, i: number) => (
              <div key={i} className="flex gap-2 items-start">
                <Textarea
                  value={para}
                  onChange={(e) => {
                    const updated = [...bioFull]
                    updated[i] = e.target.value
                    updateBio('full', updated)
                  }}
                  className="min-h-[80px] flex-1"
                  placeholder={`Paragraph ${i + 1}...`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive shrink-0 mt-0.5"
                  onClick={() => updateBio('full', bioFull.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateBio('full', [...bioFull, ''])}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Paragraph
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Full Bio (Bengali)</Label>
            {bioFullBn.map((para: string, i: number) => (
              <div key={i} className="flex gap-2 items-start">
                <Textarea
                  value={para}
                  onChange={(e) => {
                    const updated = [...bioFullBn]
                    updated[i] = e.target.value
                    updateBio('fullBn', updated)
                  }}
                  className="min-h-[80px] flex-1"
                  placeholder={`অনুচ্ছেদ ${i + 1}...`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive shrink-0 mt-0.5"
                  onClick={() => updateBio('fullBn', bioFullBn.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateBio('fullBn', [...bioFullBn, ''])}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Paragraph
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Services Section Editor
// ============================================================

const DEFAULT_SERVICE = {
  title: '',
  titleBn: '',
  description: '',
  descriptionBn: '',
  icon: 'bi-globe2',
  color: '#006a4e',
}

function ServicesPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('services')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_SERVICE }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Services"
        description="Manage your service offerings"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
              <Briefcase className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No services yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first service</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Title"
                valueEn={item.title || ''}
                valueBn={item.titleBn || ''}
                onChangeEn={(v) => updateItem(index, 'title', v)}
                onChangeBn={(v) => updateItem(index, 'titleBn', v)}
              />
              <BilingualField
                label="Description"
                valueEn={item.description || ''}
                valueBn={item.descriptionBn || ''}
                onChangeEn={(v) => updateItem(index, 'description', v)}
                onChangeBn={(v) => updateItem(index, 'descriptionBn', v)}
                multiline
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-globe2'
                />
                <ColorField
                  label="Color"
                  value={item.color || '#000000'}
                  onChange={(v) => updateItem(index, 'color', v)}
                />
              </div>
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Skills Section Editor
// ============================================================

const DEFAULT_SKILL = {
  name: '',
  icon: 'bi-code-slash',
  level: 80,
  color: '#61dafb',
  category: 'frontend',
  logoUrl: '',
}

function SkillsPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('skills')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_SKILL }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Skills"
        description="Manage your skills and proficiency levels"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Wrench className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No skills yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first skill</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label="Skill Name"
                  value={item.name || ''}
                  onChange={(v) => updateItem(index, 'name', v)}
                />
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-code-slash'
                />
              </div>
              <LevelField
                label="Proficiency Level"
                value={item.level || 0}
                onChange={(v) => updateItem(index, 'level', v)}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ColorField
                  label="Color"
                  value={item.color || '#000000'}
                  onChange={(v) => updateItem(index, 'color', v)}
                />
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={item.category || 'frontend'}
                    onValueChange={(v) => updateItem(index, 'category', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ImagePreviewField
                  label='Logo URL'
                  value={item.logoUrl || ''}
                  onChange={(v) => updateItem(index, 'logoUrl', v)}
                  placeholder='https://...'
                />
              </div>
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Projects Section Editor
// ============================================================

const DEFAULT_PROJECT = {
  title: '',
  titleBn: '',
  description: '',
  descriptionBn: '',
  tags: [],
  icon: 'bi-globe2',
  color: '#006a4e',
  liveUrl: '',
  codeUrl: '',
  featured: false,
  category: 'fullstack',
  projectLogo: '',
  coverImage: '',
}

function ProjectsPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('projects')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const updateTags = (index: number, tags: string[]) => {
    updateItem(index, 'tags', tags)
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_PROJECT }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Projects"
        description="Manage your portfolio projects"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Briefcase className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No projects yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first project</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <div className="flex items-center gap-3">
                <BilingualField
                  label="Title"
                  valueEn={item.title || ''}
                  valueBn={item.titleBn || ''}
                  onChangeEn={(v) => updateItem(index, 'title', v)}
                  onChangeBn={(v) => updateItem(index, 'titleBn', v)}
                />
              </div>
              <BilingualField
                label="Description"
                valueEn={item.description || ''}
                valueBn={item.descriptionBn || ''}
                onChangeEn={(v) => updateItem(index, 'description', v)}
                onChangeBn={(v) => updateItem(index, 'descriptionBn', v)}
                multiline
              />
              <TagsEditor tags={item.tags || []} onChange={(t) => updateTags(index, t)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-globe2'
                />
                <ColorField
                  label="Color"
                  value={item.color || '#000000'}
                  onChange={(v) => updateItem(index, 'color', v)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label="Live URL"
                  value={item.liveUrl || ''}
                  onChange={(v) => updateItem(index, 'liveUrl', v)}
                  placeholder="https://..."
                />
                <SingleField
                  label="Code URL"
                  value={item.codeUrl || ''}
                  onChange={(v) => updateItem(index, 'codeUrl', v)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImagePreviewField
                  label='Project Logo URL'
                  value={item.projectLogo || ''}
                  onChange={(v) => updateItem(index, 'projectLogo', v)}
                  placeholder='https://... (optional logo image)'
                />
                <ImagePreviewField
                  label='Cover Image URL'
                  value={item.coverImage || ''}
                  onChange={(v) => updateItem(index, 'coverImage', v)}
                  placeholder='https://... (optional cover image)'
                />
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!item.featured}
                    onCheckedChange={(v) => updateItem(index, 'featured', v)}
                  />
                  <Label className="text-sm font-medium">Featured Project</Label>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={item.category || 'fullstack'}
                    onValueChange={(v) => updateItem(index, 'category', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="fullstack">Full Stack</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {item.featured && (
                <Badge className="w-fit">Featured</Badge>
              )}
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Experiences Section Editor
// ============================================================

const DEFAULT_EXPERIENCE = {
  title: '',
  titleBn: '',
  company: '',
  period: '',
  periodBn: '',
  description: '',
  descriptionBn: '',
  icon: 'bi-briefcase-fill',
  type: 'full-time',
}

function ExperiencesPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('experiences')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_EXPERIENCE }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Experiences"
        description="Manage your work experience"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Briefcase className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No experiences yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first experience</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Job Title"
                valueEn={item.title || ''}
                valueBn={item.titleBn || ''}
                onChangeEn={(v) => updateItem(index, 'title', v)}
                onChangeBn={(v) => updateItem(index, 'titleBn', v)}
              />
              <SingleField
                label="Company"
                value={item.company || ''}
                onChange={(v) => updateItem(index, 'company', v)}
              />
              <BilingualField
                label="Period"
                valueEn={item.period || ''}
                valueBn={item.periodBn || ''}
                onChangeEn={(v) => updateItem(index, 'period', v)}
                onChangeBn={(v) => updateItem(index, 'periodBn', v)}
              />
              <BilingualField
                label="Description"
                valueEn={item.description || ''}
                valueBn={item.descriptionBn || ''}
                onChangeEn={(v) => updateItem(index, 'description', v)}
                onChangeBn={(v) => updateItem(index, 'descriptionBn', v)}
                multiline
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-briefcase-fill'
                />
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Type</Label>
                  <Select
                    value={item.type || 'full-time'}
                    onValueChange={(v) => updateItem(index, 'type', v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Education Section Editor
// ============================================================

const DEFAULT_EDUCATION = {
  degree: '',
  degreeBn: '',
  institution: '',
  institutionBn: '',
  period: '',
  periodBn: '',
  icon: 'bi-mortarboard-fill',
}

function EducationPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('education')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_EDUCATION }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Education"
        description="Manage your education history"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <GraduationCap className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No education entries yet</p>
            <p className="text-xs text-muted-foreground/60">Click "Add" to create your first education entry</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Degree"
                valueEn={item.degree || ''}
                valueBn={item.degreeBn || ''}
                onChangeEn={(v) => updateItem(index, 'degree', v)}
                onChangeBn={(v) => updateItem(index, 'degreeBn', v)}
              />
              <BilingualField
                label="Institution"
                valueEn={item.institution || ''}
                valueBn={item.institutionBn || ''}
                onChangeEn={(v) => updateItem(index, 'institution', v)}
                onChangeBn={(v) => updateItem(index, 'institutionBn', v)}
              />
              <BilingualField
                label="Period"
                valueEn={item.period || ''}
                valueBn={item.periodBn || ''}
                onChangeEn={(v) => updateItem(index, 'period', v)}
                onChangeBn={(v) => updateItem(index, 'periodBn', v)}
              />
              <IconPreviewField
                label='Icon Class'
                value={item.icon || ''}
                onChange={(v) => updateItem(index, 'icon', v)}
                placeholder='bi-mortarboard-fill'
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Testimonials Section Editor
// ============================================================

const DEFAULT_TESTIMONIAL = {
  name: '',
  role: '',
  roleBn: '',
  text: '',
  textBn: '',
  avatar: '',
}

function TestimonialsPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('testimonials')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_TESTIMONIAL }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Testimonials"
        description="Manage client testimonials"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <MessageSquareQuote className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No testimonials yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first testimonial</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label="Name"
                  value={item.name || ''}
                  onChange={(v) => updateItem(index, 'name', v)}
                />
                <SingleField
                  label="Avatar Initials"
                  value={item.avatar || ''}
                  onChange={(v) => updateItem(index, 'avatar', v)}
                  placeholder="AK"
                />
              </div>
              <BilingualField
                label="Role"
                valueEn={item.role || ''}
                valueBn={item.roleBn || ''}
                onChangeEn={(v) => updateItem(index, 'role', v)}
                onChangeBn={(v) => updateItem(index, 'roleBn', v)}
              />
              <BilingualField
                label="Testimonial Text"
                valueEn={item.text || ''}
                valueBn={item.textBn || ''}
                onChangeEn={(v) => updateItem(index, 'text', v)}
                onChangeBn={(v) => updateItem(index, 'textBn', v)}
                multiline
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Certificates Section Editor
// ============================================================

const DEFAULT_CERTIFICATE = {
  title: '',
  titleBn: '',
  issuer: '',
  issuerBn: '',
  date: '',
  icon: 'bi-award-fill',
  color: '#006a4e',
  url: '',
}

function CertificatesPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('certificates')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_CERTIFICATE }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Certificates"
        description="Manage your certificates and certifications"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Award className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No certificates yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first certificate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Title"
                valueEn={item.title || ''}
                valueBn={item.titleBn || ''}
                onChangeEn={(v) => updateItem(index, 'title', v)}
                onChangeBn={(v) => updateItem(index, 'titleBn', v)}
              />
              <BilingualField
                label="Issuer"
                valueEn={item.issuer || ''}
                valueBn={item.issuerBn || ''}
                onChangeEn={(v) => updateItem(index, 'issuer', v)}
                onChangeBn={(v) => updateItem(index, 'issuerBn', v)}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SingleField
                  label="Date"
                  value={item.date || ''}
                  onChange={(v) => updateItem(index, 'date', v)}
                  placeholder="2024"
                />
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-award-fill'
                />
                <ColorField
                  label="Color"
                  value={item.color || '#000000'}
                  onChange={(v) => updateItem(index, 'color', v)}
                />
              </div>
              <SingleField
                label="Certificate URL"
                value={item.url || ''}
                onChange={(v) => updateItem(index, 'url', v)}
                placeholder="https://..."
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// FAQ Section Editor
// ============================================================

const DEFAULT_FAQ = {
  question: '',
  questionBn: '',
  answer: '',
  answerBn: '',
}

function FaqPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('faq')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_FAQ }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="FAQ"
        description="Manage frequently asked questions"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <HelpCircle className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No FAQ items yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first FAQ item</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Question"
                valueEn={item.question || ''}
                valueBn={item.questionBn || ''}
                onChangeEn={(v) => updateItem(index, 'question', v)}
                onChangeBn={(v) => updateItem(index, 'questionBn', v)}
              />
              <BilingualField
                label="Answer"
                valueEn={item.answer || ''}
                valueBn={item.answerBn || ''}
                onChangeEn={(v) => updateItem(index, 'answer', v)}
                onChangeBn={(v) => updateItem(index, 'answerBn', v)}
                multiline
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Social Links Section Editor
// ============================================================

const DEFAULT_SOCIAL_LINK = {
  name: '',
  icon: 'bi-github',
  url: '',
}

function SocialLinksPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('socialLinks')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_SOCIAL_LINK }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Social Links"
        description="Manage your social media links"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Link2 className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No social links yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first social link</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label="Platform Name"
                  value={item.name || ''}
                  onChange={(v) => updateItem(index, 'name', v)}
                  placeholder="GitHub"
                />
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-github'
                />
              </div>
              <SingleField
                label="URL"
                value={item.url || ''}
                onChange={(v) => updateItem(index, 'url', v)}
                placeholder="https://..."
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Contact Info Section Editor
// ============================================================

const DEFAULT_CONTACT_INFO = {
  icon: 'bi-envelope-fill',
  title: '',
  titleBn: '',
  value: '',
  valueEn: '',
  link: '',
}

function ContactInfoPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('contactInfo')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_CONTACT_INFO }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contact Info"
        description="Manage your contact information"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Phone className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No contact info yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first contact info</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Title"
                valueEn={item.title || ''}
                valueBn={item.titleBn || ''}
                onChangeEn={(v) => updateItem(index, 'title', v)}
                onChangeBn={(v) => updateItem(index, 'titleBn', v)}
              />
              <BilingualField
                label="Value"
                valueEn={item.valueEn || ''}
                valueBn={item.value || ''}
                onChangeEn={(v) => updateItem(index, 'valueEn', v)}
                onChangeBn={(v) => updateItem(index, 'value', v)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-envelope-fill'
                />
                <SingleField
                  label="Link (optional)"
                  value={item.link || ''}
                  onChange={(v) => updateItem(index, 'link', v)}
                  placeholder="mailto:... or tel:..."
                />
              </div>
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Additional Tools Section Editor
// ============================================================

const DEFAULT_ADDITIONAL_TOOL = {
  name: '',
  icon: 'bi-tools',
  logoUrl: '',
}

function AdditionalToolsPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('additionalTools')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_ADDITIONAL_TOOL }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Additional Tools"
        description="Manage additional tools and technologies"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Wrench className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No additional tools yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first tool</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label="Tool Name"
                  value={item.name || ''}
                  onChange={(v) => updateItem(index, 'name', v)}
                />
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-tools'
                />
              </div>
              <ImagePreviewField
                label='Logo URL'
                value={item.logoUrl || ''}
                onChange={(v) => updateItem(index, 'logoUrl', v)}
                placeholder='https://...'
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Stats Section Editor
// ============================================================

const DEFAULT_STAT = {
  label: '',
  labelBn: '',
  value: 0,
  suffix: '+',
  icon: 'bi-code-slash',
}

function StatsPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('stats')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_STAT }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Stats"
        description="Manage your portfolio statistics"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <BarChart3 className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No stats yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first stat</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <BilingualField
                label="Label"
                valueEn={item.label || ''}
                valueBn={item.labelBn || ''}
                onChangeEn={(v) => updateItem(index, 'label', v)}
                onChangeBn={(v) => updateItem(index, 'labelBn', v)}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Value</Label>
                  <Input
                    type="number"
                    value={item.value || 0}
                    onChange={(e) => updateItem(index, 'value', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <SingleField
                  label="Suffix"
                  value={item.suffix || ''}
                  onChange={(v) => updateItem(index, 'suffix', v)}
                  placeholder="+"
                />
                <IconPreviewField
                  label='Icon Class'
                  value={item.icon || ''}
                  onChange={(v) => updateItem(index, 'icon', v)}
                  placeholder='bi-code-slash'
                />
              </div>
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Pages (Navigation) Section Editor
// ============================================================

const DEFAULT_PAGE = {
  id: '',
  label: '',
  labelBn: '',
  icon: 'bi-house-door-fill',
}

function PagesPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('pages')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_PAGE, id: `page_${Date.now()}` }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Navigation Pages"
        description="Manage the navigation menu pages"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Shield className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No pages yet</p>
            <p className="text-xs text-muted-foreground/60">Click \"Add\" to create your first page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <SingleField
                label="Page ID"
                value={item.id || ''}
                onChange={(v) => updateItem(index, 'id', v)}
                placeholder="home"
              />
              <BilingualField
                label="Label"
                valueEn={item.label || ''}
                valueBn={item.labelBn || ''}
                onChangeEn={(v) => updateItem(index, 'label', v)}
                onChangeBn={(v) => updateItem(index, 'labelBn', v)}
              />
              <IconPreviewField
                label='Icon Class'
                value={item.icon || ''}
                onChange={(v) => updateItem(index, 'icon', v)}
                placeholder='bi-house-door-fill'
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Skill Categories Section Editor
// ============================================================

const DEFAULT_SKILL_CATEGORY = {
  id: '',
  label: '',
  labelBn: '',
  icon: 'bi-grid-3x3-gap-fill',
}

function SkillCategoriesPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('skillCategories')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_SKILL_CATEGORY, id: `cat_${Date.now()}` }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Skill Categories"
        description="Manage skill category filters"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Wrench className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No skill categories yet</p>
            <p className="text-xs text-muted-foreground/60">Click "Add" to create your first skill category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <SingleField
                label="Category ID"
                value={item.id || ''}
                onChange={(v) => updateItem(index, 'id', v)}
                placeholder="frontend"
              />
              <BilingualField
                label="Label"
                valueEn={item.label || ''}
                valueBn={item.labelBn || ''}
                onChangeEn={(v) => updateItem(index, 'label', v)}
                onChangeBn={(v) => updateItem(index, 'labelBn', v)}
              />
              <IconPreviewField
                label='Icon Class'
                value={item.icon || ''}
                onChange={(v) => updateItem(index, 'icon', v)}
                placeholder='bi-display'
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Project Categories Section Editor
// ============================================================

const DEFAULT_PROJECT_CATEGORY = {
  id: '',
  label: '',
  labelBn: '',
  icon: 'bi-grid-3x3-gap-fill',
}

function ProjectCategoriesPanel() {
  const { data, setData, loading, saving, hasChanges, saveData, resetData } = usePortfolioSection('projectCategories')

  const items: any[] = Array.isArray(data) ? data : []

  const updateItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const addItem = () => {
    setData((prev: any) => [...prev, { ...DEFAULT_PROJECT_CATEGORY, id: `cat_${Date.now()}` }])
  }

  const removeItem = (index: number) => {
    setData((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const moveItem = (from: number, to: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const duplicateItem = (index: number) => {
    setData((prev: any) => {
      const updated = [...prev]
      const cloned = { ...updated[index] }
      // Generate new IDs for items that have them
      if (cloned.id) cloned.id = cloned.id + '_copy'
      updated.splice(index + 1, 0, cloned)
      return updated
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Project Categories"
        description="Manage project category filters"
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveData}
        onReset={resetData}
        onAdd={addItem}
        itemCount={items.length}
        exportData={data}
        onImportData={(imported) => setData(imported)}
      />

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="text-center py-20 text-muted-foreground">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4 shadow-inner">
                <Briefcase className="h-9 w-9 text-primary/30" />
            </div>
            <p className="text-sm font-semibold mb-1">No project categories yet</p>
            <p className="text-xs text-muted-foreground/60">Click "Add" to create your first project category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <ArrayItemCard
              key={index}
              index={index}
              total={items.length}
              onRemove={() => removeItem(index)}
              onMoveUp={() => moveItem(index, index - 1)}
              onMoveDown={() => moveItem(index, index + 1)}
              onDuplicate={() => duplicateItem(index)}
            >
              <SingleField
                label="Category ID"
                value={item.id || ''}
                onChange={(v) => updateItem(index, 'id', v)}
                placeholder="fullstack"
              />
              <BilingualField
                label="Label"
                valueEn={item.label || ''}
                valueBn={item.labelBn || ''}
                onChangeEn={(v) => updateItem(index, 'label', v)}
                onChangeBn={(v) => updateItem(index, 'labelBn', v)}
              />
              <IconPreviewField
                label='Icon Class'
                value={item.icon || ''}
                onChange={(v) => updateItem(index, 'icon', v)}
                placeholder='bi-layers-fill'
              />
            </ArrayItemCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Backup & Restore Panel
// ============================================================

function BackupPanel() {
  const [loading, setLoading] = useState(true)
  const [backupData, setBackupData] = useState<Record<string, any> | null>(null)
  const [backupSize, setBackupSize] = useState('')
  const [sections, setSections] = useState<Array<{ name: string; size: number }>>([])
  const [restoring, setRestoring] = useState(false)
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('merge')
  const [downloading, setDownloading] = useState(false)
  const [clearingSection, setClearingSection] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null)
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Cleanup state
  const [cleanupData, setCleanupData] = useState<{
    deadTopKeys: Array<{ key: string; size: string; sizeBytes: number }>
    orphanedPortfolioSections: Array<{ key: string; size: string; sizeBytes: number }>
    orphanedSettingKeys: Array<{ key: string; size: string; sizeBytes: number }>
    totalWaste: string
    totalWasteBytes: number
    scanTime: string
  } | null>(null)
  const [scanningDead, setScanningDead] = useState(false)
  const [cleaningDead, setCleaningDead] = useState(false)

  const token = getToken()

  // Load last backup time from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('last_backup_time')
    if (saved) setLastBackupTime(saved)
  }, [])

  // Load database overview
  useEffect(() => {
    async function loadOverview() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/backup', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setBackupData(data.data)
          const jsonStr = JSON.stringify(data.data)
          setBackupSize(formatBytes(new Blob([jsonStr]).size))
          // Count sections and sizes
          const secs = Object.entries(data.data || {}).map(([name, val]) => ({
            name,
            size: new Blob([JSON.stringify(val)]).size,
          })).sort((a, b) => b.size - a.size)
          setSections(secs)
        }
      } catch {
        toast.error('Failed to load database overview')
      } finally {
        setLoading(false)
      }
    }
    loadOverview()
  }, [token])

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Download full backup as JSON file
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        a.href = url
        a.download = `portfolio-backup-${timestamp}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        localStorage.setItem('last_backup_time', new Date().toISOString())
        setLastBackupTime(new Date().toISOString())
        toast.success('✅ Backup downloaded successfully!')
      } else {
        toast.error('Failed to download backup')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDownloading(false)
    }
  }

  // Preview uploaded file before restoring
  const handleFileSelect = async (file: File) => {
    setPreviewing(true)
    try {
      const text = await file.text()
      let parsed: any
      try {
        parsed = JSON.parse(text)
      } catch {
        toast.error('Invalid JSON file')
        setPreviewing(false)
        return
      }
      
      const dataToPreview = parsed._meta ? parsed.data : parsed
      if (!dataToPreview || typeof dataToPreview !== 'object') {
        toast.error('Invalid backup format')
        setPreviewing(false)
        return
      }
      
      // Send to preview endpoint
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: dataToPreview }),
      })
      
      if (res.ok) {
        const preview = await res.json()
        setPreviewData(preview)
        setPendingRestoreFile(file)
      } else {
        toast.error('Failed to preview backup')
      }
    } catch {
      toast.error('Failed to read file')
    } finally {
      setPreviewing(false)
    }
  }

  // Confirm restore after preview
  const handleConfirmRestore = async () => {
    if (!pendingRestoreFile) return
    setRestoring(true)
    try {
      const text = await pendingRestoreFile.text()
      let parsed = JSON.parse(text)
      const dataToRestore = parsed._meta ? parsed.data : parsed
      
      const res = await fetch('/api/admin/backup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: dataToRestore, mode: restoreMode }),
      })
      
      if (res.ok) {
        const result = await res.json()
        localStorage.setItem('last_backup_time', new Date().toISOString())
        toast.success(`✅ Database restored! ${result.sectionsRestored} sections (${result.mode})`)
        setPreviewData(null)
        setPendingRestoreFile(null)
        window.location.reload()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Restore failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setRestoring(false)
    }
  }

  // Download a single section as JSON
  const handleDownloadSection = async (sectionName: string) => {
    setDownloadingSection(sectionName)
    try {
      const res = await fetch(`/api/admin/backup?section=${encodeURIComponent(sectionName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        a.href = url
        a.download = `backup-${sectionName}-${timestamp}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(`✅ ${sectionName} section downloaded!`)
      } else {
        toast.error(`Failed to download ${sectionName}`)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDownloadingSection(null)
    }
  }

  // Clear a specific section
  const handleClearSection = async (sectionName: string) => {
    if (!confirm(`Are you sure you want to clear "${sectionName}"? This cannot be undone!`)) return
    setClearingSection(sectionName)
    try {
      const res = await fetch(`/api/admin/backup?section=${encodeURIComponent(sectionName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success(`✅ Section "${sectionName}" cleared`)
        window.location.reload()
      } else {
        toast.error('Failed to clear section')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setClearingSection(null)
    }
  }

  // Scan for dead/unnecessary data
  const handleScanDead = async () => {
    setScanningDead(true)
    try {
      const res = await fetch('/api/admin/cleanup', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCleanupData(data)
      } else {
        toast.error('Failed to scan database')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setScanningDead(false)
    }
  }

  // Delete detected dead data
  const handleCleanDead = async () => {
    if (!cleanupData) return
    const totalItems =
      cleanupData.deadTopKeys.length +
      cleanupData.orphanedPortfolioSections.length +
      cleanupData.orphanedSettingKeys.length
    if (totalItems === 0) {
      toast.info('No dead data found')
      return
    }
    if (!confirm(`Delete ${totalItems} dead item(s) (${cleanupData.totalWaste})? This cannot be undone!`)) return

    setCleaningDead(true)
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deadTopKeys: cleanupData.deadTopKeys.map(k => k.key),
          orphanedPortfolioSections: cleanupData.orphanedPortfolioSections.map(k => k.key),
          orphanedSettingKeys: cleanupData.orphanedSettingKeys.map(k => k.key),
        }),
      })
      if (res.ok) {
        const result = await res.json()
        toast.success(`✅ ${result.message}`)
        setCleanupData(null)
        window.location.reload()
      } else {
        toast.error('Cleanup failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setCleaningDead(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Backup & Restore</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Export and import your complete Firebase database. Use this for migration or disaster recovery.
        </p>
      </div>

      {/* Database Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Database Overview</CardTitle>
          </div>
          <CardDescription>Current Firebase Realtime Database status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">{sections.length}</p>
              <p className="text-xs text-muted-foreground">Sections</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">{backupSize}</p>
              <p className="text-xs text-muted-foreground">Total Size</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">{formatBytes(new Blob([JSON.stringify(backupData || {})]).size)}</p>
              <p className="text-xs text-muted-foreground">Raw Data</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">Firebase</p>
              <p className="text-xs text-muted-foreground">Backend</p>
            </div>
          </div>

          {lastBackupTime && (
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="text-xs font-medium mt-1">{new Date(lastBackupTime).toLocaleString()}</p>
            </div>
          )}

          {/* Section list */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sections</h3>
            <ScrollArea className="max-h-72 overflow-y-auto">
              <div className="space-y-1">
                {sections.map((sec) => (
                  <div key={sec.name} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <DatabaseBackup className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{sec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {formatBytes(sec.size)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-primary hover:bg-primary/10"
                        onClick={() => handleDownloadSection(sec.name)}
                        disabled={downloadingSection === sec.name}
                        title={`Download ${sec.name}`}
                      >
                        {downloadingSection === sec.name ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleClearSection(sec.name)}
                        disabled={clearingSection === sec.name}
                        title={`Clear ${sec.name}`}
                      >
                        {clearingSection === sec.name ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {sections.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Database is empty</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup (Download) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Create Backup</CardTitle>
            </div>
            <CardDescription>Download a complete snapshot of your Firebase database as a JSON file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">All {sections.length} sections will be included</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Includes users, settings, portfolio data & messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Timestamped backup file for version control</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Full Backup ({backupSize})
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Restore (Upload) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Restore Backup</CardTitle>
            </div>
            <CardDescription>Import a previously downloaded backup JSON file to restore your database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Restore Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Restore Mode</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    restoreMode === 'merge'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm font-semibold">Merge</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Keep existing data, add/update sections</p>
                </button>
                <button
                  onClick={() => setRestoreMode('replace')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    restoreMode === 'replace'
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-border hover:border-destructive/50'
                  }`}
                >
                  <p className="text-sm font-semibold">Replace</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Erase everything, use backup data only</p>
                </button>
              </div>
            </div>

            {restoreMode === 'replace' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  <strong>Warning:</strong> Replace mode will DELETE all current data and replace it with the backup.
                  This cannot be undone!
                </p>
              </div>
            )}

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const file = e.dataTransfer.files[0]
                if (file && file.name.endsWith('.json')) {
                  handleFileSelect(file)
                } else {
                  toast.error('Please upload a .json backup file')
                }
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click or drag & drop backup file</p>
              <p className="text-xs text-muted-foreground mt-1">.json files only</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>

            {previewing && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-primary font-medium">Previewing backup...</span>
              </div>
            )}
            {restoring && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-primary font-medium">Restoring database...</span>
              </div>
            )}
            {pendingRestoreFile && !restoring && !previewing && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                <Download className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate">{pendingRestoreFile.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restore Preview Dialog */}
      <AlertDialog open={!!previewData} onOpenChange={(open) => {
        if (!open) {
          setPreviewData(null)
          setPendingRestoreFile(null)
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Database Restore</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Sections: <strong>{previewData?.sectionCount}</strong></div>
                    <div>Size: <strong>{previewData?.totalSize}</strong></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Sections in backup:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewData?.sections.map((s: string) => (
                      <Badge key={s} variant={previewData?.knownSections?.includes(s) ? 'default' : 'secondary'} className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>Mode:</span>
                  <Badge variant={restoreMode === 'merge' ? 'default' : 'destructive'}>{restoreMode}</Badge>
                </div>
                {restoreMode === 'replace' && (
                  <p className="text-xs text-destructive font-medium">
                    ⚠️ This will DELETE all current data and replace it with the backup!
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPreviewData(null); setPendingRestoreFile(null) }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={restoring}
              className={restoreMode === 'replace' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {restoring ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Restoring...</>
              ) : (
                `Restore (${restoreMode})`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Database Cleanup — Dead Data Detection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Database Cleanup</CardTitle>
          </div>
          <CardDescription>
            Detect and remove unnecessary data from Firebase that the website doesn&apos;t use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Scans for: (1) unknown top-level nodes, (2) portfolio sections not in default data, (3) unused settings keys.
            Only data NOT used by the website will be detected.
          </p>

          {!cleanupData ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleScanDead}
              disabled={scanningDead}
            >
              {scanningDead ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning Database...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" />Scan for Dead Data</>
              )}
            </Button>
          ) : (
            <>
              {/* Scan Results */}
              <div className="space-y-3">
                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xl font-bold text-destructive">
                      {cleanupData.deadTopKeys.length}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Dead Top Keys</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xl font-bold text-destructive">
                      {cleanupData.orphanedPortfolioSections.length}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Orphaned Sections</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xl font-bold text-destructive">
                      {cleanupData.orphanedSettingKeys.length}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Unused Settings</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xl font-bold text-destructive">
                      {cleanupData.totalWaste}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Wasted Space</p>
                  </div>
                </div>

                {/* Dead Top Keys */}
                {cleanupData.deadTopKeys.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                      Dead Top-Level Keys
                    </p>
                    <ScrollArea className="max-h-36 overflow-y-auto">
                      <div className="space-y-1">
                        {cleanupData.deadTopKeys.map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                            <span className="text-sm font-mono font-medium">{item.key}</span>
                            <Badge variant="destructive" className="text-xs">{item.size}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Orphaned Portfolio Sections */}
                {cleanupData.orphanedPortfolioSections.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                      Orphaned Portfolio Sections
                    </p>
                    <ScrollArea className="max-h-36 overflow-y-auto">
                      <div className="space-y-1">
                        {cleanupData.orphanedPortfolioSections.map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                            <span className="text-sm font-mono font-medium">portfolio/{item.key}</span>
                            <Badge variant="destructive" className="text-xs">{item.size}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Orphaned Settings */}
                {cleanupData.orphanedSettingKeys.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                      Unused Setting Keys
                    </p>
                    <ScrollArea className="max-h-36 overflow-y-auto">
                      <div className="space-y-1">
                        {cleanupData.orphanedSettingKeys.map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                            <span className="text-sm font-mono font-medium">settings/{item.key}</span>
                            <Badge variant="destructive" className="text-xs">{item.size}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Clean result: nothing found */}
                {cleanupData.deadTopKeys.length === 0 &&
                 cleanupData.orphanedPortfolioSections.length === 0 &&
                 cleanupData.orphanedSettingKeys.length === 0 && (
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <Check className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Database is clean — no dead data found
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setCleanupData(null) }}
                >
                  Rescan
                </Button>
                {(cleanupData.deadTopKeys.length > 0 ||
                 cleanupData.orphanedPortfolioSections.length > 0 ||
                 cleanupData.orphanedSettingKeys.length > 0) && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCleanDead}
                    disabled={cleaningDead}
                  >
                    {cleaningDead ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                    ) : (
                      <><Trash2 className="mr-2 h-4 w-4" />Delete All Dead Data</>
                    )}
                  </Button>
                )}
              </div>

              {cleanupData.scanTime && (
                <p className="text-[11px] text-muted-foreground text-center">
                  Last scan: {new Date(cleanupData.scanTime).toLocaleString()}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </div>
          <CardDescription>Common database management operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDownload()}
              disabled={downloading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Backup
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload & Restore
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              onClick={() => handleClearSection('contactMessages')}
              disabled={clearingSection === 'contactMessages'}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Messages
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Main Admin Layout
// ============================================================

const NAV_ITEMS: Array<{ id: ActivePanel; label: string; icon: React.ReactNode; group?: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className='h-[18px] w-[18px]' /> },
  { id: 'messages', label: 'Messages', icon: <Mail className='h-[18px] w-[18px]' /> },
  { id: 'personal', label: 'Personal', icon: <UserCircle className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'services', label: 'Services', icon: <Globe className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'skills', label: 'Skills', icon: <Wrench className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'skillCategories', label: 'Skill Cats', icon: <Layers className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'additionalTools', label: 'Add. Tools', icon: <Wrench className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'projects', label: 'Projects', icon: <FolderOpen className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'projectCategories', label: 'Proj. Cats', icon: <Layers className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'experiences', label: 'Experience', icon: <Briefcase className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'education', label: 'Education', icon: <GraduationCap className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'certificates', label: 'Certificates', icon: <Award className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'faq', label: 'FAQ', icon: <HelpCircle className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'socialLinks', label: 'Social Links', icon: <Link2 className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'contactInfo', label: 'Contact Info', icon: <Phone className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'pages', label: 'Navigation', icon: <Menu className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className='h-[18px] w-[18px]' />, group: 'Content' },
  { id: 'settings', label: 'Settings', icon: <Settings className='h-[18px] w-[18px]' /> },
  { id: 'backup', label: 'Backup', icon: <DatabaseBackup className='h-[18px] w-[18px]' /> },
]

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(() => getAuthUser())
  const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({})
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const [pendingNav, setPendingNav] = useState<ActivePanel | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('admin:save'))
      }
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Fetch section counts after login
  useEffect(() => {
    if (!user) return
    async function fetchCounts() {
      try {
        const token = getToken()
        const res = await fetch('/api/admin/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const counts: Record<string, number> = {}
          for (const [section, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              counts[section] = value.length
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
              counts[section] = 1
            }
          }
          setSectionCounts(counts)
        }
      } catch {
        // silent
      }
    }
    fetchCounts()
  }, [user])

  // Scroll tracking for back-to-top
  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return
    const handleScroll = () => {
      setShowBackToTop(mainEl.scrollTop > 300)
    }
    mainEl.addEventListener('scroll', handleScroll)
    return () => mainEl.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (panel: ActivePanel) => {
    if (getGlobalHasChanges() && panel !== activePanel) {
      setPendingNav(panel)
      setUnsavedDialogOpen(true)
    } else {
      setActivePanel(panel)
      setSidebarOpen(false)
    }
  }

  const confirmNavigation = () => {
    if (pendingNav) {
      setActivePanel(pendingNav)
      setPendingNav(null)
    }
    setUnsavedDialogOpen(false)
    setSidebarOpen(false)
  }

  const cancelNavigation = () => {
    setPendingNav(null)
    setUnsavedDialogOpen(false)
  }

  const handleLogin = (u: AdminUser) => {
    setUser(u)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
    setActivePanel('dashboard')
    toast.success('Logged out successfully')
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Filter nav items based on search
  const filteredGeneralItems = searchQuery
    ? NAV_ITEMS.filter((i) => !i.group && i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : NAV_ITEMS.filter((i) => !i.group)
  const filteredPortfolioItems = searchQuery
    ? NAV_ITEMS.filter((i) => i.group === 'Content' && i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : NAV_ITEMS.filter((i) => i.group === 'Content')

  return (
    <div className="min-h-screen flex bg-background">
      {/* Unsaved Changes Dialog */}
      <AlertDialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to navigate away? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>Discard & Navigate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto h-screen overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
              <Input
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg"
              />
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <nav className="p-3 pt-1 space-y-0.5">
              {/* General Section */}
              {filteredGeneralItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left break-words ${
                    activePanel === item.id
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {sectionCounts[item.id] !== undefined && !searchQuery && (
                    <span className="text-[10px] tabular-nums opacity-70">{sectionCounts[item.id]}</span>
                  )}
                </button>
              ))}

              {/* Content Section Group */}
              {filteredPortfolioItems.length > 0 && (
                <div className="pt-5 pb-1.5">
                  <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    Content
                  </p>
                </div>
              )}
              {filteredPortfolioItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left break-words ${
                    activePanel === item.id
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {sectionCounts[item.id] !== undefined && !searchQuery && (
                    <span className="text-[10px] tabular-nums opacity-70">{sectionCounts[item.id]}</span>
                  )}
                </button>
              ))}
            </nav>
          </ScrollArea>

          {/* Keyboard Shortcut Hint & Logout */}
          <div className="p-3 border-t border-border/50 space-y-1">
            <p className="px-3 py-0.5 text-[10px] text-muted-foreground/40 hidden lg:block">
              <kbd className="px-1 py-0.5 rounded bg-muted/60 border border-border/50 font-mono text-[9px]">Ctrl</kbd>+<kbd className="px-1 py-0.5 rounded bg-muted/60 border border-border/50 font-mono text-[9px]">S</kbd> to save
            </p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-semibold tracking-tight">
                  {NAV_ITEMS.find((i) => i.id === activePanel)?.label || 'Admin'}
                </h1>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  {NAV_ITEMS.find((i) => i.id === activePanel)?.group === 'Content' ? 'Manage your content' : 'System management'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex text-xs font-medium">
                {user.role}
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main ref={mainRef} className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative">
          {activePanel === 'dashboard' && <DashboardPanel onNavigate={handleNavClick} />}
          {activePanel === 'messages' && <MessagesPanel />}
          {activePanel === 'settings' && <SettingsPanel />}
          {activePanel === 'personal' && <PersonalPanel />}
          {activePanel === 'services' && <ServicesPanel />}
          {activePanel === 'skills' && <SkillsPanel />}
          {activePanel === 'projects' && <ProjectsPanel />}
          {activePanel === 'experiences' && <ExperiencesPanel />}
          {activePanel === 'education' && <EducationPanel />}
          {activePanel === 'testimonials' && <TestimonialsPanel />}
          {activePanel === 'certificates' && <CertificatesPanel />}
          {activePanel === 'faq' && <FaqPanel />}
          {activePanel === 'socialLinks' && <SocialLinksPanel />}
          {activePanel === 'contactInfo' && <ContactInfoPanel />}
          {activePanel === 'additionalTools' && <AdditionalToolsPanel />}
          {activePanel === 'pages' && <PagesPanel />}
          {activePanel === 'skillCategories' && <SkillCategoriesPanel />}
          {activePanel === 'projectCategories' && <ProjectCategoriesPanel />}
          {activePanel === 'stats' && <StatsPanel />}
          {activePanel === 'backup' && <BackupPanel />}

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-20 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200"
              title="Back to top"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          )}
        </main>
      </div>
    </div>
  )
}
