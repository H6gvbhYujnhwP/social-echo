import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Import pdf-parse using require for CommonJS compatibility
const pdfParse = require('pdf-parse')

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

interface DocumentData {
  filename: string
  content: string
  uploadedAt: string
  fileType: string
}

// Extract text from PDF buffer
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Extract text from DOC/DOCX (simplified - just get text content)
async function extractDocText(buffer: Buffer): Promise<string> {
  // For DOCX, we'll use a simple text extraction
  // In production, you might want to use mammoth or similar
  const text = buffer.toString('utf-8')
  // Remove XML tags and clean up
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract text from plain text file
function extractTextFile(buffer: Buffer): string {
  return buffer.toString('utf-8')
}

// GET - Retrieve user's uploaded documents
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { documents: true }
    })

    const documents = (profile?.documents as any as DocumentData[]) || []

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST - Upload a new document
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text based on file type
    let extractedText: string
    try {
      if (file.type === 'application/pdf') {
        extractedText = await extractPdfText(buffer)
      } else if (file.type === 'text/plain') {
        extractedText = extractTextFile(buffer)
      } else {
        // DOC/DOCX
        extractedText = await extractDocText(buffer)
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      return NextResponse.json(
        { error: 'Failed to extract text from document' },
        { status: 400 }
      )
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Document appears to be empty or text could not be extracted' },
        { status: 400 }
      )
    }

    // Limit text length to prevent database bloat (max 50,000 characters)
    const truncatedText = extractedText.slice(0, 50000)

    // Get existing profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { documents: true }
    })

    const existingDocs = (profile?.documents as any as DocumentData[]) || []

    // Check if user already has 10 documents (limit)
    if (existingDocs.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 documents allowed. Please delete some documents first.' },
        { status: 400 }
      )
    }

    // Create new document object
    const newDocument: DocumentData = {
      filename: file.name,
      content: truncatedText,
      uploadedAt: new Date().toISOString(),
      fileType: file.type
    }

    // Update profile with new document
    const updatedDocs = [...existingDocs, newDocument]

    await prisma.profile.update({
      where: { userId },
      data: { documents: updatedDocs as any }
    })

    return NextResponse.json({
      success: true,
      document: {
        filename: newDocument.filename,
        uploadedAt: newDocument.uploadedAt,
        fileType: newDocument.fileType,
        contentLength: truncatedText.length
      }
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a document
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Get existing profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { documents: true }
    })

    const existingDocs = (profile?.documents as any as DocumentData[]) || []

    // Filter out the document to delete
    const updatedDocs = existingDocs.filter(doc => doc.filename !== filename)

    if (updatedDocs.length === existingDocs.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update profile
    await prisma.profile.update({
      where: { userId },
      data: { documents: updatedDocs as any }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}

