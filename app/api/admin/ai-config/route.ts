/**
 * Admin AI Configuration API
 * 
 * GET    /api/admin/ai-config - Get current AI configuration
 * POST   /api/admin/ai-config - Update AI configuration (MASTER_ADMIN only)
 * GET    /api/admin/ai-config/history - Get configuration change history
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireMasterAdmin, requireAdmin, unauthorized, forbidden } from '@/lib/rbac'
import { AiGlobalConfigSchema, DEFAULT_AI_GLOBALS } from '@/lib/ai/ai-config'
import { bustConfigCache } from '@/lib/ai/ai-service'

/**
 * GET /api/admin/ai-config
 * Get current AI configuration (ADMIN or MASTER_ADMIN)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and role
    const user = await requireAdmin()
    
    // Load config from database
    const config = await prisma.adminConfig.findUnique({
      where: { key: 'ai_globals' }
    })
    
    if (!config) {
      // Return defaults if not yet initialized
      return Response.json({
        config: DEFAULT_AI_GLOBALS,
        isDefault: true
      })
    }
    
    return Response.json({
      config: config.json,
      isDefault: false,
      updatedBy: config.updatedBy,
      updatedAt: config.updatedAt
    })
    
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorized()
    }
    if (error.message.includes('Forbidden')) {
      return forbidden(error.message)
    }
    
    console.error('[admin/ai-config] GET error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/ai-config
 * Update AI configuration (MASTER_ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and role (MASTER_ADMIN only)
    const user = await requireMasterAdmin()
    
    // Parse request body
    const body = await request.json()
    const { config, reason } = body
    
    // Validate configuration
    const validationResult = AiGlobalConfigSchema.safeParse(config)
    if (!validationResult.success) {
      return Response.json(
        { 
          error: 'Invalid configuration', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    // Get current config for history
    const currentConfig = await prisma.adminConfig.findUnique({
      where: { key: 'ai_globals' }
    })
    
    // Save to history if config exists
    if (currentConfig) {
      await prisma.adminConfigHistory.create({
        data: {
          key: 'ai_globals',
          json: currentConfig.json as any,
          updatedBy: user.id,
          reason: reason || 'Configuration updated'
        }
      })
    }
    
    // Update or create config
    const updatedConfig = await prisma.adminConfig.upsert({
      where: { key: 'ai_globals' },
      update: {
        json: validationResult.data as any,
        updatedBy: user.id
      },
      create: {
        key: 'ai_globals',
        json: validationResult.data as any,
        updatedBy: user.id
      }
    })
    
    // Bust the cache so new config is loaded immediately
    bustConfigCache()
    
    return Response.json({
      success: true,
      config: updatedConfig.json,
      updatedAt: updatedConfig.updatedAt
    })
    
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorized()
    }
    if (error.message.includes('Forbidden')) {
      return forbidden(error.message)
    }
    
    console.error('[admin/ai-config] POST error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
