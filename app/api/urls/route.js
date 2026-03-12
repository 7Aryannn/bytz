import clientPromise from "@/lib/mongodb"
import { ObjectId } from 'mongodb'

export async function GET(request) {
    try {
        const client = await clientPromise
        const db = client.db("bytz")
        const collection = db.collection("url")
        
        const urls = await collection.find({}).sort({ _id: -1 }).toArray()
        
        return Response.json({ success: true, data: urls })
    } catch (error) {
        return Response.json({ success: false, error: true, message: 'Failed to fetch URLs' })
    }
}

export async function DELETE(request) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return Response.json({ success: false, message: 'Invalid request' })
        }

        const client = await clientPromise
        const db = client.db("bytz")
        const collection = db.collection("url")

        const objectIds = ids.map(id => new ObjectId(id));
        const result = await collection.deleteMany({ _id: { $in: objectIds } })
        
        return Response.json({ success: true, deletedCount: result.deletedCount })
    } catch (error) {
        return Response.json({ success: false, error: true, message: 'Failed to delete URLs' })
    }
}
