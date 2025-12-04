# Database Migration Instructions

## Important: Run Prisma Migration

After implementing the media messaging system, you **MUST** run the following command to update your database schema:

```bash
npx prisma migrate dev --name add_batch_id_to_messages
```

This will:
1. Add the `batchId` field to the Messages table
2. Add an index on the `batchId` field for better query performance
3. Update the Prisma Client types

## What Changed in the Schema

The `Messages` model now includes:
- `batchId String? @db.VarChar(255)` - Groups multiple files sent together
- `@@index([batchId], map: "Messages_batchId_idx")` - Index for efficient querying

## After Migration

Once the migration is complete, the TypeScript errors in the following files will be resolved:
- `/app/api/messages/upload/route.ts`
- `/app/api/messages/upload-batch/route.ts`
- `/app/api/messages/[conversationID]/route.ts`

## Verify Migration

After running the migration, verify it worked by checking:
1. The Messages table in your database has the `batchId` column
2. The index `Messages_batchId_idx` exists
3. No TypeScript errors remain in the API routes
