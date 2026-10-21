import 'dotenv/config'
import net from 'net'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Node >= 18.14 defaults autoSelectFamilyAttemptTimeout to 250ms.
// When querying remote databases (e.g. Neon in US-East-2) from regions with high latency,
// 250ms causes TCP connection attempts to time out prematurely (ETIMEDOUT).
if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === 'function') {
  net.setDefaultAutoSelectFamilyAttemptTimeout(3000)
}

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
