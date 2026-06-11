import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const healthChecks: {
      database: { status: string; responseTimeMs: number; error?: string }
      users: { status: string; count: number; error?: string }
      leads: { status: string; count: number; error?: string }
      businesses: { status: string; count: number; error?: string }
      recentActivity: { status: string; count: number; error?: string }
      storage: { status: string; dbSizeBytes: number; dbSizeMB: number; error?: string }
      server: {
        status: string
        uptimeSeconds: number
        uptimeFormatted: string
        memoryUsage: {
          rss: number
          heapTotal: number
          heapUsed: number
          external: number
          arrayBuffers: number
        }
        memoryUsageMB: {
          rss: number
          heapTotal: number
          heapUsed: number
          external: number
          arrayBuffers: number
        }
      }
    } = {
      database: { status: 'down', responseTimeMs: 0 },
      users: { status: 'down', count: 0 },
      leads: { status: 'down', count: 0 },
      businesses: { status: 'down', count: 0 },
      recentActivity: { status: 'down', count: 0 },
      storage: { status: 'down', dbSizeBytes: 0, dbSizeMB: 0 },
      server: {
        status: 'healthy',
        uptimeSeconds: 0,
        uptimeFormatted: '',
        memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 },
        memoryUsageMB: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 },
      },
    }

    // ── 1. Database connectivity check ─────────────────────────────
    const dbStart = Date.now()
    try {
      await db.$queryRaw`SELECT 1`
      const dbResponseTime = Date.now() - dbStart
      healthChecks.database = {
        status: dbResponseTime < 500 ? 'healthy' : 'degraded',
        responseTimeMs: dbResponseTime,
      }
    } catch (dbError) {
      healthChecks.database = {
        status: 'down',
        responseTimeMs: Date.now() - dbStart,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed',
      }
    }

    // ── 2. User count ──────────────────────────────────────────────
    try {
      const userCount = await db.user.count()
      healthChecks.users = { status: 'healthy', count: userCount }
    } catch (error) {
      healthChecks.users = {
        status: 'down',
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to count users',
      }
    }

    // ── 3. Lead count ──────────────────────────────────────────────
    try {
      const leadCount = await db.lead.count()
      healthChecks.leads = { status: 'healthy', count: leadCount }
    } catch (error) {
      healthChecks.leads = {
        status: 'down',
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to count leads',
      }
    }

    // ── 4. Business count ──────────────────────────────────────────
    try {
      const businessCount = await db.business.count()
      healthChecks.businesses = { status: 'healthy', count: businessCount }
    } catch (error) {
      healthChecks.businesses = {
        status: 'down',
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to count businesses',
      }
    }

    // ── 5. Recent activity (last 24h) ─────────────────────────────
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentActivityCount = await db.activityLog.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      })
      healthChecks.recentActivity = { status: 'healthy', count: recentActivityCount }
    } catch (error) {
      healthChecks.recentActivity = {
        status: 'down',
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to count recent activity',
      }
    }

    // ── 6. Storage info (SQLite file size) ─────────────────────────
    try {
      const dbUrl = process.env.DATABASE_URL || ''
      // SQLite URLs look like: file:./db/dev.db or file:./prisma/dev.db
      const dbPathMatch = dbUrl.match(/file:(.+)/)
      let dbSizeBytes = 0

      if (dbPathMatch) {
        const relativePath = dbPathMatch[1]
        const absolutePath = path.resolve(process.cwd(), relativePath)
        if (fs.existsSync(absolutePath)) {
          const stats = fs.statSync(absolutePath)
          dbSizeBytes = stats.size
        }
      }

      // If we couldn't find the file from DATABASE_URL, try common locations
      if (dbSizeBytes === 0) {
        const commonPaths = [
          path.resolve(process.cwd(), 'db', 'dev.db'),
          path.resolve(process.cwd(), 'prisma', 'dev.db'),
          path.resolve(process.cwd(), 'db', 'app.db'),
          path.resolve(process.cwd(), 'prisma', 'app.db'),
        ]

        for (const p of commonPaths) {
          if (fs.existsSync(p)) {
            const stats = fs.statSync(p)
            dbSizeBytes = stats.size
            break
          }
        }
      }

      const dbSizeMB = parseFloat((dbSizeBytes / (1024 * 1024)).toFixed(2))
      healthChecks.storage = {
        status: dbSizeBytes > 0 ? 'healthy' : 'degraded',
        dbSizeBytes,
        dbSizeMB,
      }
    } catch (error) {
      healthChecks.storage = {
        status: 'degraded',
        dbSizeBytes: 0,
        dbSizeMB: 0,
        error: error instanceof Error ? error.message : 'Failed to check storage',
      }
    }

    // ── 7. Server uptime and memory ────────────────────────────────
    const uptimeSeconds = process.uptime()
    const days = Math.floor(uptimeSeconds / 86400)
    const hours = Math.floor((uptimeSeconds % 86400) / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = Math.floor(uptimeSeconds % 60)
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`

    const memUsage = process.memoryUsage()
    const bytesToMB = (bytes: number) => parseFloat((bytes / (1024 * 1024)).toFixed(2))

    healthChecks.server = {
      status: 'healthy',
      uptimeSeconds: parseFloat(uptimeSeconds.toFixed(2)),
      uptimeFormatted,
      memoryUsage: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      memoryUsageMB: {
        rss: bytesToMB(memUsage.rss),
        heapTotal: bytesToMB(memUsage.heapTotal),
        heapUsed: bytesToMB(memUsage.heapUsed),
        external: bytesToMB(memUsage.external),
        arrayBuffers: bytesToMB(memUsage.arrayBuffers),
      },
    }

    // ── Overall health status ──────────────────────────────────────
    const allStatuses = [
      healthChecks.database.status,
      healthChecks.users.status,
      healthChecks.leads.status,
      healthChecks.businesses.status,
      healthChecks.recentActivity.status,
      healthChecks.storage.status,
      healthChecks.server.status,
    ]

    let overallStatus: string
    if (allStatuses.every((s) => s === 'healthy')) {
      overallStatus = 'healthy'
    } else if (allStatuses.some((s) => s === 'down')) {
      overallStatus = 'down'
    } else {
      overallStatus = 'degraded'
    }

    return NextResponse.json({
      data: {
        overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthChecks,
      },
    })
  } catch (error) {
    console.error('Admin system health error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    )
  }
}
