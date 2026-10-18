'use client'

import * as React from 'react'
import {
  Search,
  Grid,
  List,
  Folder as FolderIcon,
  FileText,
  FileSpreadsheet,
  FileVideo,
  FileCode,
  CheckCircle,
  MoreVertical,
  Upload,
} from 'lucide-react'

import {
  MOCK_FILES,
  MOCK_FOLDERS,
  MOCK_ACCOUNTS,
} from './interactive-preview-data'

export function InteractivePreview() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedAccount, setSelectedAccount] = React.useState<string>('all')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  const filteredFiles = MOCK_FILES.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAccount = selectedAccount === 'all' || file.account === selectedAccount
    return matchesSearch && matchesAccount
  })

  return (
    <section id="preview" className="py-20 sm:py-28 bg-surface-2/40 border-y border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-accent">
            Live Interactive Simulator
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Experience the Unified Workspace
          </p>
          <p className="mt-3 text-sm text-ink-2">
            Try searching or filtering below to see how files from multiple Google accounts are
            organized in one seamless interface.
          </p>
        </div>

        {/* Dashboard Mockup Frame */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-line bg-surface shadow-pop">
          {/* Mock Top App Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-canvas/60 px-6 py-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
              <input
                type="text"
                placeholder="Search across all connected Google accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-xs text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
            </div>

            {/* View Switcher Controls */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-line bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-1.5 transition-colors ${
                    viewMode === 'grid' ? 'bg-surface-2 text-accent' : 'text-ink-3 hover:text-ink'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded p-1.5 transition-colors ${
                    viewMode === 'list' ? 'bg-surface-2 text-accent' : 'text-ink-3 hover:text-ink'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mock Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-6 py-3 bg-surface">
            <span className="text-xs font-medium text-ink-3 mr-1">Filter by Account:</span>
            {MOCK_ACCOUNTS.map((chip) => {
              const isActive = selectedAccount === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedAccount(chip.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-accent-ink shadow-sm'
                      : 'border border-line bg-surface-2 text-ink-2 hover:bg-surface hover:text-ink'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>

          {/* Mock Stage Content */}
          <div className="p-6 relative min-h-[380px]">
            {/* Folder Section */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">
                Virtual Folders
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MOCK_FOLDERS.map((folder) => (
                  <div
                    key={folder.name}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 transition-all hover:bg-surface-2 hover:shadow-card cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <FolderIcon className="h-5 w-5 fill-accent/20" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-ink">{folder.name}</div>
                      <div className="text-[11px] text-ink-3">{folder.files} files • {folder.account}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Files Section */}
            <div>
              <div className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">
                Files ({filteredFiles.length})
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group rounded-2xl border border-line bg-surface p-4 transition-all hover:shadow-card hover:border-accent/40"
                    >
                      <div className="flex h-24 w-full items-center justify-center rounded-xl bg-surface-2 group-hover:bg-accent-soft/30 transition-colors">
                        {file.type === 'sheet' && <FileSpreadsheet className="h-8 w-8 text-[#0F9D58]" />}
                        {file.type === 'video' && <FileVideo className="h-8 w-8 text-[#E91E63]" />}
                        {file.type === 'pdf' && <FileText className="h-8 w-8 text-[#EA4335]" />}
                        {file.type === 'code' && <FileCode className="h-8 w-8 text-[#26A69A]" />}
                        {file.type === 'doc' && <FileText className="h-8 w-8 text-[#4285F4]" />}
                      </div>

                      <div className="mt-3">
                        <div className="truncate text-xs font-medium text-ink" title={file.name}>
                          {file.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-ink-3">
                          <span>{file.size}</span>
                          <span>{file.modified}</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-line">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: file.accountColor }}
                          />
                          <span className="truncate text-[10px] text-ink-2">{file.account}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-line bg-surface-2 text-ink-3 font-medium">
                      <tr>
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-4">Account</th>
                        <th className="py-2.5 px-4">Size</th>
                        <th className="py-2.5 px-4">Modified</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line bg-surface text-ink">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                            {file.type === 'sheet' && <FileSpreadsheet className="h-4 w-4 text-[#0F9D58]" />}
                            {file.type === 'video' && <FileVideo className="h-4 w-4 text-[#E91E63]" />}
                            {file.type === 'pdf' && <FileText className="h-4 w-4 text-[#EA4335]" />}
                            {file.type === 'code' && <FileCode className="h-4 w-4 text-[#26A69A]" />}
                            {file.type === 'doc' && <FileText className="h-4 w-4 text-[#4285F4]" />}
                            <span className="truncate max-w-xs">{file.name}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[11px]">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: file.accountColor }}
                              />
                              {file.account}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-ink-2">{file.size}</td>
                          <td className="py-2.5 px-4 text-ink-3">{file.modified}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button type="button" className="p-1 hover:text-accent" aria-label="More options">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Floating Upload Simulation Tray */}
            <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-pop text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-ink flex items-center gap-1.5">
                  <span>Smart Upload Routing</span>
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="text-[11px] text-ink-3">
                  Routing next file to <span className="font-medium text-ink-2">work@company.com</span> (Most free space)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

