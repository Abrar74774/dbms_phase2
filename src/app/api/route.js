import conn from "@/lib/db";

export async function GET(req) {
    let result;
    try {
        const query = 'SELECT * FROM persons;' // This is the query string
        result = await conn.query(
            query
        );
        console.log("ttt", result);
    } catch (error) {
        console.error("this is the error", error);
    }

    return Response.json({ rows: result.rows, fields: result.fields })
}