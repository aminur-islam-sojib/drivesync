export interface MockFile {
  id: string
  name: string
  type: 'doc' | 'sheet' | 'video' | 'code' | 'pdf'
  size: string
  account: string
  accountColor: string
  modified: string
}

export const MOCK_FILES: MockFile[] = [
  {
    id: '1',
    name: '2026_Q3_Financial_Review.xlsx',
    type: 'sheet',
    size: '14.2 MB',
    account: 'work@company.com',
    accountColor: '#0F9D58',
    modified: '2 hours ago',
  },
  {
    id: '2',
    name: 'Family_Vacation_Photos.zip',
    type: 'doc',
    size: '1.2 GB',
    account: 'personal@gmail.com',
    accountColor: '#4285F4',
    modified: 'Yesterday',
  },
  {
    id: '3',
    name: 'Product_Demo_Walkthrough.mp4',
    type: 'video',
    size: '340 MB',
    account: 'work@company.com',
    accountColor: '#0F9D58',
    modified: '3 days ago',
  },
  {
    id: '4',
    name: 'Thesis_Final_Draft_Signed.pdf',
    type: 'pdf',
    size: '4.8 MB',
    account: 'student@university.edu',
    accountColor: '#F4B400',
    modified: 'Oct 14, 2026',
  },
  {
    id: '5',
    name: 'docker-compose.production.yml',
    type: 'code',
    size: '12 KB',
    account: 'personal@gmail.com',
    accountColor: '#4285F4',
    modified: 'Oct 10, 2026',
  },
]

export const MOCK_FOLDERS = [
  { name: 'Projects & Deliverables', files: 12, account: 'work@company.com' },
  { name: 'Personal Documents', files: 8, account: 'personal@gmail.com' },
  { name: 'Coursework & Research', files: 24, account: 'student@university.edu' },
]

export const MOCK_ACCOUNTS = [
  { id: 'all', label: 'All Accounts (3)' },
  { id: 'personal@gmail.com', label: '🔵 personal@gmail.com' },
  { id: 'work@company.com', label: '🟢 work@company.com' },
  { id: 'student@university.edu', label: '🟡 student@university.edu' },
]

