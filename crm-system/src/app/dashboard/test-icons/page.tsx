'use client'

import { FileIcon, PNGIcon } from '@/components/ui/file-icons'

export default function TestIconsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-primary mb-4">Brand File Icons</h1>
        <p className="text-muted-foreground">Custom file icons using brand colors (#FDC600 and #080708)</p>
      </div>

      {/* PNG Icons with Brand Colors */}
      <div className="premium-card p-8">
        <h2 className="text-xl font-black text-foreground mb-6">PNG File Icons - Brand Style</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          <div className="text-center">
            <PNGIcon size="sm" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Small</p>
          </div>

          <div className="text-center">
            <PNGIcon size="md" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Medium</p>
          </div>

          <div className="text-center">
            <PNGIcon size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Large</p>
          </div>

          <div className="text-center">
            <PNGIcon size="xl" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Extra Large</p>
          </div>
        </div>
      </div>

      {/* File Types with Brand Colors */}
      <div className="premium-card p-8">
        <h2 className="text-xl font-black text-foreground mb-6">Various File Types</h2>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-6 items-center">
          <div className="text-center">
            <FileIcon type="PNG" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">PNG</p>
          </div>

          <div className="text-center">
            <FileIcon type="JPG" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">JPG</p>
          </div>

          <div className="text-center">
            <FileIcon type="PDF" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">PDF</p>
          </div>

          <div className="text-center">
            <FileIcon type="DOC" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">DOC</p>
          </div>

          <div className="text-center">
            <FileIcon type="XLS" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">XLS</p>
          </div>

          <div className="text-center">
            <FileIcon type="CSV" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">CSV</p>
          </div>

          <div className="text-center">
            <FileIcon type="JSON" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">JSON</p>
          </div>

          <div className="text-center">
            <FileIcon type="ZIP" size="lg" className="mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">ZIP</p>
          </div>
        </div>
      </div>

      {/* Brand Color Showcase */}
      <div className="premium-card p-8">
        <h2 className="text-xl font-black text-foreground mb-6">Brand Color Implementation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Primary Yellow (#FDC600)</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg"></div>
              <div>
                <p className="text-sm font-medium">Used for:</p>
                <p className="text-xs text-muted-foreground">PNG/JPG preview areas, primary accents</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Primary Black (#080708)</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-lg"></div>
              <div>
                <p className="text-sm font-medium">Used for:</p>
                <p className="text-xs text-muted-foreground">Icons, text, overlays</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="premium-card p-8">
        <h2 className="text-xl font-black text-foreground mb-6">Usage in File Lists</h2>

        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 rounded-lg border border-border/20 hover:border-primary/20 transition-colors">
            <PNGIcon size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">company-logo.png</p>
              <p className="text-xs text-muted-foreground">245 KB • Modified 2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-lg border border-border/20 hover:border-primary/20 transition-colors">
            <FileIcon type="PDF" size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">quarterly-report.pdf</p>
              <p className="text-xs text-muted-foreground">1.2 MB • Modified 1 day ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-lg border border-border/20 hover:border-primary/20 transition-colors">
            <FileIcon type="CSV" size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">user-data.csv</p>
              <p className="text-xs text-muted-foreground">890 KB • Modified 3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}